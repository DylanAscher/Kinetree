import os
import logging
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from dotenv import load_dotenv

# 1. Setup Logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    logger.error("GEMINI_API_KEY is missing from .env file!")

# 2. Initialize FastAPI and Gemini Client
app = FastAPI()
client = genai.Client(api_key=api_key)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Define Pydantic Models for Structured Output
class Resource(BaseModel):
    title: str = Field(description="The exact title of the article, video, or tool.")
    url: str = Field(description="A highly relevant, real URL to learn this skill.")

class Node(BaseModel):
    id: str = Field(description="A unique string ID for this node (e.g., '1', '2a')")
    label: str = Field(description="The short title of the skill")
    description: str = Field(description="A 2-sentence explanation of why this skill matters")
    difficulty: str = Field(description="Rank as 'Beginner', 'Intermediate', or 'Advanced'") # <-- NEW
    x: int = Field(description="The exact X coordinate provided in the prompt instructions")
    y: int = Field(description="The exact Y coordinate provided in the prompt instructions")
    resources: list[Resource] = Field(description="Exactly 1-2 highly relevant links to learn this skill")

class SkillTree(BaseModel):
    nodes: list[Node] = Field(description="Exactly 24 nodes forming the complete skill tree")

tree_cache = {}

# 4. The Generation Endpoint
@app.get("/generate-tree")
async def generate_skill_tree(topic: str):
    logger.info(f"Received request to generate tree for: {topic}")
    
    # Return cached version if we just searched this
    if topic.lower() in tree_cache:
        logger.info(f"Returning cached tree for {topic}!")
        return tree_cache[topic.lower()] # Already saved as a dict now!

    # The Bulletproof Mega-Batch Prompt
    prompt = f"""
    You are an expert curriculum designer. The user wants to learn about '{topic}'.
    Your task is to create a comprehensive, logical skill tree consisting of EXACTLY 24 nodes. 
    
    CRITICAL INSTRUCTION: You must strictly map your 24 nodes to the exact X and Y coordinates listed below to form an 8-column diamond. Do not calculate your own spacing. Do not deviate from this list. 

    - Node 1 (Foundation): x: 0, y: 300
    - Node 2: x: 250, y: 225
    - Node 3: x: 250, y: 375
    - Node 4: x: 500, y: 150
    - Node 5: x: 500, y: 300
    - Node 6: x: 500, y: 450
    - Node 7: x: 750, y: 75
    - Node 8: x: 750, y: 225
    - Node 9: x: 750, y: 375
    - Node 10: x: 750, y: 525
    - Node 11: x: 1000, y: 75
    - Node 12: x: 1000, y: 225
    - Node 13: x: 1000, y: 375
    - Node 14: x: 1000, y: 525
    - Node 15: x: 1250, y: 75
    - Node 16: x: 1250, y: 225
    - Node 17: x: 1250, y: 375
    - Node 18: x: 1250, y: 525
    - Node 19: x: 1500, y: 150
    - Node 20: x: 1500, y: 300
    - Node 21: x: 1500, y: 450
    - Node 22 (Mastery): x: 1750, y: 150
    - Node 23 (Mastery): x: 1750, y: 300
    - Node 24 (Mastery): x: 1750, y: 450

    Additional Rules:
    1. Do NOT use placeholder data (e.g., "Example Title", "example.com"). Provide real, actionable topics and URLs.
    2. Every node must have a unique ID (e.g., "node-1" through "node-24").
    3. You must return EXACTLY 24 nodes. 
    4. Provide exactly 1-2 resources per node.
    5. Assign a 'Beginner', 'Intermediate', or 'Advanced' difficulty to each node based on its position in the tree.
    """

    try:
        logger.info(f"Sending mega-batch request to Gemini 3.1 Flash...")
        response = client.models.generate_content(
            model='gemini-3.1-flash-lite-preview',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=SkillTree,
                temperature=0.4, 
            ),
        )
        
        logger.info("Successfully received strictly formatted JSON from Gemini.")
        
        # FIX: Parse it into a Python dictionary immediately
        tree_data = json.loads(response.text)
        
        # Save the dictionary to the cache, NOT the raw text string
        tree_cache[topic.lower()] = tree_data
        
        return tree_data

    except Exception as e:
        logger.error(f"Error calling Gemini: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate skill tree.")