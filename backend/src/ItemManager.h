#pragma once
#include "Models.h"
#include <unordered_map>
#include <vector>
#include <string>
#include <mutex>
#include <queue>

class ItemManager {
private:
    std::unordered_map<int, LostItem> items;
    std::queue<int> lostQueue;
    std::queue<int> foundQueue;
    int nextItemId = 100;
    std::string dataFile;
    std::mutex mtx;

    void loadData();
    void saveData();
    std::string getCurrentTime();

public:
    ItemManager(const std::string& file);
    LostItem* reportItem(const std::string& itemName, const std::string& category, const std::string& color, const std::string& description, const std::string& foundLocation, const std::string& dateFound, const std::string& reportedByUserNumber, const std::vector<std::string>& photos);
    
    std::vector<LostItem> getLostItems();
    std::vector<LostItem> getFoundItems();
    LostItem* getItem(int id);
    
    std::vector<LostItem> searchItems(const std::string& query);
    std::vector<LostItem> filterItems(const std::string& category, const std::string& location, const std::string& color);
    std::vector<LostItem> getUserReports(const std::string& userNumber);
    
    void markItemFound(int itemId, const std::string& claimerUserNumber);
    void runExpiry(); // Automatic 30-day removal
};
