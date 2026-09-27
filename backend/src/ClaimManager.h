#pragma once
#include "Models.h"
#include <unordered_map>
#include <vector>
#include <string>
#include <mutex>

class ClaimManager {
private:
    std::unordered_map<std::string, Claim> claims;
    int nextClaimId = 5000;
    std::string dataFile;
    std::mutex mtx;

    void loadData();
    void saveData();
    std::string getCurrentTime();
    std::string generateClaimId();

public:
    ClaimManager(const std::string& file);
    Claim* submitClaim(int itemId, const std::string& userNumber, const std::string& proofDescription, const std::vector<std::string>& proofFiles);
    
    std::vector<Claim> getUserClaims(const std::string& userNumber);
    Claim* getClaim(const std::string& claimId);
};
