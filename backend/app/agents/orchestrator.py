import json
from typing import Dict, Any
from langchain_core.prompts import PromptTemplate
from app.config import get_llm
from app.graph.state import AgentState

async def route_experience(state: AgentState) -> Dict[str, Any]:
  concept = state["concept"]
  selected_medium = state.get("selected_medium")
  selected_template = state.get("selected_template")

  # Mapping dict for all supported mediums
  medium_mapping = {
      "COMIC":       ("COMIC",    "COMIC_STRIP"),
      "ESCAPE_ROOM": ("ESCAPE_ROOM", "ESCAPE_ROOM_GAME"),
      "SIMULATION":  ("SIMULATION",  "DYNAMIC_SIMULATION"),
      "CLI":         ("CLI",     "CLI_SIMULATOR"),
      "BROWSER":     ("BROWSER", "BROWSER_SIM"),
      "GAME":        ("GAME",    "GAME_TEMPLATE"),
      "CODEBOOK":    ("CODEBOOK","ALGO_VIZ"),
  }

  # If user explicitly requested a medium, map it directly
  if selected_medium in medium_mapping:
    decision, template = medium_mapping[selected_medium]

    if decision == "GAME":
        if selected_template:
            return {
                "router_decision": "GAME",
                "template": selected_template,
                "title": f"The {concept} Game",
                "description": f"Playing {selected_template} for {concept}."
            }
        else:
            return {
                "router_decision": "GAME_PROPOSAL",
                "template": "PROPOSAL",
                "title": f"Game Proposal: {concept}",
                "description": "Select the best game format."
            }

    return {
        "router_decision": decision,
        "template": template,
        "title": f"The {concept} Guide",
        "description": f"Learn about {concept} step-by-step."
    }

  llm = get_llm()
  prompt = PromptTemplate.from_template("""
  You are the Experience Orchestrator for KnowledgeForge.
  Analyze the concept: '{concept}' and decide which of the following is the BEST way to teach it.

  Available mediums:
  - 'COMIC': Best for history, high-level architecture, metaphor-heavy concepts, flows (OAuth, SSO, history of Git, how the internet works)
  - 'ESCAPE_ROOM': Best for interactive logical quizzes, debugging scenarios, finding the right answer in a mystery format
  - 'SIMULATION': Best for multi-entity dynamic processes (Kubernetes scheduling, ThreadPool, garbage collection, load balancer)
  - 'CLI': Best for step-by-step terminal commands, environment setups, shell scripting, Docker, Git CLI, database migrations
  - 'BROWSER': Best for software setup wizards in web consoles, cloud dashboards (AWS, Azure, GitHub, Vercel, Firebase), UI-driven procedures where you click through forms
  - 'GAME': Best for terminology-heavy concepts, classification tasks, ordered sequences (OSI layers, SDLC), boolean logic, rapid-recall facts, key-value matching (port↔protocol)
  - 'CODEBOOK': Best for programming concepts, data structures (arrays, linked lists, trees, graphs), algorithms (sorting, searching, DP), memory management, pointers, hash maps

  Respond in JSON format ONLY:
  {{
      "decision": "COMIC" | "ESCAPE_ROOM" | "SIMULATION" | "CLI" | "BROWSER" | "GAME" | "CODEBOOK",
      "template": "COMIC_STRIP" | "ESCAPE_ROOM_GAME" | "DYNAMIC_SIMULATION" | "CLI_SIMULATOR" | "BROWSER_SIM" | "GAME_TEMPLATE" | "ALGO_VIZ",
      "title": "A highly creative title for the experience",
      "description": "A hook/description describing the story/puzzle/simulation/game/viz setup"
  }}
  """)

  try:
    chain = prompt | llm
    response = await chain.ainvoke({"concept": concept})
    content = response.content

    # Clean json wrappers
    if "```json" in content:
      content = content.split("```json")[1].split("```")[0]
    elif "```" in content:
      content = content.split("```")[1].split("```")[0]

    data = json.loads(content.strip())

    decision = data.get("decision", "CLI")
    fallback_templates = {
        "COMIC":       "COMIC_STRIP",
        "ESCAPE_ROOM": "ESCAPE_ROOM_GAME",
        "SIMULATION":  "DYNAMIC_SIMULATION",
        "CLI":         "CLI_SIMULATOR",
        "BROWSER":     "BROWSER_SIM",
        "GAME":        "GAME_TEMPLATE",
        "CODEBOOK":    "ALGO_VIZ",
    }
    template = data.get("template", fallback_templates.get(decision, "CLI_SIMULATOR"))

    return {
        "router_decision": decision,
        "template": template,
        "title": data.get("title", f"The {concept} Challenge"),
        "description": data.get("description", f"Learn {concept} in depth.")
    }
  except Exception as e:
    print(f"Routing failed: {e}")
    return {
        "router_decision": "CLI",
        "template": "CLI_SIMULATOR",
        "title": f"The {concept} Tutorial",
        "description": "Run shell commands in the terminal simulator."
    }
