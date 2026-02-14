
import google.generativeai as genai
from config import api_key
import sys

def test_api():
    print("Testing Gemini API Connection...")
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = "Write a one-sentence travel tip for Paris."
        print(f"Sending prompt: '{prompt}'")
        
        response = model.generate_content(prompt)
        print("\n--- API RESPONSE SUCCESS ---")
        print(response.text)
        print("----------------------------")
        return True
    except Exception as e:
        print("\n!!! API ERROR !!!")
        print(str(e))
        return False

if __name__ == "__main__":
    success = test_api()
    if success:
        print("\n✅ API is working correctly!")
        sys.exit(0)
    else:
        print("\n❌ API failed.")
        sys.exit(1)
