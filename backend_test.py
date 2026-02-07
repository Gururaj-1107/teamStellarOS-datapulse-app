#!/usr/bin/env python3
"""
DataPulse Backend API Testing Script
Tests all backend endpoints with proper authentication and role-based access control.
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://pulse-analytics-5.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

# Test credentials
ADMIN_CREDS = {"email": "admin@datapulse.com", "password": "password123"}
USER1_CREDS = {"email": "sarah@example.com", "password": "password123"}
USER2_CREDS = {"email": "john@example.com", "password": "password123"}

# Test state
test_results = []
admin_token = None
user1_token = None
user2_token = None
course_id = None


def log_test(test_name: str, success: bool, message: str, response_data: Any = None):
    """Log test result"""
    result = {
        "test": test_name,
        "success": success,
        "message": message,
        "data": response_data
    }
    test_results.append(result)
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {test_name} - {message}")


def make_request(method: str, endpoint: str, data: Dict = None, token: str = None) -> Dict:
    """Make HTTP request with proper headers"""
    url = f"{API_BASE}/{endpoint.lstrip('/')}"
    headers = {"Content-Type": "application/json"}
    
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=10)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=data, timeout=10)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        return {
            "status_code": response.status_code,
            "data": response.json() if response.content else {},
            "success": response.status_code < 400
        }
    except requests.exceptions.RequestException as e:
        return {
            "status_code": 0,
            "data": {"error": str(e)},
            "success": False
        }
    except json.JSONDecodeError:
        return {
            "status_code": response.status_code,
            "data": {"error": "Invalid JSON response"},
            "success": False
        }


def test_setup_endpoints():
    """Test setup endpoints"""
    print("\n=== TESTING SETUP ENDPOINTS ===")
    
    # Test setup check
    result = make_request("GET", "setup/check")
    log_test(
        "Setup Check",
        result["success"] and result["data"].get("setup", False),
        f"Setup status: {result['data']}"
    )
    
    # Test seed (should already exist)
    result = make_request("POST", "setup/seed")
    log_test(
        "Seed Data",
        result["success"],
        f"Seed result: {result['data'].get('message', result['data'])}"
    )


def test_auth_endpoints():
    """Test authentication endpoints"""
    global admin_token, user1_token, user2_token
    
    print("\n=== TESTING AUTHENTICATION ===")
    
    # Test admin login
    result = make_request("POST", "auth/login", ADMIN_CREDS)
    if result["success"] and result["data"].get("token"):
        admin_token = result["data"]["token"]
        log_test(
            "Admin Login",
            True,
            f"Admin logged in successfully. Role: {result['data']['user']['role']}"
        )
    else:
        log_test("Admin Login", False, f"Login failed: {result['data']}")
    
    # Test user1 login
    result = make_request("POST", "auth/login", USER1_CREDS)
    if result["success"] and result["data"].get("token"):
        user1_token = result["data"]["token"]
        log_test(
            "User1 Login (Sarah)",
            True,
            f"User logged in successfully. Role: {result['data']['user']['role']}"
        )
    else:
        log_test("User1 Login (Sarah)", False, f"Login failed: {result['data']}")
    
    # Test user2 login
    result = make_request("POST", "auth/login", USER2_CREDS)
    if result["success"] and result["data"].get("token"):
        user2_token = result["data"]["token"]
        log_test(
            "User2 Login (John)",
            True,
            f"User logged in successfully. Role: {result['data']['user']['role']}"
        )
    else:
        log_test("User2 Login (John)", False, f"Login failed: {result['data']}")
    
    # Test invalid login
    result = make_request("POST", "auth/login", {"email": "invalid@test.com", "password": "wrong"})
    log_test(
        "Invalid Login",
        not result["success"] and result["status_code"] == 401,
        f"Correctly rejected invalid credentials: {result['data']}"
    )
    
    # Test /auth/me with admin token
    if admin_token:
        result = make_request("GET", "auth/me", token=admin_token)
        log_test(
            "Admin Auth Me",
            result["success"] and result["data"].get("user", {}).get("role") == "admin",
            f"Admin user data retrieved: {result['data'].get('user', {}).get('email', 'N/A')}"
        )
    
    # Test /auth/me with user token
    if user1_token:
        result = make_request("GET", "auth/me", token=user1_token)
        log_test(
            "User Auth Me",
            result["success"] and result["data"].get("user", {}).get("role") == "user",
            f"User data retrieved: {result['data'].get('user', {}).get('email', 'N/A')}"
        )
    
    # Test /auth/me without token
    result = make_request("GET", "auth/me")
    log_test(
        "Auth Me Unauthorized",
        not result["success"] and result["status_code"] == 401,
        f"Correctly rejected unauthorized request: {result['data']}"
    )
    
    # Test signup with new user
    import time
    unique_email = f"testuser_{int(time.time())}@example.com"
    new_user_data = {
        "name": "Test User",
        "email": unique_email,
        "password": "password123"
    }
    result = make_request("POST", "auth/signup", new_user_data)
    log_test(
        "New User Signup",
        result["success"] and result["data"].get("token"),
        f"New user signup: {result['data'].get('user', {}).get('email', result['data'])}"
    )
    
    # Test duplicate signup (should fail)
    duplicate_data = {"name": "Existing User", **USER1_CREDS}
    result = make_request("POST", "auth/signup", duplicate_data)
    log_test(
        "Duplicate Signup",
        not result["success"] and result["status_code"] == 409,
        f"Correctly rejected duplicate email: {result['data']}"
    )


def test_courses_endpoints():
    """Test courses endpoints"""
    global course_id
    
    print("\n=== TESTING COURSES ===")
    
    # Test get all courses
    result = make_request("GET", "courses")
    if result["success"] and result["data"].get("courses"):
        courses = result["data"]["courses"]
        course_id = courses[0]["id"] if courses else None
        log_test(
            "Get All Courses",
            len(courses) >= 5,
            f"Retrieved {len(courses)} courses"
        )
    else:
        log_test("Get All Courses", False, f"Failed to get courses: {result['data']}")
    
    # Test get single course
    if course_id:
        result = make_request("GET", f"courses/{course_id}")
        log_test(
            "Get Single Course",
            result["success"] and result["data"].get("course"),
            f"Retrieved course: {result['data']['course']['title'] if result['success'] else result['data']}"
        )
    
    # Test get non-existent course
    result = make_request("GET", "courses/non-existent-id")
    log_test(
        "Get Non-existent Course",
        not result["success"] and result["status_code"] == 404,
        f"Correctly returned 404: {result['data']}"
    )
    
    # Test course enrollment (requires auth)
    if user1_token and course_id:
        result = make_request("POST", "courses/enroll", {"course_id": course_id}, user1_token)
        log_test(
            "Course Enrollment (Authorized)",
            result["success"] or (result["status_code"] == 409 and "Already enrolled" in str(result["data"])),
            f"Enrollment result: {result['data']}"
        )
    
    # Test course enrollment without auth
    if course_id:
        result = make_request("POST", "courses/enroll", {"course_id": course_id})
        log_test(
            "Course Enrollment (Unauthorized)",
            not result["success"] and result["status_code"] == 401,
            f"Correctly rejected unauthorized enrollment: {result['data']}"
        )


def test_activities_endpoints():
    """Test activities endpoints"""
    print("\n=== TESTING ACTIVITIES ===")
    
    # Test log activity (requires auth)
    if user1_token:
        activity_data = {
            "action_type": "test_action",
            "details": {"description": "Test activity from backend test"},
            "metadata": {"source": "api_test", "device": "test"}
        }
        result = make_request("POST", "activities", activity_data, user1_token)
        log_test(
            "Log Activity (Authorized)",
            result["success"],
            f"Activity logged: {result['data']}"
        )
    
    # Test log activity without auth
    result = make_request("POST", "activities", {"action_type": "unauthorized"})
    log_test(
        "Log Activity (Unauthorized)",
        not result["success"] and result["status_code"] == 401,
        f"Correctly rejected unauthorized activity: {result['data']}"
    )
    
    # Test get activities as user
    if user1_token:
        result = make_request("GET", "activities", token=user1_token)
        log_test(
            "Get Activities (User)",
            result["success"] and "activities" in result["data"],
            f"Retrieved {len(result['data']['activities']) if result['success'] else 0} activities for user"
        )
    
    # Test get activities as admin (should see all)
    if admin_token:
        result = make_request("GET", "activities", token=admin_token)
        log_test(
            "Get Activities (Admin)",
            result["success"] and "activities" in result["data"],
            f"Admin retrieved {len(result['data']['activities']) if result['success'] else 0} activities"
        )
    
    # Test get activities without auth
    result = make_request("GET", "activities")
    log_test(
        "Get Activities (Unauthorized)",
        not result["success"] and result["status_code"] == 401,
        f"Correctly rejected unauthorized request: {result['data']}"
    )


def test_chatbot_endpoints():
    """Test chatbot endpoints"""
    print("\n=== TESTING CHATBOT ===")
    
    # Test chatbot query (requires auth)
    if user1_token:
        query_data = {
            "query": "What are the prerequisites for Python courses?",
            "course_title": "Python for Beginners"
        }
        result = make_request("POST", "chatbot", query_data, user1_token)
        log_test(
            "Chatbot Query (Authorized)",
            result["success"] and "response" in result["data"],
            f"Chatbot response received: {result['data']['response'][:50] if result['success'] else result['data']}..."
        )
    
    # Test chatbot query without auth
    result = make_request("POST", "chatbot", {"query": "Test query"})
    log_test(
        "Chatbot Query (Unauthorized)",
        not result["success"] and result["status_code"] == 401,
        f"Correctly rejected unauthorized query: {result['data']}"
    )
    
    # Test get all queries (admin only)
    if admin_token:
        result = make_request("GET", "chatbot/queries", token=admin_token)
        log_test(
            "Get Chatbot Queries (Admin)",
            result["success"] and "queries" in result["data"],
            f"Admin retrieved {len(result['data']['queries']) if result['success'] else 0} queries"
        )
    
    # Test get queries as user (should fail)
    if user1_token:
        result = make_request("GET", "chatbot/queries", token=user1_token)
        log_test(
            "Get Chatbot Queries (User)",
            not result["success"] and result["status_code"] == 401,
            f"Correctly rejected user access: {result['data']}"
        )


def test_analytics_endpoints():
    """Test analytics endpoints"""
    print("\n=== TESTING ANALYTICS ===")
    
    # Test analytics (admin only)
    if admin_token:
        result = make_request("GET", "analytics", token=admin_token)
        log_test(
            "Get Analytics (Admin)",
            result["success"] and "totalUsers" in result["data"],
            f"Analytics data retrieved: {result['data']['totalUsers'] if result['success'] else 0} users, {result['data'].get('totalCourses', 0)} courses"
        )
    
    # Test analytics as user (should fail)
    if user1_token:
        result = make_request("GET", "analytics", token=user1_token)
        log_test(
            "Get Analytics (User)",
            not result["success"] and result["status_code"] == 401,
            f"Correctly rejected user access: {result['data']}"
        )
    
    # Test analytics without auth
    result = make_request("GET", "analytics")
    log_test(
        "Get Analytics (Unauthorized)",
        not result["success"] and result["status_code"] == 401,
        f"Correctly rejected unauthorized access: {result['data']}"
    )


def test_users_endpoints():
    """Test user management endpoints"""
    print("\n=== TESTING USER MANAGEMENT ===")
    
    # Test get all users (admin only)
    if admin_token:
        result = make_request("GET", "users", token=admin_token)
        if result["success"] and "users" in result["data"]:
            users = result["data"]["users"]
            log_test(
                "Get All Users (Admin)",
                len(users) >= 3,
                f"Admin retrieved {len(users)} users"
            )
            
            # Test get specific user
            if users:
                user_id = users[0]["id"]
                result = make_request("GET", f"users/{user_id}", token=admin_token)
                log_test(
                    "Get Specific User (Admin)",
                    result["success"] and "user" in result["data"],
                    f"Retrieved user details for: {result['data']['user']['email'] if result['success'] else 'unknown'}"
                )
        else:
            log_test("Get All Users (Admin)", False, f"Failed to get users: {result['data']}")
    
    # Test get users as regular user (should fail)
    if user1_token:
        result = make_request("GET", "users", token=user1_token)
        log_test(
            "Get All Users (User)",
            not result["success"] and result["status_code"] == 401,
            f"Correctly rejected user access: {result['data']}"
        )


def test_dashboard_endpoint():
    """Test dashboard endpoint"""
    print("\n=== TESTING DASHBOARD ===")
    
    # Test dashboard (requires auth)
    if user1_token:
        result = make_request("GET", "dashboard", token=user1_token)
        log_test(
            "Get Dashboard (User)",
            result["success"] and "enrollments" in result["data"],
            f"Dashboard data: {len(result['data']['enrollments']) if result['success'] else 0} enrollments, {len(result['data'].get('activities', [])) if result['success'] else 0} recent activities"
        )
    
    # Test dashboard as admin
    if admin_token:
        result = make_request("GET", "dashboard", token=admin_token)
        log_test(
            "Get Dashboard (Admin)",
            result["success"] and "enrollments" in result["data"],
            f"Admin dashboard: {len(result['data']['enrollments']) if result['success'] else 0} enrollments"
        )
    
    # Test dashboard without auth
    result = make_request("GET", "dashboard")
    log_test(
        "Get Dashboard (Unauthorized)",
        not result["success"] and result["status_code"] == 401,
        f"Correctly rejected unauthorized access: {result['data']}"
    )


def print_summary():
    """Print test summary"""
    print("\n" + "="*60)
    print("BACKEND API TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for t in test_results if t["success"])
    failed = len(test_results) - passed
    
    print(f"Total Tests: {len(test_results)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Success Rate: {(passed/len(test_results)*100):.1f}%")
    
    if failed > 0:
        print("\nFAILED TESTS:")
        for test in test_results:
            if not test["success"]:
                print(f"❌ {test['test']}: {test['message']}")
    
    print("\n" + "="*60)
    return failed == 0


def main():
    """Run all backend tests"""
    print("DataPulse Backend API Test Suite")
    print("="*60)
    print(f"Testing API at: {API_BASE}")
    
    try:
        test_setup_endpoints()
        test_auth_endpoints()
        test_courses_endpoints()
        test_activities_endpoints()
        test_chatbot_endpoints()
        test_analytics_endpoints()
        test_users_endpoints()
        test_dashboard_endpoint()
        
        success = print_summary()
        return 0 if success else 1
        
    except KeyboardInterrupt:
        print("\n\nTest execution interrupted by user.")
        return 1
    except Exception as e:
        print(f"\n\nUnexpected error during testing: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())