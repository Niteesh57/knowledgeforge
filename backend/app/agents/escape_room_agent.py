import json
from typing import Dict, Any
from langchain_core.prompts import PromptTemplate
from app.config import get_llm
from app.graph.state import AgentState

async def generate_escape_room(state: AgentState) -> Dict[str, Any]:
  llm = get_llm()
  concept = state["concept"]
  prompt = PromptTemplate.from_template("""
  You are the Puzzle Master for the KnowledgeForge Escape Room.
  Create 2 sequential puzzles that teach the core mechanics of '{concept}'.
  Puzzles must have a code or command-line theme. The answers should be simple words, command flags, or lines of code.
  
  Respond in JSON format ONLY:
  {{
      "puzzles": [
          {{
              "context": "Narrative setting or system emergency message explaining the bug/obstacle",
              "question": "The specific question or code puzzle the user must solve",
              "answer": "The exact case-insensitive correct answer string",
              "hint": "A subtle hint to help them solve it"
          }}
      ]
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
    print(f"Escape room generation failed: {e}")
    return {
        "content": {
            "puzzles": [
                {
                    "context": "System failure",
                    "question": "What concept are we studying?",
                    "answer": concept,
                    "hint": "It's the search query"
                }
            ]
        }
    }
