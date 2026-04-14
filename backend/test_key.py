import os
from dotenv import load_dotenv
from google import genai

load_dotenv()
# Using the modern 2.5 Flash model
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

try:
    print("Casting the spell with Gemini 2.5 Flash...")
    response = client.models.generate_content(
        model="gemini-2.5-flash", 
        contents="Generate 3 nodes for a 'Wizard 101' skill tree in JSON format."
    )
    print("SUCCESS! The AI responded:")
    print(response.text)
except Exception as e:
    # If this still fails, check the error code below
    print(f"Spell failed: {e}")