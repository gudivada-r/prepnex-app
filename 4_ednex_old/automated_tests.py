"""
Student Success Navigator - Automated Test Suite
Critical Path Tests for Daily Regression Testing

Run with: python automated_tests.py
"""

import requests
import time
import json
from datetime import datetime

# Configuration
BASE_URL = "https://student-success-backend-cnya.onrender.com"
FRONTEND_URL = "https://studentsuccess-nu.vercel.app"

# Test Results
test_results = {
    "passed": 0,
    "failed": 0,
    "errors": []
}

def log_test(test_name, passed, message=""):
    """Log test result"""
    if passed:
        test_results["passed"] += 1
        print(f"✅ PASS: {test_name}")
    else:
        test_results["failed"] += 1
        test_results["errors"].append(f"{test_name}: {message}")
        print(f"❌ FAIL: {test_name} - {message}")

def test_backend_health():
    """TC-001: Backend Health Check"""
    try:
        response = requests.get(f"{BASE_URL}/", timeout=10)
        passed = response.status_code == 200 and "Welcome" in response.text
        log_test("Backend Health Check", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Backend Health Check", False, str(e))
        return False

def test_user_registration():
    """TC-002: User Registration"""
    try:
        timestamp = int(time.time())
        email = f"test_user_{timestamp}@example.com"
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email,
            "password_hash": "TestPassword123!",
            "full_name": "Test User",
            "is_admin": False
        }, timeout=10)
        
        passed = response.status_code in [200, 201]
        log_test("User Registration", passed, f"Status: {response.status_code}")
        return email if passed else None
    except Exception as e:
        log_test("User Registration", False, str(e))
        return None

def test_user_login(email):
    """TC-003: User Login"""
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", data={
            "username": email,
            "password": "TestPassword123!"
        }, timeout=10)
        
        passed = response.status_code == 200 and "access_token" in response.json()
        log_test("User Login", passed, f"Status: {response.status_code}")
        
        if passed:
            return response.json()["access_token"]
        return None
    except Exception as e:
        log_test("User Login", False, str(e))
        return None

def test_flashcard_generation(token):
    """TC-004: Flashcard Generation with AI"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        payload = {
            "note_content": "World War 1 was a global conflict",
            "topic": "World War 1",
            "course_name": "History 101"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/ai/flashcards",
            json=payload,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            flashcards = data.get("flashcards", [])
            
            # Check if AI generated (not mock data)
            is_real_ai = len(flashcards) > 0 and "Concept 1" not in flashcards[0].get("front", "")
            
            passed = is_real_ai
            log_test("Flashcard Generation (AI)", passed, 
                    f"Generated {len(flashcards)} cards, AI: {is_real_ai}")
        else:
            log_test("Flashcard Generation (AI)", False, f"Status: {response.status_code}")
            
    except Exception as e:
        log_test("Flashcard Generation (AI)", False, str(e))

def test_lecture_note_save(token):
    """TC-005: Save Lecture Note"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        payload = {
            "course_name": "Physics 101",
            "professor_name": "Dr. Smith",
            "transcript": "This is a test transcript about quantum mechanics.",
            "summary": ["Key Point 1", "Key Point 2", "Key Point 3"],
            "language": "English",
            "duration_seconds": 120
        }
        
        response = requests.post(
            f"{BASE_URL}/api/lecture-notes/save",
            json=payload,
            headers=headers,
            timeout=10
        )
        
        passed = response.status_code == 200
        log_test("Save Lecture Note", passed, f"Status: {response.status_code}")
        
        if passed:
            return response.json().get("id")
        return None
    except Exception as e:
        log_test("Save Lecture Note", False, str(e))
        return None

def test_lecture_history(token):
    """TC-006: Retrieve Lecture History"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        
        response = requests.get(
            f"{BASE_URL}/api/lecture-notes/history",
            headers=headers,
            timeout=10
        )
        
        passed = response.status_code == 200
        if passed:
            notes = response.json()
            log_test("Retrieve Lecture History", True, f"Found {len(notes)} notes")
        else:
            log_test("Retrieve Lecture History", False, f"Status: {response.status_code}")
            
    except Exception as e:
        log_test("Retrieve Lecture History", False, str(e))

def test_bookmark_lecture(token, note_id):
    """TC-007: Bookmark Lecture Note"""
    if not note_id:
        log_test("Bookmark Lecture Note", False, "No note ID available")
        return
        
    try:
        headers = {"Authorization": f"Bearer {token}"}
        
        response = requests.put(
            f"{BASE_URL}/api/lecture-notes/{note_id}/bookmark",
            headers=headers,
            timeout=10
        )
        
        passed = response.status_code == 200
        log_test("Bookmark Lecture Note", passed, f"Status: {response.status_code}")
            
    except Exception as e:
        log_test("Bookmark Lecture Note", False, str(e))

def test_delete_lecture(token, note_id):
    """TC-008: Delete Lecture Note"""
    if not note_id:
        log_test("Delete Lecture Note", False, "No note ID available")
        return
        
    try:
        headers = {"Authorization": f"Bearer {token}"}
        
        response = requests.delete(
            f"{BASE_URL}/api/lecture-notes/{note_id}",
            headers=headers,
            timeout=10
        )
        
        passed = response.status_code == 200
        log_test("Delete Lecture Note", passed, f"Status: {response.status_code}")
            
    except Exception as e:
        log_test("Delete Lecture Note", False, str(e))

def test_environment_variables():
    """TC-009: Check Environment Variables"""
    try:
        response = requests.get(f"{BASE_URL}/debug/env", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            google_key_set = data.get("GOOGLE_API_KEY") == "SET"
            db_set = data.get("DATABASE_URL") == "SET"
            
            passed = google_key_set and db_set
            log_test("Environment Variables Check", passed, 
                    f"GOOGLE_API_KEY: {data.get('GOOGLE_API_KEY')}, DB: {data.get('DATABASE_URL')}")
        else:
            log_test("Environment Variables Check", False, "Debug endpoint not available")
            
    except Exception as e:
        log_test("Environment Variables Check", False, str(e))

def run_all_tests():
    """Run all automated tests"""
    print("=" * 60)
    print("STUDENT SUCCESS NAVIGATOR - AUTOMATED TEST SUITE")
    print(f"Test Run: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    print()
    
    # Test 1: Backend Health
    if not test_backend_health():
        print("\n⚠️  Backend is down. Stopping tests.")
        return
    
    # Test 2: Environment Variables
    test_environment_variables()
    
    # Test 3-4: User Registration and Login
    email = test_user_registration()
    if not email:
        print("\n⚠️  Registration failed. Skipping authenticated tests.")
        print_summary()
        return
    
    token = test_user_login(email)
    if not token:
        print("\n⚠️  Login failed. Skipping authenticated tests.")
        print_summary()
        return
    
    # Test 5: Flashcard Generation
    test_flashcard_generation(token)
    
    # Test 6-8: Lecture Notes CRUD
    note_id = test_lecture_note_save(token)
    test_lecture_history(token)
    test_bookmark_lecture(token, note_id)
    test_delete_lecture(token, note_id)
    
    # Print Summary
    print_summary()

def print_summary():
    """Print test execution summary"""
    print()
    print("=" * 60)
    print("TEST EXECUTION SUMMARY")
    print("=" * 60)
    print(f"Total Passed: {test_results['passed']}")
    print(f"Total Failed: {test_results['failed']}")
    print(f"Success Rate: {test_results['passed'] / (test_results['passed'] + test_results['failed']) * 100:.1f}%")
    
    if test_results['errors']:
        print("\n❌ FAILED TESTS:")
        for error in test_results['errors']:
            print(f"  - {error}")
    else:
        print("\n✅ ALL TESTS PASSED!")
    
    print("=" * 60)
    
    # Save results to file
    with open("test_results.json", "w") as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "passed": test_results['passed'],
            "failed": test_results['failed'],
            "errors": test_results['errors']
        }, f, indent=2)
    
    print(f"\nResults saved to: test_results.json")

if __name__ == "__main__":
    run_all_tests()
