import json
import os
import re
import random
from typing import List, Dict, Any

MEME_FILE = os.path.join(os.path.dirname(__file__), '..', '..', 'meme', 'programmerhumor.jsonl')
ALL_MEMES = []
MEME_INDEX = []

def tokenize(text: str) -> set:
    text = text.lower()
    return set(re.findall(r'\b[a-z0-9]+\b', text))

def load_memes():
    global ALL_MEMES, MEME_INDEX
    if ALL_MEMES:
        return
        
    if not os.path.exists(MEME_FILE):
        print(f"[Meme DB] File not found: {MEME_FILE}")
        return
        
    print(f"[Meme DB] Loading memes from {MEME_FILE}...")
    with open(MEME_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            if not line.strip(): continue
            try:
                data = json.loads(line)
                ALL_MEMES.append(data)
                
                # Create a rich text representation for keyword overlap
                # We weight title, tags, and categories heavily
                text_corpus = data.get("title", "") + " "
                text_corpus += " ".join(data.get("tags", [])) + " "
                text_corpus += " ".join(data.get("categories", [])) + " "
                
                MEME_INDEX.append(tokenize(text_corpus))
            except json.JSONDecodeError:
                pass
            
    print(f"[Meme DB] Loaded {len(ALL_MEMES)} memes.")

def query_memes(query: str, n_results: int = 3) -> List[Dict[str, Any]]:
    """Query the in-memory meme dataset for relevant memes based on keyword overlap."""
    if not ALL_MEMES:
        load_memes()
        
    if not ALL_MEMES:
        return []
        
    query_tokens = tokenize(query)
    
    # If no tokens, just return random
    if not query_tokens:
        return random.sample(ALL_MEMES, min(n_results, len(ALL_MEMES)))
        
    scores = []
    for i, tokens in enumerate(MEME_INDEX):
        score = len(query_tokens.intersection(tokens))
        if score > 0:
            scores.append((score, i))
            
    # Sort by highest score, then add a bit of randomness to ties so it's not always the exact same meme
    scores.sort(reverse=True, key=lambda x: (x[0], random.random()))
    
    results = []
    for score, idx in scores[:n_results]:
        results.append(ALL_MEMES[idx])
        
    # If no matches found, fallback to random
    if not results:
        return random.sample(ALL_MEMES, min(n_results, len(ALL_MEMES)))
        
    return results
