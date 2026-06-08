from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from app.graph.workflow import app_graph
from app.agents.codebook_agent import generate_next_codebook_steps
from app.agents.comic_agent import generate_next_comic_page, CLUSTER_ROSTER
from typing import Optional, Dict, Any, List

load_dotenv()

app = FastAPI(title="KnowledgeForge API")

@app.on_event("startup")
async def startup_event():
    """Pre-warm the in-memory indices on startup."""
    try:
        from app.db.comic_canvas_db import ingest_canvases
        from app.db.canvas_library import ALL_CANVASES
        ingest_canvases(ALL_CANVASES)
        print("[Startup] Loaded comic canvases.")
        
        # Load Memes
        from app.db.meme_db import load_memes
        load_memes()
        print("[Startup] Loaded meme database.")
    except Exception as e:
        print(f"Error during startup indexing: {e}")

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
    active_folder: Optional[str] = None

class TraceNextRequest(BaseModel):
    concept: str
    language: str
    viz_type: str
    last_step: Dict[str, Any]

async def generate_experience(request: GenerateRequest):
    state = {
        "concept": request.concept,
        "selected_medium": request.medium,
        "selected_template": request.template,
        "router_decision": None,
        "template": None,
        "title": None,
        "description": None,
        "content": None
    }
    
    folder = request.active_folder or request.medium
    if folder == "SIMULATION":
        from app.agents.simulation_agent import generate_simulation
        result = await generate_simulation(state)
    elif folder == "COMIC":
        from app.agents.comic_agent import generate_comic
        result = await generate_comic(state)
    elif folder == "CODEBOOK":
        from app.agents.codebook_agent import generate_codebook
        result = await generate_codebook(state)
    elif folder == "MEME":
        from app.agents.meme_agent import generate_meme_article
        result = await generate_meme_article(state)
    else:
        result = await app_graph.ainvoke(state)
    
    return {
        "medium": result.get("router_decision") or folder,
        "template": result.get("template"),
        "title": result.get("title"),
        "description": result.get("description"),
        "content": result.get("content")
    }

@app.post("/generate")
async def generate_endpoint(request: GenerateRequest):
    result = await generate_experience(request)
    return result

@app.post("/generate-trace-steps")
async def generate_trace_steps_endpoint(request: TraceNextRequest):
    result = await generate_next_codebook_steps(request.concept, request.language, request.viz_type, request.last_step)
    return result

class ComicPageRequest(BaseModel):
    concept: str
    cluster: str
    page_num: int = 2
    story_so_far: str = ""

@app.post("/generate-comic-page")
async def generate_comic_page_endpoint(request: ComicPageRequest):
    result = await generate_next_comic_page(
        request.concept, request.cluster, request.page_num, request.story_so_far
    )
    return result

@app.get("/comic-clusters")
def get_comic_clusters():
    clusters = []
    emoji_map = {
        "dc_justice": "🦇",
        "marvel_mashup": "🕷️",
        "disney": "🐭",
        "tom_jerry": "🐱",
        "kick_buttowski": "🛹",
        "stranger_things": "💡",
        "ben10": "👽",
        "glitch_rider": "💻",
    }
    color_map = {
        "dc_justice": "#2b1055",
        "marvel_mashup": "#ef233c",
        "disney": "#e60000",
        "tom_jerry": "#697d91",
        "kick_buttowski": "#f1c40f",
        "stranger_things": "#e50914",
        "ben10": "#39ff14",
        "glitch_rider": "#00ffff",
    }
    for key, roster in CLUSTER_ROSTER.items():
        clusters.append({
            "id": key,
            "name": key.replace("_", " ").title(),
            "description": roster["description"],
            "emoji": emoji_map.get(key, "🎨"),
            "color": color_map.get(key, "#555"),
            "characters": roster["characters"]
        })
    return {"clusters": clusters}

@app.get("/")
def read_root():
    return {"message": "Welcome to KnowledgeForge API"}
