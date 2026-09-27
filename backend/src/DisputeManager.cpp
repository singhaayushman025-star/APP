#include "DisputeManager.h"
#include <fstream>
#include <iostream>
#include <chrono>
#include <iomanip>
#include <sstream>
#include <algorithm>

using json = nlohmann::json;

DisputeManager::DisputeManager(const std::string& file) : dataFile(file) {
    loadData();
}

std::string DisputeManager::getCurrentTime() {
    auto now = std::chrono::system_clock::now();
    auto in_time_t = std::chrono::system_clock::to_time_t(now);
    std::stringstream ss;
    ss << std::put_time(std::gmtime(&in_time_t), "%Y-%m-%dT%H:%M:%SZ");
    return ss.str();
}

void DisputeManager::loadData() {
    std::ifstream file(dataFile);
    if (!file.is_open()) return;

    try {
        json j;
        file >> j;
        for (auto& element : j["disputes"]) {
            DisputeReport d = element.get<DisputeReport>();
            disputes[d.reportId] = d;
            if (d.reportId.length() > 4 && d.reportId.substr(0, 4) == "DSP-") {
                try {
                    int idNum = std::stoi(d.reportId.substr(4));
                    if (idNum > nextReportId) {
                        nextReportId = idNum;
                    }
                } catch (...) {}
            }
        }
    } catch (const std::exception& e) {
        std::cerr << "Error loading disputes: " << e.what() << std::endl;
    }
}

void DisputeManager::saveData() {
    json j;
    j["disputes"] = json::array();
    for (const auto& pair : disputes) {
        j["disputes"].push_back(pair.second);
    }

    std::ofstream file(dataFile);
    if (file.is_open()) {
        file << j.dump(4);
    }
}

DisputeReport* DisputeManager::raiseDispute(int itemId, const std::string& claimId, const std::string& userNumber,
                                            const std::string& reporterName, const std::string& reporterContact,
                                            const std::string& reason, const std::string& evidenceDescription) {
    std::lock_guard<std::mutex> lock(mtx);
    nextReportId++;
    DisputeReport report;
    report.reportId = "DSP-" + std::to_string(nextReportId);
    report.itemId = itemId;
    report.claimId = claimId;
    report.reportedByUserNumber = userNumber;
    report.reporterName = reporterName;
    report.reporterContact = reporterContact;
    report.reason = reason;
    report.evidenceDescription = evidenceDescription;
    report.status = "Pending Investigation";
    report.createdAt = getCurrentTime();

    disputes[report.reportId] = report;
    saveData();
    return &disputes[report.reportId];
}

std::vector<DisputeReport> DisputeManager::getAllDisputes() {
    std::lock_guard<std::mutex> lock(mtx);
    std::vector<DisputeReport> result;
    for (const auto& pair : disputes) {
        result.push_back(pair.second);
    }
    std::sort(result.begin(), result.end(), [](const DisputeReport& a, const DisputeReport& b) {
        return a.createdAt > b.createdAt;
    });
    return result;
}

std::vector<DisputeReport> DisputeManager::getDisputesByItem(int itemId) {
    std::lock_guard<std::mutex> lock(mtx);
    std::vector<DisputeReport> result;
    for (const auto& pair : disputes) {
        if (pair.second.itemId == itemId) {
            result.push_back(pair.second);
        }
    }
    return result;
}

DisputeReport* DisputeManager::getDispute(const std::string& reportId) {
    std::lock_guard<std::mutex> lock(mtx);
    auto it = disputes.find(reportId);
    if (it != disputes.end()) {
        return &it->second;
    }
    return nullptr;
}

bool DisputeManager::updateStatus(const std::string& reportId, const std::string& status) {
    std::lock_guard<std::mutex> lock(mtx);
    auto it = disputes.find(reportId);
    if (it != disputes.end()) {
        it->second.status = status;
        saveData();
        return true;
    }
    return false;
}
