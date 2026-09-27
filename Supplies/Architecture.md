# Lost & Found Management System
## Complete System Architecture & Actual Application Workflow

> **Project Type:** DSA & C++ Mini Project  
> **Frontend:** React.js  
> **Backend:** C++ REST API  
> **Core:** C++ STL Data Structures + File Handling  
> **Storage:** JSON files + local image storage  
> **Main Concept:** Users who find lost items report them; owners search the system and claim their items; user activity is recorded for traceability.

---

# 1. Project Overview

The **Lost & Found Management System** is a web application for managing lost and found items in a structured way.

The system works around a simple real-world process:

1. A person finds a lost item.
2. The finder opens the application and uploads the item's photo and details.
3. The item is added to the **Lost Queue**.
4. The actual owner searches the application for their lost item.
5. If the owner finds the correct item, they submit a **claim**.
6. The system records which user made the claim.
7. After the claim, the item is removed from the **Lost Queue** and moved to the **Found Queue**.
8. The item remains in the Found Queue for **30 days**.
9. After 30 days, the item is automatically removed from the active Found Queue/storage.
10. Because every account and claim is linked to a unique user number and verified email, the system can trace the user associated with a claim when an incorrect or suspicious claim needs investigation.

The project intentionally does **not** use Machine Learning or AI.

The main academic focus is:

> **React + C++ + Data Structures & Algorithms + File Handling**

---

# 2. Core Idea of the System

The application has two main item queues:

```text
                 NEW ITEM REPORT
                       |
                       v
                 +-----------+
                 | LOST QUEUE|
                 +-----------+
                       |
                       | Owner claims item
                       v
                 +-----------+
                 |FOUND QUEUE|
                 +-----------+
                       |
                       | 30 days
                       v
               AUTOMATIC REMOVAL
```

### Lost Queue

Contains items that are currently reported as lost and are available for owners to search.

### Found Queue

Contains items after a claim/found event. These records stay available for **30 days** and are then automatically removed.

---

# 3. Important Clarification About the User Roles

The system has two practical roles, but both can use the same application:

### Finder

The person who actually finds an item.

The finder can:

- Log in / create an account
- Verify their email
- Upload photos of the item
- Enter item details
- Submit the item to the system

### Owner / Claimer

The person who believes the listed item belongs to them.

The owner can:

- Log in / create an account
- Verify their email
- Search lost items
- View photos and descriptions
- Submit a claim
- Provide the required ownership information
- Track the claim

A user can be a finder for one item and an owner/claimer for another item.

---

# 4. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React.js | User interface |
| Styling | CSS | Layout and visual design |
| Frontend Communication | JavaScript `fetch()` / Axios | Sends requests to C++ |
| Backend | C++ | Main application logic |
| REST API | C++ HTTP framework such as Crow | Connects React with C++ |
| Data Structures | C++ STL | Queues, maps, vectors, hash maps |
| Structured Storage | JSON | Stores users, items, claims and metadata |
| File Storage | C++ file handling | Permanent local storage |
| Image Storage | `uploads/` directory | Stores actual uploaded photos |
| Version Control | Git + GitHub | Project management |

### Technologies intentionally removed

- Machine Learning
- Artificial Intelligence
- Python
- FastAPI
- PostgreSQL / MySQL
- Image recognition
- NLP
- AI-based matching

The project is centered around **C++ DSA and structured data management**.

---

# 5. High-Level System Architecture

```text
                         USERS
                           |
                           v
                  +-------------------+
                  |   React Frontend  |
                  |-------------------|
                  | Login / Signup    |
                  | Email Verify      |
                  | Report Item       |
                  | Search / Filter   |
                  | Claim Item        |
                  | View Photos       |
                  +---------+---------+
                            |
                       HTTP / REST
                            |
                            v
                  +-------------------+
                  |   C++ REST API    |
                  |    Controller     |
                  +---------+---------+
                            |
              +-------------+--------------+
              |             |              |
              v             v              v
      +-------------+ +-------------+ +-------------+
      | UserManager | | ItemManager | | ClaimManager|
      +------+------+ +------+------+ +------+------+
             |               |               |
             +---------------+---------------+
                             |
                             v
                  +-----------------------+
                  |     C++ STL / DSA     |
                  |-----------------------|
                  | unordered_map         |
                  | queue                 |
                  | map                   |
                  | vector                |
                  +-----------+-----------+
                              |
                     +--------+--------+
                     |                 |
                     v                 v
             +---------------+  +---------------+
             | JSON Files    |  | uploads/      |
             |---------------|  |---------------|
             | users.json    |  | item photos   |
             | items.json    |  | claim proofs  |
             | claims.json   |  | optional docs |
             | audit_log.json|  |               |
             +---------------+  +---------------+
```

---

# 6. Actual Application Workflow

## Step 1 — User Visits the Website

The user opens the React application.

The frontend provides:

- Home page
- Search
- Login / Signup
- Report Found Item
- My Reports
- My Claims
- User Profile

A user does not need to be the owner of the item to report it.

---

# 7. User Registration

A user creates an account before submitting reports or claims.

### Basic user information

```text
Full Name
Email
Phone Number
Password
```

The backend generates a **unique User Number**.

Example:

```text
User Number: U1024
Name: Rahul Sharma
Email: rahul@example.com
Phone: XXXXXXXX
```

The User Number becomes the main internal identifier.

---

# 8. Email Verification

Before the account becomes fully active, the user's email must be verified.

### Flow

```text
Signup
  |
  v
C++ creates user record
  |
  v
Verification code / link
  |
  v
User checks email
  |
  v
User verifies email
  |
  v
Account becomes verified
```

The user record can contain:

```cpp
struct User {
    std::string userNumber;
    std::string name;
    std::string email;
    std::string phone;
    std::string passwordHash;
    bool emailVerified;
    std::string createdAt;
};
```

> The backend should store a password hash rather than a plain-text password.

---

# 9. User Information Stored in the Backend

The system maintains a structured user record.

Example:

```json
{
  "userNumber": "U1024",
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "XXXXXXXXXX",
  "emailVerified": true,
  "createdAt": "2026-09-25T10:20:00"
}
```

The backend can also maintain an **activity/audit record** linked to the user.

Example activities:

- Account created
- Email verified
- Item reported
- Claim submitted
- Claim updated
- Claim withdrawn
- Item marked found

This is especially useful when the system needs to trace who performed a specific action.

---

# 10. Important Privacy / Data Design Rule

The system should distinguish between:

### Account data

Information needed to identify and authenticate a registered user.

### Activity data

Information about actions performed by that user.

For example:

```text
U1024
  |
  +-- Reported item 101
  +-- Claimed item 205
  +-- Updated claim 205
```

This gives the application traceability without putting unnecessary personal information on the public item listing.

Public users should generally see item information, not another user's private account data.

---

# 11. Finder Uploads a Lost Item

Suppose a user finds a black wallet in the college library.

They open:

```text
Report Found Item
```

and submit:

```text
Item Name: Wallet
Category: Personal
Color: Black
Description: Black leather wallet
Found Location: College Library
Date Found: 25-09-2026
Photos: wallet1.jpg, wallet2.jpg
```

The report is associated with the finder:

```text
Reported By: U1024
```

---

# 12. Photo Upload System

The finder can upload one or more photos.

### React

- Select files
- Preview images
- Submit form

### C++

- Validate the upload
- Generate unique file names
- Store the actual files in `/uploads/`
- Save the file paths inside the item record

Example:

```text
uploads/
├── item_101_1.jpg
├── item_101_2.jpg
```

The item record stores:

```json
"photos": [
  "uploads/item_101_1.jpg",
  "uploads/item_101_2.jpg"
]
```

So the photo is connected to the item through structured metadata.

---

# 13. Lost Queue

Every new reported item enters the **Lost Queue**.

```cpp
std::queue<int> lostQueue;
```

Example:

```text
Front                              Back
  |                                  |
  v                                  v
101 -> 102 -> 103 -> 104 -> 105
```

These are active items that owners can search.

### Lost Queue is used for

- New item reports
- Active search results
- Maintaining report order
- Keeping track of unresolved lost-item records

The item details themselves remain in the main C++ record store.

---

# 14. Main Item Data Structure

A lost-item record can be:

```cpp
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

    std::string foundAt;
    std::string expiryDate;
};
```

The `reportedByUserNumber` connects the item to the finder.

---

# 15. Main Storage

The primary in-memory collection can be:

```cpp
std::unordered_map<int, LostItem> items;
```

Example:

```text
101 -> Wallet
102 -> Mobile Phone
103 -> ID Card
104 -> Watch
```

### Why `unordered_map`?

It provides fast average-time lookup by item ID.

It becomes the main structured collection for the project's item records.

---

# 16. Other DSA Structures

## 16.1 `vector`

Used for:

- Multiple photo paths
- Lists of records
- Search results
- Reports

```cpp
std::vector<std::string> photos;
```

---

## 16.2 `map`

Used for indexes.

```cpp
std::map<std::string, std::vector<int>> categoryIndex;
std::map<std::string, std::vector<int>> locationIndex;
```

Example:

```text
Electronics -> 102, 108, 115
Documents   -> 103, 110
Bags        -> 104, 117
```

---

## 16.3 `queue`

Two major queues are used:

```cpp
std::queue<int> lostQueue;
std::queue<int> foundQueue;
```

### Lost Queue

Active reported items.

### Found Queue

Claimed/found items waiting for their 30-day retention period to finish.

---

# 17. Owner Searches for the Item

The actual owner opens the application and searches.

Possible search fields:

```text
Item Name
Category
Color
Location
Date
Keyword
```

Example:

```text
Search: Black Wallet
```

React sends the request to C++.

```text
React
  |
  v
GET /api/items/search
  |
  v
C++ ItemManager
  |
  v
DSA Search / Index
  |
  v
Matching item records
  |
  v
React displays results
```

The owner can open the item and view its photos and public details.

---

# 18. Claiming an Item

When the owner believes an item is theirs, they click:

```text
CLAIM ITEM
```

The claim is linked to the currently logged-in user.

Example:

```text
Claim ID: C5001
Item ID: 101
Claimed By: U2045
Submitted At: 25-09-2026 12:10
Status: Submitted
```

The important point is:

> **Every claim is linked to a unique user number.**

This allows the backend to identify exactly which account submitted the claim.

---

# 19. Claim Data Structure

A separate structure can be used:

```cpp
struct Claim {
    std::string claimId;

    int itemId;
    std::string userNumber;

    std::string submittedAt;

    std::string status;

    std::vector<std::string> proofFiles;
};
```

Possible claim statuses:

```text
Submitted
Under Review
Approved
Rejected
Withdrawn
```

---

# 20. Ownership Verification

The project can include a simple verification process without AI.

The user can provide information that only the real owner is expected to know.

Examples:

- Specific hidden feature
- Unique sticker/mark
- Serial number
- Purchase proof
- Description of contents
- Private identifying detail

The system can store the submitted proof with the claim.

Example:

```text
Claim
 |
 +-- Claiming User Number
 +-- Proof Details
 +-- Proof File
 +-- Submission Time
 +-- Status
```

This is a **rule-based / manual verification process**, not machine learning.

---

# 21. Claim Processing and Queue Movement

When the claim is accepted as a found/claimed item, the item moves:

```text
LOST QUEUE
     |
     | Claim
     v
FOUND QUEUE
```

The backend performs the following operations:

1. Find the item ID.
2. Record the claiming user's User Number.
3. Record the claim timestamp.
4. Remove the item ID from `lostQueue`.
5. Set status to `Found`.
6. Set `foundAt`.
7. Calculate `expiryDate = foundAt + 30 days`.
8. Add the item ID to `foundQueue`.
9. Save the updated item and claim records.

---

# 22. Found Queue

The Found Queue is:

```cpp
std::queue<int> foundQueue;
```

Example:

```text
Front
  |
  v
101 -> 106 -> 109 -> 112
                       ^
                       |
                      Back
```

Each item gets its own expiration date.

Example:

```text
Item 101
Found At: 25-09-2026
Expires: 25-10-2026
```

The item stays in the Found Queue for exactly **30 days**.

---

# 23. Why the Found Queue Exists

The Found Queue gives the system a temporary holding stage.

It represents:

```text
Claimed / Found
       |
       v
Temporary availability
       |
       v
30 days
       |
       v
Automatic removal
```

This prevents old found records from remaining indefinitely in the active system.

---

# 24. Automatic 30-Day Removal

The C++ backend includes:

```cpp
void removeExpiredFoundItems();
```

The function checks the front of `foundQueue`.

```text
Check front item
       |
       v
Is expiryDate passed?
       |
   +---+---+
   |       |
  YES      NO
   |        |
   v        v
Remove     Stop
   |
   v
Check next item
```

Because items enter the Found Queue in chronological order, the earliest item is at the front.

The cleanup can run:

- When the application starts
- Before returning Found Queue data
- At appropriate backend request times

---

# 25. Example of 30-Day Queue

```text
Found Queue

Front
  |
  v
101  ->  105  ->  109
 |        |        |
25 Oct   28 Oct   02 Nov
2026     2026     2026
```

Suppose today's date becomes:

```text
26-10-2026
```

Item 101 has expired.

The system removes:

```text
101
```

and then checks item 105.

---

# 26. What Happens if the Wrong Person Claims the Item?

This is where the user-tracking system becomes important.

Every claim contains:

```text
Claim ID
Item ID
User Number
Verified Email
Submission Time
Claim Status
```

Example:

```text
Item 101
   |
   +-- Claim C5001
           |
           +-- User: U2045
           +-- Email: user@example.com
           +-- Submitted: 25-09-2026
```

If the claim later turns out to be incorrect, the administrator can use the claim record to identify the account that made it.

The backend can then search:

```text
User Number
      |
      v
User Record
      |
      +-- Name
      +-- Verified Email
      +-- Phone
      +-- Account Creation Date
      +-- Previous System Activity
```

This creates an **audit trail** for claims.

---

# 27. User Activity / Audit Log

A dedicated audit log makes this traceability clearer.

```cpp
struct AuditLog {
    std::string logId;
    std::string userNumber;
    std::string action;
    std::string targetId;
    std::string timestamp;
};
```

Example:

```text
L001 | U2045 | CLAIM_ITEM   | ITEM_101 | 25-09-2026 12:10
L002 | U2045 | VIEW_ITEM    | ITEM_101 | 25-09-2026 12:05
L003 | U1024 | REPORT_ITEM  | ITEM_101 | 25-09-2026 10:32
```

This allows the project to answer:

- Who reported the item?
- Who claimed it?
- When was it claimed?
- Which user account performed the action?

---

# 28. Backend User Search

For tracing a user, the backend can use:

```cpp
std::unordered_map<std::string, User> users;
```

The User Number becomes the key.

Example:

```text
U1001 -> User
U1002 -> User
U1003 -> User
U2045 -> User
```

This makes user lookup fast.

---

# 29. Recommended Backend Data Files

The project can use separate structured JSON files:

```text
data/
├── users.json
├── items.json
├── claims.json
└── audit_log.json
```

And:

```text
uploads/
├── item_101_1.jpg
├── item_101_2.jpg
└── claim_C5001_proof.jpg
```

---

# 30. Example User Record

```json
{
  "userNumber": "U2045",
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "XXXXXXXXXX",
  "emailVerified": true,
  "createdAt": "2026-09-25T09:00:00"
}
```

---

# 31. Example Item Record

```json
{
  "id": 101,
  "itemName": "Black Wallet",
  "category": "Personal",
  "color": "Black",
  "description": "Black leather wallet",
  "foundLocation": "College Library",
  "dateFound": "2026-09-25",
  "reportedByUserNumber": "U1024",
  "photos": [
    "uploads/item_101_1.jpg",
    "uploads/item_101_2.jpg"
  ],
  "status": "Found",
  "claimedByUserNumber": "U2045",
  "foundAt": "2026-09-25T12:10:00",
  "expiryDate": "2026-10-25T12:10:00"
}
```

---

# 32. Example Claim Record

```json
{
  "claimId": "C5001",
  "itemId": 101,
  "userNumber": "U2045",
  "submittedAt": "2026-09-25T12:10:00",
  "status": "Submitted",
  "proofFiles": [
    "uploads/claim_C5001_proof.jpg"
  ]
}
```

---

# 33. REST API Design

React communicates with the C++ backend through REST APIs.

## User APIs

### Register

```http
POST /api/users/register
```

### Verify Email

```http
POST /api/users/verify-email
```

### Login

```http
POST /api/users/login
```

### Get User

```http
GET /api/users/{userNumber}
```

---

## Item APIs

### Report Found Item

```http
POST /api/items
```

Used to create a new report with item details and photos.

### Get Lost Items

```http
GET /api/items/lost
```

Returns active items from the Lost Queue.

### Get Found Items

```http
GET /api/items/found
```

Runs expiry cleanup and returns current Found Queue items.

### Get Item

```http
GET /api/items/{id}
```

### Search

```http
GET /api/items/search?q=wallet
```

### Filter

```http
GET /api/items/filter?category=Personal&location=Library
```

---

## Claim APIs

### Submit Claim

```http
POST /api/items/{id}/claim
```

### Get My Claims

```http
GET /api/users/{userNumber}/claims
```

### Get Claim

```http
GET /api/claims/{claimId}
```

### Admin / Management

```http
GET /api/claims
```

Used by authorized management functionality to review claim records.

---

## Queue APIs

### Lost Queue

```http
GET /api/queue/lost
```

### Found Queue

```http
GET /api/queue/found
```

The Found Queue endpoint should run `removeExpiredFoundItems()` before returning the current queue.

---

# 34. React Frontend Pages

The React application can contain:

## Home

- Search bar
- Recently reported items
- Lost Queue list
- Login/signup buttons

## Register

- Name
- Email
- Phone
- Password

## Email Verification

- Verification code/link flow

## Report Found Item

- Item name
- Category
- Color
- Description
- Found location
- Date
- Photo upload

## Item Details

- Photo gallery
- Item description
- Location
- Date
- Claim button

## Claim Item

- Claim form
- Ownership details
- Optional proof upload
- Submit claim

## My Claims

- Submitted claims
- Claim status
- Claim date

## My Reports

- Items reported by the current user
- Current status
- Queue state

## Found Queue

- Items currently in the 30-day Found Queue
- Remaining/expiry information

## Admin / Management

- User search
- Claim search
- Audit logs
- Queue status
- Expired-item cleanup information

---

# 35. Complete User Flow

```text
                 USER
                   |
                   v
              Register
                   |
                   v
            Email Verification
                   |
                   v
                Login
                   |
          +--------+--------+
          |                 |
          v                 v
     FINDER FLOW        OWNER FLOW
          |                 |
          v                 v
 Report Item            Search Items
          |                 |
 Upload Photos           View Photos
          |                 |
 Enter Details            Find Item
          |                 |
          v                 v
       C++ Backend       Claim Item
          |                 |
          v                 v
      LOST QUEUE      Record Claim
                            |
                            v
                    Move Item to
                     FOUND QUEUE
                            |
                            v
                         30 Days
                            |
                            v
                    Automatic Removal
```

---

# 36. Complete Queue Lifecycle

```text
         Finder reports item
                |
                v
          +-------------+
          | LOST QUEUE  |
          +-------------+
                |
                | Owner claims item
                v
          +-------------+
          | FOUND QUEUE |
          +-------------+
                |
                | 30 days
                v
         Automatic removal
```

### Lost Queue

- New reports enter here.
- Owners search these active records.
- Claiming a record removes it from this queue.
- The queue maintains active lost-report order.

### Found Queue

- Claimed/found items enter here.
- Each item receives a `foundAt` timestamp.
- Each item receives a 30-day `expiryDate`.
- Expired items are automatically removed.

---

# 37. C++ Class Design

## `User`

Represents one registered user.

```cpp
class User {
    std::string userNumber;
    std::string name;
    std::string email;
    std::string phone;
    bool emailVerified;
};
```

## `LostItem`

Represents one item record.

```cpp
class LostItem {
    int id;
    std::string itemName;
    std::string category;
    std::string description;
    std::vector<std::string> photos;
    std::string reportedByUserNumber;
    std::string claimedByUserNumber;
    std::string status;
    std::string foundAt;
    std::string expiryDate;
};
```

## `Claim`

Represents one claim.

```cpp
class Claim {
    std::string claimId;
    int itemId;
    std::string userNumber;
    std::string submittedAt;
    std::string status;
};
```

## `UserManager`

Handles:

- Registration
- Email verification
- Login
- User lookup

## `LostItemManager`

Handles:

- Lost Queue
- Found Queue
- Item records
- Search
- Filters
- Queue movement
- Expiry cleanup

## `ClaimManager`

Handles:

- Claim creation
- Claim lookup
- Claim status
- User-to-claim relationship

## `FileManager`

Handles:

- JSON save/load
- Image save/delete
- Claim proof files

## `AuditManager`

Handles:

- User activity
- Claim activity
- Report activity
- Traceability logs

## `ApiController`

Connects React with all C++ managers.

---

# 38. Suggested `LostItemManager` Structure

```cpp
class LostItemManager {
private:
    std::unordered_map<int, LostItem> items;

    std::queue<int> lostQueue;
    std::queue<int> foundQueue;

    std::map<std::string, std::vector<int>> categoryIndex;
    std::map<std::string, std::vector<int>> locationIndex;

public:
    void addItem(const LostItem& item);

    std::vector<LostItem> getLostItems();

    std::vector<LostItem> getFoundItems();

    LostItem* searchById(int id);

    std::vector<LostItem> searchByName(
        const std::string& name
    );

    std::vector<LostItem> filterByCategory(
        const std::string& category
    );

    std::vector<LostItem> filterByLocation(
        const std::string& location
    );

    bool claimItem(
        int itemId,
        const std::string& userNumber
    );

    void removeExpiredFoundItems();
};
```

---

# 39. Claim Function Concept

The claim function performs:

```text
Claim request
     |
     v
Validate user
     |
     v
Validate item
     |
     v
Create claim record
     |
     v
Store claimer user number
     |
     v
Remove from Lost Queue
     |
     v
status = Found
     |
     v
foundAt = now
     |
     v
expiryDate = now + 30 days
     |
     v
Push item ID into Found Queue
     |
     v
Save JSON
     |
     v
Create audit log
```

---

# 40. Handling Removal from `std::queue`

A normal `std::queue` does not provide direct access to an arbitrary middle element.

So if item `102` must be removed:

```text
Original:
101 -> 102 -> 103 -> 104
```

the backend can rebuild the queue:

```text
temporary queue

101 -> keep
102 -> remove
103 -> keep
104 -> keep
```

Result:

```text
101 -> 103 -> 104
```

This can be discussed during the DSA viva as a practical limitation of the queue data structure.

---

# 41. File Structure

```text
LostAndFound/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ItemCard.jsx
│   │   │   ├── ItemForm.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── PhotoGallery.jsx
│   │   │   └── ClaimForm.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── VerifyEmail.jsx
│   │   │   ├── ReportItem.jsx
│   │   │   ├── ItemDetails.jsx
│   │   │   ├── MyClaims.jsx
│   │   │   ├── MyReports.jsx
│   │   │   └── FoundQueue.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   └── App.jsx
│   │
│   └── package.json
│
├── backend/
│   ├── include/
│   │   ├── User.h
│   │   ├── LostItem.h
│   │   ├── Claim.h
│   │   ├── UserManager.h
│   │   ├── LostItemManager.h
│   │   ├── ClaimManager.h
│   │   ├── FileManager.h
│   │   ├── AuditManager.h
│   │   └── ApiController.h
│   │
│   ├── src/
│   │   ├── main.cpp
│   │   ├── UserManager.cpp
│   │   ├── LostItemManager.cpp
│   │   ├── ClaimManager.cpp
│   │   ├── FileManager.cpp
│   │   ├── AuditManager.cpp
│   │   └── ApiController.cpp
│   │
│   └── CMakeLists.txt
│
├── data/
│   ├── users.json
│   ├── items.json
│   ├── claims.json
│   └── audit_log.json
│
├── uploads/
│   ├── item_101_1.jpg
│   ├── item_101_2.jpg
│   └── claim_C5001_proof.jpg
│
└── README.md
```

---

# 42. Data Flow for Reporting an Item

```text
Finder
  |
  v
React Form
  |
  | item fields + photos
  v
POST /api/items
  |
  v
C++ API Controller
  |
  v
LostItemManager
  |
  +----> Save image files
  |
  +----> Create LostItem
  |
  +----> Add to unordered_map
  |
  +----> Push ID to lostQueue
  |
  +----> Update category/location indexes
  |
  +----> Save items.json
  |
  +----> Write audit log
```

---

# 43. Data Flow for Claiming an Item

```text
Owner
  |
  v
React Item Page
  |
  v
Claim Form
  |
  v
POST /api/items/{id}/claim
  |
  v
C++ ClaimManager
  |
  +----> Identify userNumber
  |
  +----> Verify account/email status
  |
  +----> Create Claim
  |
  +----> Save claim proof
  |
  +----> Record audit log
  |
  v
LostItemManager
  |
  +----> Remove from lostQueue
  |
  +----> status = Found
  |
  +----> foundAt = now
  |
  +----> expiryDate = now + 30 days
  |
  +----> push to foundQueue
  |
  +----> Save updated JSON
```

---

# 44. Data Flow for 30-Day Expiry

```text
Application starts
       |
       v
removeExpiredFoundItems()
       |
       v
Read front of foundQueue
       |
       v
Compare expiryDate with current time
       |
   +---+---+
   |       |
  Expired  Active
   |       |
   v       v
Remove    Stop
   |
   v
Delete / archive record
   |
   v
Remove related active files if policy allows
   |
   v
Check next item
```

---

# 45. Audit / Search Flow for a Suspicious Claim

Suppose claim `C5001` is disputed.

The backend can search:

```text
Claim ID: C5001
       |
       v
User Number: U2045
       |
       v
users.json
       |
       +-- Name
       +-- Verified Email
       +-- Phone
       +-- Account Details
       |
       v
 audit_log.json
       |
       +-- Claim time
       +-- Related actions
       +-- Report history
```

This makes user tracing possible without using AI.

---

# 46. Security and Data Protection Basics

The system should follow some basic rules:

- Store password **hashes**, not plain-text passwords.
- Verify email before allowing sensitive actions.
- Keep user information separate from public item information.
- Restrict user-search and audit-log endpoints to authorized administrators.
- Validate uploaded file types and sizes.
- Generate unique image file names.
- Do not expose private claim data publicly.
- Keep an audit trail for important account and claim operations.

---

# 47. DSA Concepts Demonstrated

| DSA / C++ Concept | Project Use |
|---|---|
| `struct` / `class` | User, Item, Claim, AuditLog |
| `unordered_map` | Fast item and user lookup |
| `vector` | Photo paths and result lists |
| `map` | Category/location indexes |
| `queue` | Lost Queue and Found Queue |
| Searching | Find items and users |
| Sorting | Sort/search results |
| File Handling | Persistent storage |
| JSON | Structured data representation |
| CRUD | Create, Read, Update, Delete |
| FIFO | Queue lifecycle and expiry processing |

---

# 48. What Makes the Project Different from a Normal CRUD Website?

The project is not only a form-and-storage application.

The C++ layer actually performs the core data organization:

```text
User Management
       +
Item Management
       +
Claim Management
       +
Lost Queue
       +
Found Queue
       +
30-Day Expiry
       +
Audit Trail
       +
File Handling
```

Therefore, the DSA concepts have a direct role in the actual application.

---

# 49. Scope of the Current Version

The current project does **not** include:

- Machine Learning
- AI image recognition
- Automatic image similarity
- NLP
- Facial recognition
- AI-based ownership prediction
- Automatic claim approval based on AI

Photos are stored and displayed as part of the item's structured record.

Ownership checking can be handled through:

- User identity
- Verified email
- Claim information
- Ownership proof
- Manual/admin review where required

---

# 50. Future Scope

Possible future additions:

- SMS/OTP verification
- Email notifications
- Admin authentication
- Better claim verification
- Cloud image storage
- Database migration
- Mobile application
- Location maps
- Notification when a related item is reported
- Advanced search
- Claim history dashboard

These can be added later without changing the basic React + C++ DSA architecture.

---

# 51. Final System Architecture

```text
                         USER
                          |
             +------------+-------------+
             |                          |
             v                          v
        REGISTER / LOGIN          SEARCH / REPORT
             |                          |
             v                          v
       EMAIL VERIFICATION         REACT FRONTEND
             |                          |
             +------------+-------------+
                          |
                       REST API
                          |
                          v
                 +------------------+
                 |   C++ BACKEND    |
                 +------------------+
                          |
          +---------------+----------------+
          |               |                |
          v               v                v
    UserManager     LostItemManager   ClaimManager
          |               |                |
          +---------------+----------------+
                          |
                          v
                  +---------------+
                  |   C++ STL     |
                  |---------------|
                  | unordered_map |
                  | vector        |
                  | map           |
                  | lostQueue     |
                  | foundQueue    |
                  +-------+-------+
                          |
              +-----------+-----------+
              |                       |
              v                       v
        JSON / File Storage       Image Storage
              |                       |
       +------+-------+               |
       |      |       |               |
       v      v       v               v
    users   items   claims        uploads/
    .json   .json   .json
              |
              v
        audit_log.json
```

---

# 52. Final User-to-Item Lifecycle

```text
1. User registers
        ↓
2. Email is verified
        ↓
3. User logs in
        ↓
4. Finder uploads item photo + details
        ↓
5. Item enters LOST QUEUE
        ↓
6. Owner searches the application
        ↓
7. Owner finds matching item
        ↓
8. Owner submits CLAIM
        ↓
9. System stores user number + claim details
        ↓
10. Item leaves LOST QUEUE
        ↓
11. Item enters FOUND QUEUE
        ↓
12. 30-day retention begins
        ↓
13. Audit trail keeps the claim/user association
        ↓
14. After 30 days → automatic removal
```

---

# 53. One-Line Project Definition

> **A React-based Lost & Found Management System with a C++ REST backend that lets users report found items with photos, allows verified owners to search and claim them, tracks user and claim activity, moves claimed items from a Lost Queue to a temporary 30-day Found Queue, and uses C++ data structures and file handling for the complete record-management process.**
