import requests
import os

BASE_URL = "http://127.0.0.1:8000"
FILE_PATH = "sample_lecture.mp3"

def run_test():
    # 1. Check if file exists, if not create a dummy one
    if not os.path.exists(FILE_PATH):
        print(f"File {FILE_PATH} not found. Creating a dummy file...")
        with open(FILE_PATH, "wb") as f:
            # Write 1KB of dummy zero bytes just to have a file
            # Note: This WON'T be transcribable by AI but will test the endpoint flow
            f.write(b'\x00' * 1024)
            
    print("1. Authenticating...")
    # Login to get valid token just in case, though endpoint might not need it based on api.py signature
    # (Actually api.py endpoint `transcribe_audio` does NOT depend on get_current_user in the signature!)
    # But let's check: async def transcribe_audio(file: bytes = File(...), language: str = Form("English")):
    # No Depends(get_current_user), so it's public for now.
    
    print(f"2. Uploading {FILE_PATH} to {BASE_URL}/api/ai/transcribe...")
    
    try:
        with open(FILE_PATH, "rb") as f:
            files = {"file": (FILE_PATH, f, "audio/mpeg")}
            data = {"language": "English"}
            
            res = requests.post(f"{BASE_URL}/api/ai/transcribe", files=files, data=data)
            
        print(f"   Status Code: {res.status_code}")
        
        if res.status_code == 200:
            result = res.json()
            print("\n--- Response ---")
            print(f"Transcript Preview: {result.get('transcript', '')[:100]}...")
            print(f"Summary Points: {len(result.get('summary', []))}")
            for p in result.get('summary', []):
                print(f" - {p}")
                
            if "mock" in str(result).lower():
                print("\n[RESULT] FALLBACK/MOCK DATA DETECTED.")
            else:
                 print("\n[RESULT] REAL AI TRANSCRIPTION DETECTED.")
        else:
            print(f"FAILED: {res.text}")

    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    run_test()
