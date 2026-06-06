from typing import Literal
from langgraph.graph import StateGraph, END
from app.graph.state import AgentState
from app.agents.orchestrator import route_experience
from app.agents.comic_agent import generate_comic
from app.agents.escape_room_agent import generate_escape_room
from app.agents.simulation_agent import generate_simulation
from app.agents.cli_agent import generate_cli
from app.agents.browser_agent import generate_browser
from app.agents.game_agent import generate_game
from app.agents.codebook_agent import generate_codebook

# Define the router transition
def decider_router(state: AgentState) -> Literal["COMIC", "ESCAPE_ROOM", "SIMULATION", "CLI", "BROWSER", "GAME", "CODEBOOK"]:
  return state["router_decision"] or "CLI"

# Build State Graph
workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("route_experience", route_experience)
workflow.add_node("COMIC", generate_comic)
workflow.add_node("ESCAPE_ROOM", generate_escape_room)
workflow.add_node("SIMULATION", generate_simulation)
workflow.add_node("CLI", generate_cli)
workflow.add_node("BROWSER", generate_browser)
workflow.add_node("GAME", generate_game)
workflow.add_node("CODEBOOK", generate_codebook)

# Set Entry Point
workflow.set_entry_point("route_experience")

# Add Conditional Edges
workflow.add_conditional_edges(
    "route_experience",
    decider_router,
    {
        "COMIC":       "COMIC",
        "ESCAPE_ROOM": "ESCAPE_ROOM",
        "SIMULATION":  "SIMULATION",
        "CLI":         "CLI",
        "BROWSER":     "BROWSER",
        "GAME":        "GAME",
        "CODEBOOK":    "CODEBOOK",
    }
)

# Connect all nodes to END
workflow.add_edge("COMIC",       END)
workflow.add_edge("ESCAPE_ROOM", END)
workflow.add_edge("SIMULATION",  END)
workflow.add_edge("CLI",         END)
workflow.add_edge("BROWSER",     END)
workflow.add_edge("GAME",        END)
workflow.add_edge("CODEBOOK",    END)

app_graph = workflow.compile()
