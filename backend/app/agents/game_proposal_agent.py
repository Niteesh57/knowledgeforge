import json
from typing import Dict, Any
from langchain_core.prompts import PromptTemplate
from app.config import get_llm
from app.graph.state import AgentState

async def generate_game_proposal(state: AgentState) -> Dict[str, Any]:
    concept = state["concept"]
    llm = get_llm()
    
    prompt = PromptTemplate.from_template("""
    You are the Game Proposal Agent for KnowledgeForge.
    The user wants to learn about the concept: '{concept}' using a game.
    
    Select the top 3 best game templates from the following list that would suit this concept.
    Also, select 1 alternative medium in case the concept is not suitable for a game.
    
    Game Templates:
    - 'CATCH_DROP': Best for rapid categorization or sorting facts.
    - 'WORD_DECODE': Best for terminology, definitions, and acronyms.
    - 'MAZE_ESCAPE': Best for decision trees, sequential logic, or finding the right path.
    - 'MEMORY_FLIP': Best for pairing concepts, terms to definitions.
    - 'SEQUENCE_SORT': Best for ordered lists (e.g., OSI model, SDLC steps).
    - 'BINARY_JUMP': Best for true/false or binary classification.
    - 'SPACE_SHOOTER': Best for identifying correct targets out of a moving group.
    - 'CIRCUIT_CONNECT': Best for mapping relationships or networks.
    
    Alternative Mediums:
    - 'BROWSER', 'CLI', 'COMIC', 'SIMULATION', 'ESCAPE_ROOM', 'CODEBOOK'
    
    Respond in JSON format ONLY matching this structure:
    {{
        "options": [
            {{
                "type": "GAME",
                "template": "TEMPLATE_NAME",
                "title": "A catchy title for this game",
                "description": "Brief explanation of why this game fits the concept."
            }},
            {{
                "type": "GAME",
                "template": "ANOTHER_TEMPLATE_NAME",
                "title": "Another catchy title",
                "description": "Brief explanation."
            }},
            {{
                "type": "GAME",
                "template": "THIRD_TEMPLATE_NAME",
                "title": "Third catchy title",
                "description": "Brief explanation."
            }},
            {{
                "type": "ALTERNATIVE",
                "medium": "MEDIUM_NAME",
                "title": "A catchy title for the alternative",
                "description": "Brief explanation of why this alternative medium might be better if games aren't suitable."
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
        
        return {
            "content": {
                "options": data.get("options", [])
            }
        }
    except Exception as e:
        print(f"Game Proposal Agent failed: {e}")
        # Fallback
        return {
            "content": {
                "options": [
                    {
                        "type": "GAME",
                        "template": "WORD_DECODE",
                        "title": "Word Decoder",
                        "description": "Decode the core terms."
                    },
                    {
                        "type": "GAME",
                        "template": "SPACE_SHOOTER",
                        "title": "Space Shooter",
                        "description": "Shoot the right answers."
                    },
                    {
                        "type": "GAME",
                        "template": "MEMORY_FLIP",
                        "title": "Memory Match",
                        "description": "Match the pairs."
                    },
                    {
                        "type": "ALTERNATIVE",
                        "medium": "CLI",
                        "title": "Terminal Simulator",
                        "description": "If gaming doesn't fit, try running commands."
                    }
                ]
            }
        }
