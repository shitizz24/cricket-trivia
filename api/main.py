"""
Cricket Trivia API

GET /trivia
  Finds 20 trending cricketers, picks one at random, returns 4 trivia hints.

GET /get-puzzle?date=YYYY-MM-DD
  Returns trivia for the given date from the trivia_players collection.
  If a player already has used_on == date, returns that player.
  Otherwise picks a random unused player, sets used_on = date, and returns it.

Response shape (both endpoints):
  {
    "cricketer-name": "string",
    "hints": [
      {"hint-type": "easy"|"medium"|"hard", "hint-statementt": "string"},
      ...
    ]
  }
"""

import asyncio
import random
from contextlib import asynccontextmanager
from datetime import date

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse
from pymongo import ReturnDocument

from api.agent import generate_trivia
from api.database import close_db, connect_db, get_trivia_players


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="Cricket Trivia API",
    description="Returns trivia hints about a randomly selected trending cricketer.",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/trivia")
async def trivia():
    """
    Full pipeline:
    1. Find 20 trending cricketers (web search via Claude)
    2. Pick one at random
    3. Generate 4 ordered trivia hints (web search via Claude)
    4. Return structured JSON
    """
    try:
        result = await asyncio.to_thread(generate_trivia)
        return JSONResponse(content=result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/get-puzzle")
async def get_puzzle(date: date = Query(..., description="Puzzle date (YYYY-MM-DD)")):
    """
    Return the trivia puzzle for the given date.

    - If a player is already assigned to this date, return it (idempotent).
    - Otherwise pick a random unused player, assign it to this date, and return it.
    - 404 if no unused players remain.
    """
    col = get_trivia_players()

    # 1. Check for an existing assignment for this date
    existing = await col.find_one({"used_on": date.isoformat()})
    if existing:
        return _format_player(existing)

    # 2. Gather all unused players
    unused = await col.find({"used_on": None}).to_list(length=None)
    if not unused:
        raise HTTPException(status_code=404, detail="No unused players available for this date.")

    # 3. Randomly pick one and atomically assign the date
    chosen = random.choice(unused)
    updated = await col.find_one_and_update(
        {"_id": chosen["_id"], "used_on": None},
        {"$set": {"used_on": date.isoformat()}},
        return_document=ReturnDocument.AFTER,
    )

    # Guard against a race where another request claimed it first
    if updated is None:
        raise HTTPException(status_code=409, detail="Concurrent update conflict; please retry.")

    return _format_player(updated)


def _format_player(doc: dict) -> JSONResponse:
    hints = [
        {"hint-type": h["hint_type"], "hint-statement": h["hint_statement"]}
        for h in doc.get("hints", [])
    ]
    return JSONResponse(content={"cricketer-name": doc["player_name"], "hints": hints})


@app.get("/health")
async def health():
    return {"status": "ok"}
