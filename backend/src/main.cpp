#include "crow.h"
#include "UserManager.h"
#include "ItemManager.h"
#include "ClaimManager.h"
#include "AuditManager.h"
#include "DisputeManager.h"

// Initialize managers
UserManager userManager("users.json");
ItemManager itemManager("items.json");
ClaimManager claimManager("claims.json");
AuditManager auditManager("audit_log.json");
DisputeManager disputeManager("disputes.json");

int main()
{
    // Create an App using Crow with CORS middleware enabled
    crow::App<crow::CORSHandler> app;

    // Handle CORS (Cross-Origin Resource Sharing)
    auto& cors = app.get_middleware<crow::CORSHandler>();
    cors
      .global()
        .headers("X-Custom-Header", "Upgrade-Insecure-Requests", "Content-Type", "Authorization")
        .methods("POST"_method, "GET"_method, "PUT"_method, "DELETE"_method, "OPTIONS"_method)
        .origin("*"); // Allow all origins for development

    // API Routes for Users
    
    // Register User
    CROW_ROUTE(app, "/api/users/register").methods(crow::HTTPMethod::POST)([](const crow::request& req){
        auto body = crow::json::load(req.body);
        if (!body) return crow::response(400, "Invalid JSON");
        
        std::string name = body["name"].s();
        std::string email = body["email"].s();
        std::string phone = body["phone"].s();
        std::string password = body["password"].s();
        
        if (userManager.emailExists(email)) {
            crow::json::wvalue res;
            res["error"] = "An account with this email already exists.";
            return crow::response(400, res);
        }
        
        User* user = userManager.registerUser(name, email, phone, password);
        auditManager.logAction(user->userNumber, "REGISTER_USER", user->userNumber, "User created account: " + user->email);
        
        crow::json::wvalue res;
        res["userNumber"] = user->userNumber;
        res["name"] = user->name;
        res["email"] = user->email;
        res["message"] = "User registered successfully. Verification code: " + user->verificationCode;
        return crow::response(201, res);
    });

    // Login User
    CROW_ROUTE(app, "/api/users/login").methods(crow::HTTPMethod::POST)([](const crow::request& req){
        auto body = crow::json::load(req.body);
        if (!body) return crow::response(400, "Invalid JSON");
        
        std::string email = body["email"].s();
        std::string password = body["password"].s();
        
        User* user = userManager.loginUser(email, password);
        if (!user) {
            crow::json::wvalue res;
            res["error"] = "Invalid email or password.";
            return crow::response(401, res);
        }
        
        if (!user->emailVerified) {
            crow::json::wvalue res;
            res["error"] = "Please verify your email first.";
            res["unverified"] = true;
            res["userNumber"] = user->userNumber;
            return crow::response(403, res);
        }
        
        auditManager.logAction(user->userNumber, "LOGIN", user->userNumber, "User logged in");
        
        crow::json::wvalue res;
        res["session"]["userNumber"] = user->userNumber;
        res["session"]["name"] = user->name;
        res["session"]["email"] = user->email;
        return crow::response(200, res);
    });

    // Verify Email
    CROW_ROUTE(app, "/api/users/verify").methods(crow::HTTPMethod::POST)([](const crow::request& req){
        auto body = crow::json::load(req.body);
        if (!body) return crow::response(400, "Invalid JSON");
        
        std::string userNumber = body["userNumber"].s();
        std::string code = body["code"].s();
        
        bool verified = userManager.verifyEmail(userNumber, code);
        crow::json::wvalue res;
        if (verified) {
            auditManager.logAction(userNumber, "VERIFY_EMAIL", userNumber, "Email verified successfully");
            res["message"] = "Email verified successfully.";
            return crow::response(200, res);
        } else {
            res["error"] = "Invalid verification code or already verified.";
            return crow::response(400, res);
        }
    });

    // Get User Profile
    CROW_ROUTE(app, "/api/users/<string>").methods(crow::HTTPMethod::GET)([](std::string userNumber){
        User* user = userManager.getUser(userNumber);
        if (!user) return crow::response(404, "User not found");
        
        nlohmann::json u = *user;
        u.erase("passwordHash");
        u.erase("verificationCode");
        return crow::response(200, u.dump());
    });

    // API Routes for Items
    
    // Get all lost items (Lost Queue)
    CROW_ROUTE(app, "/api/items/lost").methods(crow::HTTPMethod::GET)([](){
        itemManager.runExpiry();
        auto items = itemManager.getLostItems();
        return crow::response(nlohmann::json(items).dump());
    });

    // Get all found items (Found Queue)
    CROW_ROUTE(app, "/api/items/found").methods(crow::HTTPMethod::GET)([](){
        itemManager.runExpiry();
        auto items = itemManager.getFoundItems();
        return crow::response(nlohmann::json(items).dump());
    });

    // Search items
    CROW_ROUTE(app, "/api/items/search").methods(crow::HTTPMethod::GET)([](const crow::request& req){
        itemManager.runExpiry();
        std::string query = req.url_params.get("q") ? req.url_params.get("q") : "";
        auto items = itemManager.searchItems(query);
        return crow::response(nlohmann::json(items).dump());
    });
    
    // Filter items
    CROW_ROUTE(app, "/api/items/filter").methods(crow::HTTPMethod::GET)([](const crow::request& req){
        itemManager.runExpiry();
        std::string category = req.url_params.get("category") ? req.url_params.get("category") : "";
        std::string location = req.url_params.get("location") ? req.url_params.get("location") : "";
        std::string color = req.url_params.get("color") ? req.url_params.get("color") : "";
        auto items = itemManager.filterItems(category, location, color);
        return crow::response(nlohmann::json(items).dump());
    });

    // Get items reported by user
    CROW_ROUTE(app, "/api/users/<string>/reports").methods(crow::HTTPMethod::GET)([](std::string userNumber){
        auto items = itemManager.getUserReports(userNumber);
        return crow::response(nlohmann::json(items).dump());
    });

    // Report new item (enters Lost Queue)
    CROW_ROUTE(app, "/api/items/report").methods(crow::HTTPMethod::POST)([](const crow::request& req){
        auto body = nlohmann::json::parse(req.body, nullptr, false);
        if (body.is_discarded()) return crow::response(400, "Invalid JSON");

        std::vector<std::string> photos;
        if (body.contains("photos")) {
            for (auto& p : body["photos"]) photos.push_back(p.get<std::string>());
        }

        std::string userNumber = body.value("reportedByUserNumber", "GUEST");

        LostItem* item = itemManager.reportItem(
            body.value("itemName", ""),
            body.value("category", ""),
            body.value("color", ""),
            body.value("description", ""),
            body.value("foundLocation", ""),
            body.value("dateFound", ""),
            userNumber,
            photos
        );

        auditManager.logAction(userNumber, "REPORT_ITEM", "ITEM_" + std::to_string(item->id), "Reported item: " + item->itemName);

        return crow::response(201, nlohmann::json(*item).dump());
    });

    // Get item by ID
    CROW_ROUTE(app, "/api/items/<int>").methods(crow::HTTPMethod::GET)([](int id){
        LostItem* item = itemManager.getItem(id);
        if (!item) return crow::response(404, "Item not found");
        return crow::response(200, nlohmann::json(*item).dump());
    });

    // API Routes for Claims

    // Submit claim (moves item to Found Queue with 30-day expiry)
    CROW_ROUTE(app, "/api/claims").methods(crow::HTTPMethod::POST)([](const crow::request& req){
        auto body = nlohmann::json::parse(req.body, nullptr, false);
        if (body.is_discarded()) return crow::response(400, "Invalid JSON");

        int itemId = body.value("itemId", -1);
        std::string userNumber = body.value("userNumber", "");
        std::string proofDescription = body.value("proofDescription", "");
        
        std::vector<std::string> proofFiles;
        if (body.contains("proofFiles")) {
            for (auto& p : body["proofFiles"]) proofFiles.push_back(p.get<std::string>());
        }

        LostItem* item = itemManager.getItem(itemId);
        if (!item || item->status != "Lost") {
            crow::json::wvalue res;
            res["error"] = "Item not found or already claimed.";
            return crow::response(400, res);
        }

        Claim* claim = claimManager.submitClaim(itemId, userNumber, proofDescription, proofFiles);
        itemManager.markItemFound(itemId, userNumber);

        auditManager.logAction(userNumber, "CLAIM_ITEM", "ITEM_" + std::to_string(itemId), "Claim " + claim->claimId + " submitted for item #" + std::to_string(itemId));

        return crow::response(201, nlohmann::json(*claim).dump());
    });

    // Get user claims
    CROW_ROUTE(app, "/api/users/<string>/claims").methods(crow::HTTPMethod::GET)([](std::string userNumber){
        auto claims = claimManager.getUserClaims(userNumber);
        return crow::response(nlohmann::json(claims).dump());
    });

    // Get single claim
    CROW_ROUTE(app, "/api/claims/<string>").methods(crow::HTTPMethod::GET)([](std::string claimId){
        Claim* claim = claimManager.getClaim(claimId);
        if (!claim) return crow::response(404, "Claim not found");
        return crow::response(200, nlohmann::json(*claim).dump());
    });

    // API Routes for Disputes / Reports on Claimed Items
    
    // Raise a report / dispute on an already claimed item
    CROW_ROUTE(app, "/api/items/<int>/dispute").methods(crow::HTTPMethod::POST)([](const crow::request& req, int itemId){
        auto body = nlohmann::json::parse(req.body, nullptr, false);
        if (body.is_discarded()) return crow::response(400, "Invalid JSON");

        LostItem* item = itemManager.getItem(itemId);
        if (!item) return crow::response(404, "Item not found");

        std::string userNumber = body.value("userNumber", "GUEST");
        std::string reporterName = body.value("reporterName", "");
        std::string reporterContact = body.value("reporterContact", "");
        std::string reason = body.value("reason", "");
        std::string evidenceDescription = body.value("evidenceDescription", "");
        std::string claimId = body.value("claimId", "");

        DisputeReport* report = disputeManager.raiseDispute(itemId, claimId, userNumber, reporterName, reporterContact, reason, evidenceDescription);
        auditManager.logAction(userNumber, "DISPUTE_CLAIM", "ITEM_" + std::to_string(itemId), "Dispute " + report->reportId + " raised on item #" + std::to_string(itemId) + ": " + reason);

        return crow::response(201, nlohmann::json(*report).dump());
    });

    // Get all disputes
    CROW_ROUTE(app, "/api/disputes").methods(crow::HTTPMethod::GET)([](){
        auto disputes = disputeManager.getAllDisputes();
        return crow::response(nlohmann::json(disputes).dump());
    });

    // API Routes for Audit Trail
    CROW_ROUTE(app, "/api/audit").methods(crow::HTTPMethod::GET)([](){
        auto logs = auditManager.getAllLogs();
        return crow::response(nlohmann::json(logs).dump());
    });

    // Run manual 30-day expiry check
    CROW_ROUTE(app, "/api/items/cleanup-expired").methods(crow::HTTPMethod::POST)([](){
        itemManager.runExpiry();
        auditManager.logAction("SYSTEM", "EXPIRY_CLEANUP", "QUEUE", "Checked and cleaned up expired 30-day found queue items");
        crow::json::wvalue res;
        res["message"] = "Expiry cleanup executed successfully.";
        return crow::response(200, res);
    });

    // Define a simple route for the root
    CROW_ROUTE(app, "/")([](){
        return "Lost & Found API is running with DSA Queue Management & Audit Trail!";
    });

    // Define a health check / status route
    CROW_ROUTE(app, "/api/status")([](){
        crow::json::wvalue x;
        x["status"] = "success";
        x["message"] = "Lost & Found API is online and fully operational.";
        return x;
    });

    // Start the server on port 8080 with multi-threading
    app.port(8080).multithreaded().run();
}

