import json
import re
from typing import Dict, Any, List
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers.json import parse_partial_json
from app.config import get_llm
from app.graph.state import AgentState

def sanitize_llm_json(raw: str) -> str:
    """Fix literal unescaped newlines and tabs inside JSON string values."""
    result = []
    in_string = False
    escape_next = False
    for char in raw:
        if escape_next:
            result.append(char)
            escape_next = False
            continue
        if char == '\\':
            result.append(char)
            escape_next = True
            continue
        if char == '"':
            in_string = not in_string
            result.append(char)
            continue
        if in_string:
            if char == '\n':
                result.append('\\n')
            elif char == '\r':
                result.append('\\r')
            elif char == '\t':
                result.append('\\t')
            else:
                result.append(char)
        else:
            result.append(char)
    return ''.join(result)

async def generate_codebook(state: AgentState) -> Dict[str, Any]:
  llm = get_llm()
  concept = state["concept"]
  prompt = PromptTemplate.from_template("""
  You are the Algorithm & Data Structure Visualizer Designer for KnowledgeForge.
  Your task is to teach '{concept}' through an animated, step-by-step code + visualization experience.

  STEP 1 — Choose the best viz_type from this list:
  - ARRAY: Indexed boxes. Best for: arrays, buffers, strings as char arrays, indexing.
  - LINKED_LIST: Chain of boxes with arrows. Best for: linked lists, doubly-linked, circular.
  - BINARY_TREE: Tree of nodes. Best for: BST, AVL trees, heaps, tree traversal.
  - BINARY_SEARCH: Array with left/mid/right pointers. Best for: binary search, two-pointer, divide & conquer.
  - SORTING: Bar chart that swaps. Best for: bubble sort, merge sort, quick sort, insertion sort.
  - HEATMAP: 2D grid with colored cells. Best for: DP tables, matrix operations, memoization grids.
  - GRAPH: Nodes and edges with traversal. Best for: BFS, DFS, Dijkstra, graph problems.
  - STACK_QUEUE: Vertical stack or horizontal queue. Best for: call stack, undo/redo, BFS queue, LIFO/FIFO.
  - MEMORY: Address table of variables. Best for: pointers, malloc, heap vs stack, references.
  - HASH_TABLE: Array of buckets with chaining. Best for: hash maps, collision handling, dictionaries.

  STEP 2 — Generate up to 5 initial code steps that animate the execution trace.
  If the concept requires more than 5 steps to fully execute, you must set `is_finished` to false. We will paginate the rest later.
  If the concept finishes in 5 steps or less, set `is_finished` to true.

  For each step provide:
  - code: the complete code snippet at this point (in the chosen language).
  - highlight_lines: list of 1-indexed line numbers that are active in this step
  - explanation: clear 1-2 sentence explanation of what's happening
  - viz_state: the current state of the visualization

  VIZ STATE SHAPES per viz_type:
  ARRAY: {{"nodes": [{{"id": "0", "label": "arr[0]", "value": "42", "active": false}}], "pointer": "0" | null}}
  LINKED_LIST: {{"nodes": [{{"id": "n0", "label": "Node", "value": "5", "next": "n1" | null, "active": false}}], "head": "n0"}}
  BINARY_TREE: {{"nodes": [{{"id": "n0", "label": "Root", "value": "50", "left": "n1" | null, "right": "n2" | null, "active": false}}], "root": "n0"}}
  BINARY_SEARCH: {{"nodes": [{{"id": "0", "label": "arr[0]", "value": "2", "active": false, "eliminated": false}}], "left": "0", "right": "6", "mid": "3", "target": "7"}}
  SORTING: {{"nodes": [{{"id": "0", "label": "0", "value": "64", "height": 64, "active": false, "sorted": false}}], "comparing": ["0", "1"] | null}}
  HEATMAP: {{"rows": 3, "cols": 4, "cells": [{{"row": 0, "col": 0, "value": "0", "intensity": 0.0, "active": false}}]}}
  GRAPH: {{"nodes": [{{"id": "A", "label": "A", "visited": false, "active": false, "x": 100, "y": 50}}], "edges": [{{"from": "A", "to": "B", "active": false, "directed": true}}], "queue": []}}
  STACK_QUEUE: {{"type": "stack" | "queue", "items": [{{"id": "0", "label": "item", "value": "42", "active": false}}], "operation": "push" | "pop" | "enqueue" | "dequeue" | null}}
  MEMORY: {{"variables": [{{"name": "ptr", "value": "0x100", "address": "0x200", "type": "int*", "active": false}}], "heap": [{{"address": "0x100", "value": "42", "allocated": true, "active": false}}]}}
  HASH_TABLE: {{"size": 7, "buckets": [{{"index": 0, "chain": [{{"key": "name", "value": "Alice", "active": false}}]}}]}}

  Choose the best language for the concept (C, Python, JavaScript, Java, or pseudocode).
  Make the code realistic and educational — not toy examples.
  CRITICAL: You must properly escape all newlines in strings as `\\n` and escape quotes as `\\"`. Do NOT output literal unescaped newlines inside JSON string values.

  Respond in JSON format ONLY:
  {{
      "language": "python",
      "viz_type": "ARRAY",
      "is_finished": false,
      "code_steps": [
          {{
              "code": "code snapshot at this step",
              "highlight_lines": [1, 2],
              "explanation": "What is happening at this step",
              "viz_state": {{}}
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

    data = parse_partial_json(sanitize_llm_json(content.strip()))
    return {"content": data}
  except Exception as e:
    print(f"Codebook generation failed: {e}")
    return {
        "content": {
            "language": "python",
            "viz_type": "ARRAY",
            "is_finished": True,
            "code_steps": [
                {
                    "code": f"# Exploring {concept}\narr = []",
                    "highlight_lines": [2],
                    "explanation": f"We begin exploring {concept} by initializing an empty array.",
                    "viz_state": {
                        "nodes": [
                            {"id": "0", "label": "arr[0]", "value": "?", "active": False}
                        ],
                        "pointer": None
                    }
                }
            ]
        }
    }

async def generate_next_codebook_steps(concept: str, language: str, viz_type: str, last_step: Dict[str, Any]) -> Dict[str, Any]:
  llm = get_llm()
  prompt = PromptTemplate.from_template("""
  You are continuing an execution trace for the concept '{concept}'.
  The language is {language} and the visualization type is {viz_type}.
  
  Here is the state of the LAST executed step:
  {last_step_json}
  
  Your task is to generate the NEXT batch of up to 5 code steps, continuing exactly from where the last step left off.
  If the execution finishes within these next 5 steps, set `is_finished` to true. Otherwise, set it to false.
  CRITICAL: You must properly escape all newlines in strings as `\\n` and escape quotes as `\\"`. Do NOT output literal unescaped newlines inside JSON string values.
  
  Respond in JSON format ONLY:
  {{
      "is_finished": false,
      "code_steps": [
          {{
              "code": "code snapshot at this step",
              "highlight_lines": [3, 4],
              "explanation": "What is happening at this step",
              "viz_state": {{}}
          }}
      ]
  }}
  """)
  
  try:
    chain = prompt | llm
    response = await chain.ainvoke({
        "concept": concept,
        "language": language,
        "viz_type": viz_type,
        "last_step_json": json.dumps(last_step, indent=2)
    })
    content = response.content

    if "```json" in content:
      content = content.split("```json")[1].split("```")[0]
    elif "```" in content:
      content = content.split("```")[1].split("```")[0]

    data = parse_partial_json(sanitize_llm_json(content.strip()))
    return data
  except Exception as e:
    print(f"Codebook pagination failed: {e}")
    return {"is_finished": True, "code_steps": []}
