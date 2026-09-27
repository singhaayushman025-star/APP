#pragma once
#include "Models.h"
#include <unordered_map>
#include <string>
#include <mutex>

class UserManager {
private:
    std::unordered_map<std::string, User> users;
    int nextUserId = 1000;
    std::string dataFile;
    std::mutex mtx;

    void loadData();
    void saveData();
    std::string generateUserNumber();
    std::string generateVerificationCode();
    std::string getCurrentTime();

public:
    UserManager(const std::string& file);
    User* registerUser(const std::string& name, const std::string& email, const std::string& phone, const std::string& password);
    User* loginUser(const std::string& email, const std::string& password);
    User* getUser(const std::string& userNumber);
    bool verifyEmail(const std::string& userNumber, const std::string& code);
    
    // Check if email already exists
    bool emailExists(const std::string& email);
};
