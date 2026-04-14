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
    You are an expert curriculum designer. Create a comprehensive skill tree for: {topic}.
    CRITICAL REQUIREMENT: You MUST generate a skill tree that spans exactly 8 columns (stages of learning), flowing left to right.
    
    You must generate exactly 24 nodes distributed across the 8 columns.
    Structure the columns and coordinates exactly as follows:
    - Column 1 (x: 0): 1 node (y: 300)
    - Column 2 (x: 350): 2 nodes (y: 200, 400)
    - Column 3 (x: 700): 3 nodes (y: 150, 300, 450)
    - Column 4 (x: 1050): 4 nodes (y: 100, 250, 400, 550)
    - Column 5 (x: 1400): 4 nodes (y: 100, 250, 400, 550)
    - Column 6 (x: 1750): 4 nodes (y: 100, 250, 400, 550)
    - Column 7 (x: 2100): 3 nodes (y: 150, 300, 450)
    - Column 8 (x: 2450): 3 nodes (y: 150, 300, 450)

    Nodes MUST have: id (string "1" to "24"), position (x, y), and data (label, difficulty, description).
    Edges MUST have: id (string), source (string matching a node id), target (string matching a node id), and animated (boolean true). 
    Ensure EVERY single node (except node "1") has at least one incoming edge from a node in a previous column!
    """
    
    max_retries = 4
    retry_delay = 2
    current_model = "gemini-2.5-flash"
    fallback_model = "gemini-2.0-flash"

    for attempt in range(max_retries):
        try:
            print(f"Generating 8-column tree for {topic} using {current_model}... (Attempt {attempt + 1})")
            
            response = client.models.generate_content(
                model=current_model,
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
                                                "difficulty": {"type": "STRING"},
                                                "description": {"type": "STRING"}
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
            
            return response.parsed
            
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg or "503" in error_msg:
                # Switch models if we hit the error for the second time (attempt 1)
                if attempt == 1:
                    print(f"Hit rate limits/server busy twice. Switching to fallback model: {fallback_model}")
                    current_model = fallback_model

                if attempt < max_retries - 1:
                    print(f"Server busy. Retrying in {retry_delay} seconds...")
                    time.sleep(retry_delay)
                    retry_delay *= 2 
                    continue
            return {"error": f"Generation failed: {error_msg}"}