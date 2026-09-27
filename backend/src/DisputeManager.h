#pragma once
#include "Models.h"
#include <unordered_map>
#include <vector>
#include <string>
#include <mutex>

class DisputeManager {
private:
    std::unordered_map<std::string, DisputeReport> disputes;
    int nextReportId = 1000;
    std::string dataFile;
    std::mutex mtx;

    void loadData();
    void saveData();
    std::string getCurrentTime();

public:
    DisputeManager(const std::string& file);
    DisputeReport* raiseDispute(int itemId, const std::string& claimId, const std::string& userNumber,
                                const std::string& reporterName, const std::string& reporterContact,
                                const std::string& reason, const std::string& evidenceDescription);
    std::vector<DisputeReport> getAllDisputes();
    std::vector<DisputeReport> getDisputesByItem(int itemId);
    DisputeReport* getDispute(const std::string& reportId);
    bool updateStatus(const std::string& reportId, const std::string& status);
};
