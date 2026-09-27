#pragma once
#include "Models.h"
#include <vector>
#include <string>
#include <mutex>

class AuditManager {
private:
    std::vector<AuditLog> logs;
    int nextLogId = 1000;
    std::string dataFile;
    std::mutex mtx;

    void loadData();
    void saveData();
    std::string getCurrentTime();

public:
    AuditManager(const std::string& file);
    void logAction(const std::string& userNumber, const std::string& action, const std::string& targetId, const std::string& details = "");
    std::vector<AuditLog> getAllLogs();
    std::vector<AuditLog> getUserLogs(const std::string& userNumber);
};
