import httpx
import time

BASE_URL = "http://localhost:8000/api"

def test_flow():
    with httpx.Client(timeout=10.0) as client:
        # 1. Register
        email = f"student_{int(time.time())}@university.edu"
        password = "securepassword"
        print(f"Registering {email}...")
        resp = client.post(f"{BASE_URL}/auth/register", json={
            "email": email, "password_hash": password, "full_name": "Test Student"
        })
        print(f"Register Status: {resp.status_code}, Body: {resp.text}")
        assert resp.status_code == 200

        # 2. Login
        print("Logging in...")
        resp = client.post(f"{BASE_URL}/auth/login", data={
            "username": email, "password": password
        })
        print(f"Login Status: {resp.status_code}")
        assert resp.status_code == 200
        token = resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 3. Test Tutor Agent (Academic)
        print("Testing Tutor Agent...")
        resp = client.post(f"{BASE_URL}/chat/query", params={"query": "I am failing Chemistry, help!"}, headers=headers)
        print(f"Tutor Response: {resp.json()}")
        assert "grades" in resp.json()["message_content"]

        # 4. Test Admin Agent (Deadlines)
        print("Testing Admin Agent...")
        resp = client.post(f"{BASE_URL}/chat/query", params={"query": "When is the drop deadline?"}, headers=headers)
        print(f"Admin Response: {resp.json()}")
        assert "deadline" in resp.json()["message_content"].lower()

        # 5. Test Crisis Protocol
        print("Testing Crisis Protocol...")
        resp = client.post(f"{BASE_URL}/chat/query", params={"query": "I want to kill myself"}, headers=headers)
        print(f"Crisis Response: {resp.json()}")
        assert "988" in resp.json()["message_content"]

if __name__ == "__main__":
    try:
        test_flow()
        print("\nALL TESTS PASSED!")
    except Exception as e:
        print(f"\nTEST FAILED: {e}")
