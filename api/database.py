"""
MongoDB connection and schema definitions for Cricket Trivia.

Collection: trivia_players
Schema:
  {
    player_name: str,
    hints: [{ hint_type: str, hint_statement: str }],
    used_on: date | None   # None = not yet assigned to a puzzle date
  }
"""

import os
from datetime import date
from typing import List, Optional

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection
from pydantic import BaseModel

load_dotenv()

MONGODB_URL: str = os.environ["MONGODB_URL"]
MONGODB_DATABASE: str = os.environ["MONGODB_DATABASE"]
COLLECTION_NAME = "trivia_players"


class Hint(BaseModel):
    hint_type: str
    hint_statement: str


class TriviaPlayer(BaseModel):
    player_name: str
    hints: List[Hint]
    used_on: Optional[date] = None


_client: Optional[AsyncIOMotorClient] = None
_trivia_players: Optional[AsyncIOMotorCollection] = None


def get_trivia_players() -> AsyncIOMotorCollection:
    if _trivia_players is None:
        raise RuntimeError("Database not connected. Call connect_db() first.")
    return _trivia_players


async def connect_db() -> None:
    global _client, _trivia_players
    _client = AsyncIOMotorClient(MONGODB_URL)
    db = _client[MONGODB_DATABASE]
    _trivia_players = db[COLLECTION_NAME]


async def close_db() -> None:
    global _client, _trivia_players
    if _client is not None:
        _client.close()
        _client = None
        _trivia_players = None
