#include "UserManager.h"
#include <fstream>
#include <iostream>
#include <chrono>
#include <random>
#include <iomanip>
#include <sstream>

using json = nlohmann::json;

UserManager::UserManager(const std::string& file) : dataFile(file) {
    loadData();
}

std::string UserManager::getCurrentTime() {
    auto now = std::chrono::system_clock::now();
    auto in_time_t = std::chrono::system_clock::to_time_t(now);
    std::stringstream ss;
    ss << std::put_time(std::gmtime(&in_time_t), "%Y-%m-%dT%H:%M:%SZ");
    return ss.str();
}

std::string UserManager::generateUserNumber() {
    nextUserId++;
    return "U" + std::to_string(nextUserId);
}

std::string UserManager::generateVerificationCode() {
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> distrib(100000, 999999);
    return std::to_string(distrib(gen));
}

void UserManager::loadData() {
    std::ifstream file(dataFile);
    if (!file.is_open()) return;

    try {
        json j;
        file >> j;
        for (auto& element : j["users"]) {
            User u = element.get<User>();
            users[u.userNumber] = u;
            // update nextUserId to the highest one
            int idNum = std::stoi(u.userNumber.substr(1));
            if (idNum > nextUserId) {
                nextUserId = idNum;
            }
        }
    } catch (const std::exception& e) {
        std::cerr << "Error loading users: " << e.what() << std::endl;
    }
}

void UserManager::saveData() {
    json j;
    j["users"] = json::array();
    for (const auto& pair : users) {
        j["users"].push_back(pair.second);
    }

    std::ofstream file(dataFile);
    if (file.is_open()) {
        file << j.dump(4);
    }
}

bool UserManager::emailExists(const std::string& email) {
    std::lock_guard<std::mutex> lock(mtx);
    for (const auto& pair : users) {
        if (pair.second.email == email) return true;
    }
    return false;
}

User* UserManager::registerUser(const std::string& name, const std::string& email, const std::string& phone, const std::string& password) {
    std::lock_guard<std::mutex> lock(mtx);
    
    // Basic duplicate check is done outside or via emailExists
    User newUser;
    newUser.userNumber = generateUserNumber();
    newUser.name = name;
    newUser.email = email;
    newUser.phone = phone;
    newUser.passwordHash = password; // plaintext for simplicity unless hashed
    newUser.emailVerified = false;
    newUser.verificationCode = generateVerificationCode();
    newUser.createdAt = getCurrentTime();

    users[newUser.userNumber] = newUser;
    saveData();
    
    return &users[newUser.userNumber];
}

User* UserManager::loginUser(const std::string& email, const std::string& password) {
    std::lock_guard<std::mutex> lock(mtx);
    for (auto& pair : users) {
        if (pair.second.email == email && pair.second.passwordHash == password) {
            return &pair.second;
        }
    }
    return nullptr;
}

User* UserManager::getUser(const std::string& userNumber) {
    std::lock_guard<std::mutex> lock(mtx);
    auto it = users.find(userNumber);
    if (it != users.end()) {
        return &it->second;
    }
    return nullptr;
}

bool UserManager::verifyEmail(const std::string& userNumber, const std::string& code) {
    std::lock_guard<std::mutex> lock(mtx);
    auto it = users.find(userNumber);
    if (it != users.end()) {
        if (it->second.verificationCode == code && !it->second.emailVerified) {
            it->second.emailVerified = true;
            saveData();
            return true;
        }
    }
    return false;
}
