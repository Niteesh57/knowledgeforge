from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from app.graph.workflow import app_graph
from typing import Optional

load_dotenv()

app = FastAPI(title="KnowledgeForge API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    concept: str
    medium: Optional[str] = None
    template: Optional[str] = None

async def generate_experience(concept: str, selected_medium: Optional[str] = None, selected_template: Optional[str] = None):
    initial_state = {
        "concept": concept,
        "selected_medium": selected_medium,
        "selected_template": selected_template,
        "router_decision": None,
        "template": None,
        "title": None,
        "description": None,
        "content": None
    }
    
    result = await app_graph.ainvoke(initial_state)
    
    return {
        "medium": result["router_decision"],
        "template": result["template"],
        "title": result["title"],
        "description": result["description"],
        "content": result["content"]
    }

@app.post("/generate")
async def generate_endpoint(request: GenerateRequest):
    result = await generate_experience(request.concept, request.medium, request.template)
    return result

@app.get("/")
def read_root():
    return {"message": "Welcome to KnowledgeForge API"}
