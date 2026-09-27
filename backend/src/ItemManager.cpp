#include "ItemManager.h"
#include <fstream>
#include <iostream>
#include <chrono>
#include <iomanip>
#include <sstream>
#include <algorithm>

using json = nlohmann::json;

ItemManager::ItemManager(const std::string& file) : dataFile(file) {
    loadData();
    runExpiry();
}

std::string ItemManager::getCurrentTime() {
    auto now = std::chrono::system_clock::now();
    auto in_time_t = std::chrono::system_clock::to_time_t(now);
    std::stringstream ss;
    ss << std::put_time(std::gmtime(&in_time_t), "%Y-%m-%dT%H:%M:%SZ");
    return ss.str();
}

void ItemManager::loadData() {
    std::ifstream file(dataFile);
    if (!file.is_open()) return;

    try {
        json j;
        file >> j;
        for (auto& element : j["items"]) {
            LostItem item = element.get<LostItem>();
            items[item.id] = item;
            if (item.id >= nextItemId) {
                nextItemId = item.id + 1;
            }
            if (item.status == "Lost") {
                lostQueue.push(item.id);
            } else if (item.status == "Found") {
                foundQueue.push(item.id);
            }
        }
    } catch (const std::exception& e) {
        std::cerr << "Error loading items: " << e.what() << std::endl;
    }
}

void ItemManager::saveData() {
    json j;
    j["items"] = json::array();
    for (const auto& pair : items) {
        j["items"].push_back(pair.second);
    }

    std::ofstream file(dataFile);
    if (file.is_open()) {
        file << j.dump(4);
    }
}

void ItemManager::runExpiry() {
    std::lock_guard<std::mutex> lock(mtx);
    auto now = std::chrono::system_clock::now();
    bool changed = false;

    // A simpler queue check: if front is expired, pop it
    while (!foundQueue.empty()) {
        int id = foundQueue.front();
        auto it = items.find(id);
        if (it != items.end() && it->second.status == "Found" && !it->second.expiryDate.empty()) {
            std::tm tm = {};
            std::istringstream ss(it->second.expiryDate);
            ss >> std::get_time(&tm, "%Y-%m-%dT%H:%M:%SZ");
            auto expiryTime = std::chrono::system_clock::from_time_t(std::mktime(&tm));
            
            if (now > expiryTime) {
                it->second.status = "Expired";
                changed = true;
                foundQueue.pop(); // Remove from queue
            } else {
                break; // Because queue is time-ordered, if the front isn't expired, the rest aren't either
            }
        } else {
            foundQueue.pop(); // Invalid or status changed
        }
    }

    if (changed) saveData();
}

LostItem* ItemManager::reportItem(const std::string& itemName, const std::string& category, const std::string& color, const std::string& description, const std::string& foundLocation, const std::string& dateFound, const std::string& reportedByUserNumber, const std::vector<std::string>& photos) {
    std::lock_guard<std::mutex> lock(mtx);
    
    LostItem item;
    item.id = nextItemId++;
    item.itemName = itemName;
    item.category = category;
    item.color = color;
    item.description = description;
    item.foundLocation = foundLocation;
    item.dateFound = dateFound;
    item.reportedByUserNumber = reportedByUserNumber;
    item.photos = photos;
    item.status = "Lost";
    item.claimedByUserNumber = "";
    item.foundAt = "";
    item.expiryDate = "";
    item.createdAt = getCurrentTime();

    items[item.id] = item;
    lostQueue.push(item.id);
    saveData();
    
    return &items[item.id];
}

std::vector<LostItem> ItemManager::getLostItems() {
    std::lock_guard<std::mutex> lock(mtx);
    std::vector<LostItem> result;
    for (const auto& pair : items) {
        if (pair.second.status == "Lost") {
            result.push_back(pair.second);
        }
    }
    std::sort(result.begin(), result.end(), [](const LostItem& a, const LostItem& b) {
        return a.createdAt > b.createdAt;
    });
    return result;
}

std::vector<LostItem> ItemManager::getFoundItems() {
    std::lock_guard<std::mutex> lock(mtx);
    std::vector<LostItem> result;
    for (const auto& pair : items) {
        if (pair.second.status == "Found") {
            result.push_back(pair.second);
        }
    }
    std::sort(result.begin(), result.end(), [](const LostItem& a, const LostItem& b) {
        return a.foundAt > b.foundAt;
    });
    return result;
}

LostItem* ItemManager::getItem(int id) {
    std::lock_guard<std::mutex> lock(mtx);
    auto it = items.find(id);
    if (it != items.end()) {
        return &it->second;
    }
    return nullptr;
}

// Convert string to lower case for case-insensitive search
std::string toLower(std::string str) {
    std::transform(str.begin(), str.end(), str.begin(), ::tolower);
    return str;
}

std::vector<LostItem> ItemManager::searchItems(const std::string& query) {
    std::lock_guard<std::mutex> lock(mtx);
    std::vector<LostItem> result;
    std::string q = toLower(query);
    
    for (const auto& pair : items) {
        if (pair.second.status == "Lost") {
            const auto& item = pair.second;
            if (toLower(item.itemName).find(q) != std::string::npos ||
                toLower(item.category).find(q) != std::string::npos ||
                toLower(item.color).find(q) != std::string::npos ||
                toLower(item.description).find(q) != std::string::npos ||
                toLower(item.foundLocation).find(q) != std::string::npos) {
                result.push_back(item);
            }
        }
    }
    return result;
}

std::vector<LostItem> ItemManager::filterItems(const std::string& category, const std::string& location, const std::string& color) {
    std::lock_guard<std::mutex> lock(mtx);
    std::vector<LostItem> result;
    
    for (const auto& pair : items) {
        if (pair.second.status == "Lost") {
            const auto& item = pair.second;
            if (!category.empty() && toLower(item.category) != toLower(category)) continue;
            if (!location.empty() && toLower(item.foundLocation).find(toLower(location)) == std::string::npos) continue;
            if (!color.empty() && toLower(item.color) != toLower(color)) continue;
            result.push_back(item);
        }
    }
    return result;
}

std::vector<LostItem> ItemManager::getUserReports(const std::string& userNumber) {
    std::lock_guard<std::mutex> lock(mtx);
    std::vector<LostItem> result;
    for (const auto& pair : items) {
        if (pair.second.reportedByUserNumber == userNumber) {
            result.push_back(pair.second);
        }
    }
    std::sort(result.begin(), result.end(), [](const LostItem& a, const LostItem& b) {
        return a.createdAt > b.createdAt;
    });
    return result;
}

void ItemManager::markItemFound(int itemId, const std::string& claimerUserNumber) {
    std::lock_guard<std::mutex> lock(mtx);
    auto it = items.find(itemId);
    if (it != items.end() && it->second.status == "Lost") {
        it->second.status = "Found";
        it->second.claimedByUserNumber = claimerUserNumber;
        
        auto now = std::chrono::system_clock::now();
        auto in_time_t = std::chrono::system_clock::to_time_t(now);
        std::stringstream ss;
        ss << std::put_time(std::gmtime(&in_time_t), "%Y-%m-%dT%H:%M:%SZ");
        it->second.foundAt = ss.str();
        
        // Expiry = now + 30 days
        auto expiry = now + std::chrono::hours(24 * 30);
        auto exp_time_t = std::chrono::system_clock::to_time_t(expiry);
        std::stringstream ss_exp;
        ss_exp << std::put_time(std::gmtime(&exp_time_t), "%Y-%m-%dT%H:%M:%SZ");
        it->second.expiryDate = ss_exp.str();
        
        foundQueue.push(itemId);
        saveData();
    }
}
