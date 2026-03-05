import google.generativeai as genai
import os
import json

# Set the key provided by the user
os.environ["GOOGLE_API_KEY"] = "AIzaSyChZdfiXaDvKbFg2pqVid6CqOBbtCe2kUQ"
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

def list_models():
    print("Listing available models...")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")

def test_generate_flashcards():
    list_models()
    
    # Try gemini-1.5-flash first, but fall back if needed or use a found one
    model_name = 'gemini-flash-latest'
    print(f"\nTesting Flashcard Generation with {model_name}...")
    model = genai.GenerativeModel(model_name)
    
    topic_query = "Mitochondria in the context of Biology"
    prompt = f"Generate exactly 5 flashcards for the topic: '{topic_query}'. Return valid JSON array of objects with 'front' and 'back' keys."

    try:
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        print("\n--- Raw Response ---")
        print(response.text)
        
        data = json.loads(response.text)
        print("\n--- Parsed JSON ---")
        print(json.dumps(data, indent=2))
        
        if isinstance(data, list) or (isinstance(data, dict) and ("flashcards" in data or "cards" in data)):
             print("\nSUCCESS: Flashcards generated and parsed correctly.")
        else:
             print("\nWARNING: Response format unexpected.")

    except Exception as e:
        print(f"\nFAILED: {e}")

if __name__ == "__main__":
    test_generate_flashcards()
