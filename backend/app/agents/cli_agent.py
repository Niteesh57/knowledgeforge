import json
from typing import Dict, Any
from langchain_core.prompts import PromptTemplate
from app.config import get_llm
from app.graph.state import AgentState

async def generate_cli(state: AgentState) -> Dict[str, Any]:
  llm = get_llm()
  concept = state["concept"]
  prompt = PromptTemplate.from_template("""
  You are the Command Line Interface (CLI) Tutorial Designer for KnowledgeForge.
  Create a step-by-step interactive CLI tutorial to teach the concept '{concept}'.
  Provide 3 to 5 realistic shell/terminal commands that explain this concept in practice.
  For each step, specify the command, the exact expected stdout/stderr output, and a short description explaining what it does.
  
  Respond in JSON format ONLY:
  {{
      "commands": [
          {{
              "command": "The exact shell command to run (e.g., 'git init' or 'docker run nginx')",
              "expected_output": "The realistic console output returned by this command. Make it look like standard stdout/stderr.",
              "description": "Short explanation of what this command demonstrates about the concept"
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
    print(f"CLI generation failed: {e}")
    # Fallback commands list
    fallback = {
        "commands": [
            {
                "command": f"echo 'Welcome to {concept}'",
                "expected_output": f"Welcome to {concept}",
                "description": f"Starting exploration of {concept}."
            },
            {
                "command": "help",
                "expected_output": "Available commands: show-details, run-simulation, exit",
                "description": "Display list of tutorial options."
            }
        ]
    }
    return {"content": fallback}
