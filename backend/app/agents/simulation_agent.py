import json
from typing import Dict, Any
from langchain_core.prompts import PromptTemplate
from app.config import get_llm
from app.graph.state import AgentState

async def generate_simulation(state: AgentState) -> Dict[str, Any]:
  llm = get_llm()
  concept = state["concept"]
  prompt = PromptTemplate.from_template("""
  You are the Simulation Designer for KnowledgeForge.
  Design an interactive 2D simulation layout for '{concept}'. 
  List 2-4 entities (e.g. Queue, CPU, Worker, Client, Pod, LoadBalancer) that exist in this system, and state the rules of interaction.
  
  Respond in JSON format ONLY:
  {{
      "entities": [
          {{
              "name": "Name of entity",
              "type": "master" | "node" | "worker" | "queue" | "client",
              "description": "Visual/functional explanation of what it does"
          }}
      ],
      "expected_order": [
          ["Name of entity 1"], 
          ["Name of entity 2", "Name of entity 3"]
      ],
      "mechanics": "Explain that the user must drag and arrange the entities horizontally from left to right. Entities in the same sub-array should be placed in the same vertical column."
  }}
  """)
  try:
    chain = prompt | llm
    response = await chain.ainvoke({"concept": concept})
    content = response.content
    if "```json" in content:
      content = content.split("```json")[1].split("```")[0]
    elif "```" in content:
      content = content.split("```")[1].split("```")[0]
    data = json.loads(content.strip())
    return {"content": data}
  except Exception as e:
    print(f"Simulation generation failed: {e}")
    return {
        "content": {
            "entities": [
                {
                    "name": "Default Component",
                    "type": "node",
                    "description": "System unit"
                }
            ],
            "mechanics": "Explore layout"
        }
    }
