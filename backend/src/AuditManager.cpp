#include "AuditManager.h"
#include <fstream>
#include <iostream>
#include <chrono>
#include <iomanip>
#include <sstream>
#include <algorithm>

using json = nlohmann::json;

AuditManager::AuditManager(const std::string& file) : dataFile(file) {
    loadData();
}

std::string AuditManager::getCurrentTime() {
    auto now = std::chrono::system_clock::now();
    auto in_time_t = std::chrono::system_clock::to_time_t(now);
    std::stringstream ss;
    ss << std::put_time(std::gmtime(&in_time_t), "%Y-%m-%dT%H:%M:%SZ");
    return ss.str();
}

void AuditManager::loadData() {
    std::ifstream file(dataFile);
    if (!file.is_open()) return;

    try {
        json j;
        file >> j;
        for (auto& element : j["logs"]) {
            AuditLog log = element.get<AuditLog>();
            logs.push_back(log);
            if (log.logId.length() > 1 && log.logId[0] == 'L') {
                try {
                    int idNum = std::stoi(log.logId.substr(1));
                    if (idNum > nextLogId) {
                        nextLogId = idNum;
                    }
                } catch (...) {}
            }
        }
    } catch (const std::exception& e) {
        std::cerr << "Error loading audit logs: " << e.what() << std::endl;
    }
}

void AuditManager::saveData() {
    json j;
    j["logs"] = json::array();
    for (const auto& log : logs) {
        j["logs"].push_back(log);
    }

    std::ofstream file(dataFile);
    if (file.is_open()) {
        file << j.dump(4);
    }
}

void AuditManager::logAction(const std::string& userNumber, const std::string& action, const std::string& targetId, const std::string& details) {
    std::lock_guard<std::mutex> lock(mtx);
    nextLogId++;
    AuditLog entry;
    entry.logId = "L" + std::to_string(nextLogId);
    entry.userNumber = userNumber.empty() ? "GUEST" : userNumber;
    entry.action = action;
    entry.targetId = targetId;
    entry.timestamp = getCurrentTime();
    entry.details = details;

    logs.push_back(entry);
    saveData();
}

std::vector<AuditLog> AuditManager::getAllLogs() {
    std::lock_guard<std::mutex> lock(mtx);
    auto result = logs;
    std::reverse(result.begin(), result.end());
    return result;
}

std::vector<AuditLog> AuditManager::getUserLogs(const std::string& userNumber) {
    std::lock_guard<std::mutex> lock(mtx);
    std::vector<AuditLog> result;
    for (const auto& log : logs) {
        if (log.userNumber == userNumber) {
            result.push_back(log);
        }
    }
    std::reverse(result.begin(), result.end());
    return result;
}
