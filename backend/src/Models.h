#pragma once
#include <string>
#include <vector>
#include <nlohmann/json.hpp>

struct User {
    std::string userNumber;
    std::string name;
    std::string email;
    std::string phone;
    std::string passwordHash;
    bool emailVerified;
    std::string verificationCode;
    std::string createdAt;
};

// Define JSON conversion for User
NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(User, userNumber, name, email, phone, passwordHash, emailVerified, verificationCode, createdAt)

struct LostItem {
    int id;
    std::string itemName;
    std::string category;
    std::string color;
    std::string description;
    std::string foundLocation;
    std::string dateFound;
    std::string reportedByUserNumber;
    std::vector<std::string> photos;
    std::string status;
    std::string claimedByUserNumber;
    std::string foundAt;
    std::string expiryDate;
    std::string createdAt;
};

// Define JSON conversion for LostItem
NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(LostItem, id, itemName, category, color, description, foundLocation, dateFound, reportedByUserNumber, photos, status, claimedByUserNumber, foundAt, expiryDate, createdAt)

struct Claim {
    std::string claimId;
    int itemId;
    std::string userNumber;
    std::string submittedAt;
    std::string status;
    std::string proofDescription;
    std::vector<std::string> proofFiles;
};

// Define JSON conversion for Claim
NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(Claim, claimId, itemId, userNumber, submittedAt, status, proofDescription, proofFiles)

struct AuditLog {
    std::string logId;
    std::string userNumber;
    std::string action;
    std::string targetId;
    std::string timestamp;
    std::string details;
};

// Define JSON conversion for AuditLog
NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(AuditLog, logId, userNumber, action, targetId, timestamp, details)

struct DisputeReport {
    std::string reportId;
    int itemId;
    std::string claimId;
    std::string reportedByUserNumber;
    std::string reporterName;
    std::string reporterContact;
    std::string reason;
    std::string evidenceDescription;
    std::string status;
    std::string createdAt;
};

// Define JSON conversion for DisputeReport
NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(DisputeReport, reportId, itemId, claimId, reportedByUserNumber, reporterName, reporterContact, reason, evidenceDescription, status, createdAt)
