import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def run_test():
    print("1. Authenticating...")
    email = "test_agent@example.com"
    password = "password123"
    
    # Register/Login
    try:
        requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email, "password_hash": password, "full_name": "Agent Tester", "is_admin": False
        })
    except: pass

    res = requests.post(f"{BASE_URL}/api/auth/login", data={"username": email, "password": password})
    if res.status_code != 200:
        print("Login failed")
        return
    token = res.json()["access_token"]
    
    print("2. Sending Query to Get Aura...")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Query that triggers the Tutor Agent
    query = "I am really failing my calculus class and I don't know what to do."
    
    try:
        chat_res = requests.post(
            f"{BASE_URL}/api/chat/query",
            json={"query": query},
            headers=headers
        )
        
        print(f"   Status Code: {chat_res.status_code}")
        if chat_res.status_code == 200:
            data = chat_res.json()
            message = data.get("message_content", "")
            print("\n--- AI Response ---")
            print(message)
            
            if "I see your grades are:" in message and len(message) < 200:
                 print("\n[RESULT] POTENTIAL FALLBACK DETECTED (Short/Template response).")
            else:
                 print("\n[RESULT] REAL AI GENERATION DETECTED (Natural language response).")
        else:
            print(f"Error: {chat_res.text}")

    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    run_test()
