import json
from typing import Dict, Any
from langchain_core.prompts import PromptTemplate
from app.config import get_llm
from app.graph.state import AgentState

async def generate_game(state: AgentState) -> Dict[str, Any]:
  llm = get_llm()
  concept = state["concept"]
  prompt = PromptTemplate.from_template("""
  You are the Micro-Game Designer for KnowledgeForge. Your job is to:
  1. Pick the BEST game template for teaching '{concept}'
  2. Generate 2 to 4 game levels with learning content

  GAME TEMPLATE OPTIONS (pick exactly ONE based on what fits best):
  - CATCH_DROP: Player moves a catcher left/right. Correct items fall from top, wrong items are obstacles. Best for: sorting, filtering, classification, true/false fact recall.
  - WORD_DECODE: An encrypted term is shown. Player gets one clue at a time and must type the correct term. Best for: terminology, definitions, acronyms (DNS, TCP, API, REST).
  - MAZE_ESCAPE: Player navigates a maze. Dead ends have wrong answers labeled, correct path has right answers. Best for: sequential processes, decision trees, algorithm flow.
  - MEMORY_FLIP: Flip cards to find matching concept-definition pairs. Best for: key-value pairs like protocol↔port, command↔effect, term↔meaning.
  - SEQUENCE_SORT: Drag numbered steps onto a conveyor belt in the correct order. Best for: ordered processes like Git workflow, OSI layers, SDLC, boot sequence.
  - BINARY_JUMP: Platformer - jump on platforms labeled True/False or Yes/No to answer questions. Best for: boolean logic, binary decisions, validation checks.
  - SPACE_SHOOTER: Player controls a rocket at the bottom. Enemies (concepts) fall from the top. Player must move left/right and shoot them in the correct sequential order. Best for: ordered processes like OSI layers, SDLC, step-by-step logic.
  - CIRCUIT_CONNECT: Drag wire connections between nodes to complete a circuit. Correct connections glow. Best for: graph relationships, network topology, data flow connections.

  For the chosen template, generate levels with this EXACT structure.
  The "items" array shape depends on the template:

  CATCH_DROP: items = [{{"label": "string", "correct": true|false}}]
  SPACE_SHOOTER: items = [{{"order": 1, "label": "step description"}}]
  MEMORY_FLIP: items = [{{"term": "string", "definition": "string"}}]  (4-6 pairs)
  SEQUENCE_SORT: items = [{{"order": 1, "label": "step description"}}]  (4-7 steps)
  BINARY_JUMP: items = [{{"question": "string", "platform_label": "True|False", "correct": true|false}}]
  WORD_DECODE: items = [{{"answer": "string", "clues": ["clue1", "clue2", "clue3"]}}]
  MAZE_ESCAPE: items = [{{"choice_label": "string", "is_correct_path": true|false, "explanation": "string"}}]
  CIRCUIT_CONNECT: items = [{{"from_node": "string", "to_node": "string", "correct": true|false, "label": "string"}}]

  Respond in JSON format ONLY:
  {{
      "game_template": "TEMPLATE_NAME",
      "instructions": "Short, fun instruction text shown to player (1-2 sentences)",
      "levels": [
          {{
              "concept_title": "Short title of what this level teaches",
              "concept_explanation": "Clear 2-3 sentence explanation revealed after winning this level",
              "items": [],
              "win_score": 5,
              "time_limit_seconds": 30
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
    print(f"Game generation failed: {e}")
    return {
        "content": {
            "game_template": "CATCH_DROP",
            "instructions": f"Catch the CORRECT items about {concept} and dodge the wrong ones!",
            "levels": [
                {
                    "concept_title": f"Understanding {concept}",
                    "concept_explanation": f"{concept} is a fundamental concept in computer science. Understanding it helps build better systems.",
                    "items": [
                        {"label": "Correct", "correct": True},
                        {"label": "Wrong", "correct": False},
                        {"label": "True", "correct": True},
                        {"label": "False", "correct": False}
                    ],
                    "win_score": 5,
                    "time_limit_seconds": 30
                }
            ]
        }
    }
