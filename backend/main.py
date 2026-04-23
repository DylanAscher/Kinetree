import asyncio
import json
import os
import uuid
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

class Node(BaseModel):
    id: str
    label: str
    description: str
    difficulty: str
    parent_ids: list[str]
    resource_link: str # Ensuring the AI populates this with a real URL

class SkillTree(BaseModel):
    nodes: list[Node]

@app.get("/generate-tree")
async def generate_tree(topic: str):
    async def event_generator():
        current_model = 'gemini-3.1-flash-lite-preview'
        
        yield f"data: {json.dumps({'type': 'progress', 'model': current_model, 'message': 'Initializing Cognitive Parsing...'})}\n\n"
        
        try:
            # Overhauled Prompt for Hyper-Specificity and Real URLs
            prompt = f"""
            You are Kinetree, an advanced cognitive map generator.
            Create a highly specific, actionable skill tree for the topic: "{topic}".
            
            CRITICAL INSTRUCTIONS FOR CONTENT:
            1. 'label': Make it hyper-specific (e.g., "React useEffect Hook" NOT just "React Hooks").
            2. 'description': Detail exactly WHAT they are learning and WHY it matters. Do not use vague filler. 
            3. 'resource_link': You MUST provide a REAL, highly-applicable URL to a free resource (Wikipedia, official docs, Coursera, W3Schools, freeCodeCamp, specific high-quality text tutorials). Do NOT give a YouTube search link. Give an actual applicable site link.
            
            STRICT LAYOUT & CONNECTIONS:
            1. 'parent_ids': The very first root node for this topic MUST have an empty list [] for its parent_ids.
            2. For the rest of the tree, ensure node `id`s are simple, sequential strings (e.g., "1", "2", "3"). This is CRITICAL so you can accurately link them in 'parent_ids' without making a typo. 
            3. Focus entirely on logical progression.
            
            Ensure logical progression using the 'parent_ids' array. Give nodes a simple string ID like "node1", "node2".
            """

            response = client.models.generate_content(
                model=current_model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=SkillTree,
                    temperature=0.3, 
                ),
            )
            
            raw_text = response.text.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
            raw_text = raw_text.strip()
            
            tree_data = json.loads(raw_text)
            # --------------------------------------------------------

            yield f"data: {json.dumps({'type': 'success', 'data': tree_data})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': f'Fatal Error: {str(e)}'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.get("/expand-tree")
async def expand_tree(topic: str, parent_id: str, start_x: int, start_y: int):
    async def event_generator():
        current_model = 'gemini-3.1-flash-lite-preview'
        yield f"data: {json.dumps({'type': 'progress', 'model': current_model, 'message': 'Synthesizing deeper knowledge...'})}\n\n"
        
        try:
            # Overhauled Prompt for Expansion
            prompt = f"""
            You are Kinetree. Expand the skill tree for the sub-topic "{topic}".
            Create 3 to 5 new, hyper-specific child nodes that delve deeper into "{topic}".
            
            CRITICAL INSTRUCTIONS FOR CONTENT:
            1. 'label': Make it highly specific and actionable.
            2. 'description': Detail exactly WHAT they are learning and WHY. Do not be vague. 
            3. 'resource_link': You MUST provide a REAL, highly-applicable URL to a free resource (Wikipedia, official docs, W3Schools, specific high-quality tutorials). Do NOT give a YouTube search link. Give an actual site link.
            
            STRICT LAYOUT & CONNECTIONS:
            1. 'parent_ids': The very first node(s) in this new sequence MUST strictly include "{parent_id}" in their parent_ids list.
            2. X-Coordinates: The immediate children MUST start at exactly X: {start_x + 350}. Any further columns step forward by 350px.
            3. Y-Coordinates: Center them around Y: {start_y}, separating concurrent nodes in the same column by at least 150px vertically.
            
            Ensure the node IDs are simple strings. Give them a unique prefix like "exp-{uuid.uuid4().hex[:6]}-" to avoid overlapping.
            """

            response = client.models.generate_content(
                model=current_model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=SkillTree,
                    temperature=0.3, 
                ),
            )
            
            tree_data = json.loads(response.text)
            yield f"data: {json.dumps({'type': 'success', 'data': tree_data})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': f'Fatal Error: {str(e)}'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")