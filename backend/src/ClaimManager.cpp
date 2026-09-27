#include "ClaimManager.h"
#include <fstream>
#include <iostream>
#include <chrono>
#include <iomanip>
#include <sstream>
#include <algorithm>

using json = nlohmann::json;

ClaimManager::ClaimManager(const std::string& file) : dataFile(file) {
    loadData();
}

std::string ClaimManager::getCurrentTime() {
    auto now = std::chrono::system_clock::now();
    auto in_time_t = std::chrono::system_clock::to_time_t(now);
    std::stringstream ss;
    ss << std::put_time(std::gmtime(&in_time_t), "%Y-%m-%dT%H:%M:%SZ");
    return ss.str();
}

std::string ClaimManager::generateClaimId() {
    nextClaimId++;
    return "C" + std::to_string(nextClaimId);
}

void ClaimManager::loadData() {
    std::ifstream file(dataFile);
    if (!file.is_open()) return;

    try {
        json j;
        file >> j;
        for (auto& element : j["claims"]) {
            Claim c = element.get<Claim>();
            claims[c.claimId] = c;
            
            if (c.claimId.length() > 1) {
                int idNum = std::stoi(c.claimId.substr(1));
                if (idNum > nextClaimId) {
                    nextClaimId = idNum;
                }
            }
        }
    } catch (const std::exception& e) {
        std::cerr << "Error loading claims: " << e.what() << std::endl;
    }
}

void ClaimManager::saveData() {
    json j;
    j["claims"] = json::array();
    for (const auto& pair : claims) {
        j["claims"].push_back(pair.second);
    }

    std::ofstream file(dataFile);
    if (file.is_open()) {
        file << j.dump(4);
    }
}

Claim* ClaimManager::submitClaim(int itemId, const std::string& userNumber, const std::string& proofDescription, const std::vector<std::string>& proofFiles) {
    std::lock_guard<std::mutex> lock(mtx);
    
    Claim claim;
    claim.claimId = generateClaimId();
    claim.itemId = itemId;
    claim.userNumber = userNumber;
    claim.submittedAt = getCurrentTime();
    claim.status = "Submitted";
    claim.proofDescription = proofDescription;
    claim.proofFiles = proofFiles;

    claims[claim.claimId] = claim;
    saveData();
    
    return &claims[claim.claimId];
}

std::vector<Claim> ClaimManager::getUserClaims(const std::string& userNumber) {
    std::lock_guard<std::mutex> lock(mtx);
    std::vector<Claim> result;
    for (const auto& pair : claims) {
        if (pair.second.userNumber == userNumber) {
            result.push_back(pair.second);
        }
    }
    std::sort(result.begin(), result.end(), [](const Claim& a, const Claim& b) {
        return a.submittedAt > b.submittedAt;
    });
    return result;
}

Claim* ClaimManager::getClaim(const std::string& claimId) {
    std::lock_guard<std::mutex> lock(mtx);
    auto it = claims.find(claimId);
    if (it != claims.end()) {
        return &it->second;
    }
    return nullptr;
}
