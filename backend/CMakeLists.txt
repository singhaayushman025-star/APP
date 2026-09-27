cmake_minimum_required(VERSION 3.15)
project(LostAndFoundAPI CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Fetch Crow framework automatically
include(FetchContent)
FetchContent_Declare(
  Crow
  GIT_REPOSITORY https://github.com/CrowCpp/Crow.git
  GIT_TAG v1.2.0
)
FetchContent_MakeAvailable(Crow)

# Fetch nlohmann JSON framework
FetchContent_Declare(
  json
  GIT_REPOSITORY https://github.com/nlohmann/json.git
  GIT_TAG v3.11.3
)
FetchContent_MakeAvailable(json)

# Include directories
include_directories(include)

# Executable
add_executable(server src/main.cpp src/UserManager.cpp src/ItemManager.cpp src/ClaimManager.cpp src/AuditManager.cpp src/DisputeManager.cpp)

# Link Crow and nlohmann_json
target_link_libraries(server PRIVATE Crow::Crow nlohmann_json::nlohmann_json)
