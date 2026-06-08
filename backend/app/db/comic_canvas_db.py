"""
Comic Canvas Store — fast in-memory dictionary lookup.
No internet required, no embedding model needed.
The LLM already specifies exact character/background/pose in its JSON script,
so we do a direct lookup by (cluster, character, background, pose).
Semantic canvas_query matching is done with simple keyword scoring offline.
"""
from typing import List, Dict, Any, Optional

# ─── In-memory index (built at import time from canvas_library) ──────────────
_canvas_index: Dict[str, Dict[str, Any]] = {}   # id → canvas
_cluster_index: Dict[str, List[Dict[str, Any]]] = {}  # cluster → [canvases]

_initialized = False


def _ensure_initialized():
    global _initialized
    if _initialized:
        return
    from app.db.canvas_library import ALL_CANVASES
    for c in ALL_CANVASES:
        _canvas_index[c["id"]] = c
        _cluster_index.setdefault(c["cluster"], []).append(c)
    _initialized = True
    print(f"[CanvasStore] Loaded {len(_canvas_index)} canvases into memory.")


def ingest_canvases(canvases: list):
    """Populate the in-memory index (replaces ChromaDB ingest)."""
    global _initialized
    for c in canvases:
        _canvas_index[c["id"]] = c
        _cluster_index.setdefault(c["cluster"], []).append(c)
    _initialized = True
    print(f"[CanvasStore] Indexed {len(_canvas_index)} canvases.")


def _keyword_score(query: str, canvas: Dict[str, Any]) -> int:
    """Simple keyword overlap score between query and canvas description."""
    query_words = set(query.lower().split())
    desc_words = set(canvas["description"].lower().split())
    char_words = set(canvas["character"].lower().replace("-", " ").split())
    bg_words = set(canvas["background"].lower().replace("-", " ").replace("bg", "").split())
    all_words = desc_words | char_words | bg_words
    return len(query_words & all_words)


def query_canvas(
    description: str,
    cluster: str,
    character: Optional[str] = None,
    background: Optional[str] = None,
    pose: Optional[str] = None,
    n_results: int = 1
) -> List[Dict[str, Any]]:
    """
    Look up the best matching canvas.
    Priority:
    1. Exact match by (cluster, character, background, pose)
    2. Partial match by (cluster, character, background)
    3. Keyword score across the cluster
    """
    _ensure_initialized()
    cluster_canvases = _cluster_index.get(cluster, [])
    if not cluster_canvases:
        # Try any cluster as fallback
        cluster_canvases = list(_canvas_index.values())

    # 1. Exact match
    if character and background and pose:
        exact_id = f"{cluster}-{character}-{background}-{pose}"
        if exact_id in _canvas_index:
            return [_canvas_index[exact_id]]

    # 2. Character + background match (any pose)
    if character and background:
        matches = [
            c for c in cluster_canvases
            if c["character"] == character and c["background"] == background
        ]
        if matches:
            # Prefer requested pose if available
            if pose:
                posed = [m for m in matches if m["pose"] == pose]
                if posed:
                    return posed[:n_results]
            return matches[:n_results]

    # 3. Character match (any background, any pose)
    if character:
        matches = [c for c in cluster_canvases if c["character"] == character]
        if matches:
            return matches[:n_results]

    # 4. Keyword scoring across cluster
    if description:
        scored = sorted(
            cluster_canvases,
            key=lambda c: _keyword_score(description, c),
            reverse=True
        )
        return scored[:n_results]

    # 5. Fallback: first canvas in cluster
    return cluster_canvases[:n_results]
