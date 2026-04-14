import os
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load the .env file containing GEMINI_API_KEY
load_dotenv()

app = FastAPI()

# Allow React to talk to Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Your Vite URL
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the modern Gemini Client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

@app.get("/generate-tree")
async def generate_skill_tree(topic: str):
    prompt = f"""
    Create a 5-node learning skill tree for: {topic}.
    Nodes need an id, a position (x, y spaced out like a tree), and data (label, difficulty).
    Edges need an id, source, target, and animated=true.
    """
    
    max_retries = 3
    retry_delay = 2

    for attempt in range(max_retries):
        try:
            print(f"Casting spell for {topic}... (Attempt {attempt + 1})")
            
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema={
                        "type": "OBJECT",
                        "properties": {
                            "nodes": {
                                "type": "ARRAY",
                                "items": {
                                    "type": "OBJECT",
                                    "properties": {
                                        "id": {"type": "STRING"},
                                        "position": {
                                            "type": "OBJECT",
                                            "properties": {
                                                "x": {"type": "INTEGER"},
                                                "y": {"type": "INTEGER"}
                                            }
                                        },
                                        "data": {
                                            "type": "OBJECT",
                                            "properties": {
                                                "label": {"type": "STRING"},
                                                "difficulty": {"type": "STRING"}
                                            }
                                        }
                                    }
                                }
                            },
                            "edges": {
                                "type": "ARRAY",
                                "items": {
                                    "type": "OBJECT",
                                    "properties": {
                                        "id": {"type": "STRING"},
                                        "source": {"type": "STRING"},
                                        "target": {"type": "STRING"},
                                        "animated": {"type": "BOOLEAN"}
                                    }
                                }
                            }
                        },
                        "required": ["nodes", "edges"]
                    }
                )
            )
            
            # The new SDK parses the JSON automatically!
            return response.parsed
            
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg or "503" in error_msg:
                if attempt < max_retries - 1:
                    print(f"Server busy. Retrying in {retry_delay} seconds...")
                    time.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
                    continue
            return {"error": f"Spell failed: {error_msg}"}