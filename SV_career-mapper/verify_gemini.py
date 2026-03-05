import requests
import sys

try:
    url = 'http://localhost:8000/api/ai/transcribe'
    files = {'file': open('sample_lecture.mp3', 'rb')}
    data = {'language': 'English'}
    print(f"Sending POST request to {url}...")
    response = requests.post(url, files=files, data=data)
    
    if response.status_code == 200:
        json_resp = response.json()
        transcript = json_resp.get("transcript", "")
        print(f"Transcript Preview: {transcript[:100]}...")
        
        if "Mock Transcription" in transcript:
            print("FAILURE: Still receiving mock transcription.")
        else:
            print("SUCCESS: Received real transcription (No mock signature found).")
            print("Summary:", json_resp.get("summary"))
    else:
        print(f"Failed with status {response.status_code}")
        print(response.text)
        
except Exception as e:
    print(f"An error occurred: {e}")
