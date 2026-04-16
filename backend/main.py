import asyncio
import json
import os
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from pydantic import BaseModel
from dotenv import load_dotenv
import uuid # Add this to your imports at the top

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

# 1. Add resource_link to the Pydantic model
class Node(BaseModel):
    id: str
    label: str
    description: str
    difficulty: str
    x: int
    y: int
    parent_ids: list[str]
    resource_link: str # NEW

class SkillTree(BaseModel):
    nodes: list[Node]

@app.get("/generate-tree")
async def generate_tree(topic: str):
    async def event_generator():
        # Updated to first Gemini 3.1 Flash lite preview
        current_model = 'gemini-3.1-flash-lite-preview'
        
        yield f"data: {json.dumps({'type': 'progress', 'model': current_model, 'attempt': 1, 'message': 'Forming your skill tree...'})}\n\n"
        
        try:
            # The X-axis MUST step by exactly 250 to satisfy your App.jsx edge generation logic
            # The Y-axis difference MUST be <= 150 between connecting columns
            prompt = f"""
            Create a highly detailed, comprehensive skill tree for learning: {topic}.
            Depending on the topic, the tree should generate a certain amount of nodes.
            1. For broad topics (e.g., "Programming"), generate around 20-35 nodes.
            2. For more specific topics (e.g., "Python Web Development"), generate around 10-20 nodes.
            3. For niche topics (e.g., "Flask Framework"), generate around 7-10 nodes.
            
            CONTENT DEPTH: Break the topic down into professional-grade sub-skills.
            
            RESOURCES: For every node, provide a 'resource_link'. This MUST be a YouTube search URL formatted exactly like this, replacing spaces with +: 
            https://www.youtube.com/results?search_query=learn+[Specific+Skill]+[Topic]
            
            STRICT LAYOUT & CONNECTIONS:
            I do not have visual reasoning, so you MUST follow these mathematical rules to prevent line intersections:
            1. 'parent_ids': Explicitly map the edges. Starting nodes have [].
            2. X-Coordinates: A node's X coordinate MUST be exactly 450px greater than the X coordinate of its parent. Never skip columns, and never place a child node backwards. (e.g., Start is 0. Its children are 450. Their children are 900).
            3. Y-Coordinates: Separate concurrent nodes in the same column by at least 125px vertically.
            
            Ensure the node IDs are simple strings (e.g., "1", "2").
            """

            response = client.models.generate_content(
                model=current_model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=SkillTree,
                    temperature=0.2, 
                ),
            )
            
            tree_data = json.loads(response.text)
            yield f"data: {json.dumps({'type': 'success', 'data': tree_data})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': f'Fatal Error: {str(e)}'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.get("/expand-tree")
async def expand_tree(topic: str, parent_id: str, start_x: int, start_y: int):
    async def event_generator():
        current_model = 'gemini-3.1-flash-lite-preview'
        yield f"data: {json.dumps({'type': 'progress', 'message': f'Expanding branch: {topic}...' })}\n\n"
        
        try:
            prompt = f"""
            Expand the skill tree for the sub-topic: "{topic}".
            Generate exactly 3 to 5 new nodes that dive deeper into this specific skill.
            
            RESOURCES: For every node, provide a 'resource_link'. This MUST be a YouTube search URL formatted exactly like this, replacing spaces with +: 
            https://www.youtube.com/results?search_query=learn+[Specific+Skill]+[Topic]
            
            STRICT LAYOUT & CONNECTIONS:
            1. 'parent_ids': The very first node(s) in this new sequence MUST strictly include "{parent_id}" in their parent_ids list. Subsequent nodes should connect to each other logically.
            2. X-Coordinates: The immediate children MUST start at exactly X: {start_x + 350}. Any further columns step forward by 350px.
            3. Y-Coordinates: Center them around Y: {start_y}, separating concurrent nodes in the same column by at least 200px vertically.
            
            Ensure the node IDs are simple strings. Give them a unique prefix like "exp-{uuid.uuid4().hex[:6]}-" to avoid overlapping with existing nodes.
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