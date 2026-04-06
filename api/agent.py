"""
Cricket Trivia Agent
Chains two Claude-powered skills via the Anthropic API with a web_search tool.
"""

import json
import logging
import os
import random
import re
import time
from datetime import date
from pathlib import Path

import anthropic
from ddgs import DDGS
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)

# Suppress noisy third-party loggers
for _noisy in ("httpx", "httpcore", "anthropic", "primp", "duckduckgo_search"):
    logging.getLogger(_noisy).setLevel(logging.WARNING)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

PROJECT_ROOT = Path(__file__).parent.parent
SKILLS_DIR = PROJECT_ROOT / ".claude" / "skills"

MODEL = os.environ.get("CLAUDE_MODEL", "claude-sonnet-4-6")

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

# ---------------------------------------------------------------------------
# Web search tool definition + implementation
# ---------------------------------------------------------------------------

WEB_SEARCH_TOOL: anthropic.types.ToolParam = {
    "name": "web_search",
    "description": (
        "Search the web for up-to-date information. "
        "Returns a list of results with title, href, and body."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "The search query string.",
            }
        },
        "required": ["query"],
    },
}


def _execute_web_search(query: str) -> str:
    """Run a DuckDuckGo search and return results as a JSON string."""
    time.sleep(1)  # rate-limit guard
    try:
        results = list(DDGS().text(query, max_results=5))
        if not results:
            log.warning("[web_search] empty results for: %s", query)
            return json.dumps({"message": f"No results found for: {query}"})
        return json.dumps(results, ensure_ascii=False)
    except Exception as exc:
        log.warning("[web_search] error for '%s': %s", query, exc)
        return json.dumps({"error": str(exc), "query": query})


# ---------------------------------------------------------------------------
# Core agent loop
# ---------------------------------------------------------------------------

MAX_TURNS = 8  # hard cap to prevent runaway loops


def run_with_tools(system_prompt: str, user_message: str, label: str = "agent") -> str:
    """
    Run a Claude agentic loop with the web_search tool.
    Continues until Claude stops calling tools, returns final text, or hits MAX_TURNS.
    """
    messages: list[anthropic.types.MessageParam] = [
        {"role": "user", "content": user_message}
    ]

    for turn in range(1, MAX_TURNS + 1):
        log.info("[%s] ── CLAUDE API CALL (turn %d/%d) ──────────────", label, turn, MAX_TURNS)
        log.info("[%s]   model    : %s", label, MODEL)
        log.info("[%s]   messages : %d in history", label, len(messages))

        response = client.messages.create(
            model=MODEL,
            max_tokens=4096,
            system=system_prompt,
            tools=[WEB_SEARCH_TOOL],
            tool_choice={"type": "auto", "disable_parallel_tool_use": True},
            messages=messages,
        )

        log.info("[%s] ── CLAUDE API RESPONSE (turn %d) ────────────────", label, turn)
        log.info("[%s]   stop_reason   : %s", label, response.stop_reason)
        log.info("[%s]   input_tokens  : %d", label, response.usage.input_tokens)
        log.info("[%s]   output_tokens : %d", label, response.usage.output_tokens)
        log.info("[%s]   content blocks: %d", label, len(response.content))
        for i, block in enumerate(response.content):
            if block.type == "text":
                log.info("[%s]   block[%d] text → %s", label, i, block.text[:200])
            elif block.type == "tool_use":
                log.info("[%s]   block[%d] tool_use → %s(%s)", label, i, block.name, block.input)

        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason == "end_turn":
            log.info("[%s] ✓ done after %d turn(s)", label, turn)
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
            return ""

        if response.stop_reason == "tool_use":
            tool_results: list[anthropic.types.ToolResultBlockParam] = []
            for block in response.content:
                if block.type == "tool_use" and block.name == "web_search":
                    query = block.input.get("query", "")
                    log.info("[%s]   → web_search: %s", label, query)
                    result = _execute_web_search(query)
                    log.info("[%s]   ← result: %d chars", label, len(result))
                    tool_results.append(
                        {
                            "type": "tool_result",
                            "tool_use_id": block.id,
                            "content": result,
                        }
                    )
            messages.append({"role": "user", "content": tool_results})
        else:
            log.warning("[%s] unexpected stop_reason=%s", label, response.stop_reason)
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
            return ""

    # Reached MAX_TURNS — ask Claude to wrap up with what it has
    log.warning("[%s] hit MAX_TURNS=%d, forcing final answer", label, MAX_TURNS)
    messages.append({
        "role": "user",
        "content": "You have reached the search limit. Based on everything gathered so far, respond now with ONLY the final JSON output as instructed. No more searches.",
    })
    response = client.messages.create(
        model=MODEL,
        max_tokens=4096,
        system=system_prompt,
        messages=messages,
    )
    log.info("[%s] ── FORCED FINAL RESPONSE ────────────────────────", label)
    log.info("[%s]   stop_reason   : %s", label, response.stop_reason)
    log.info("[%s]   output_tokens : %d", label, response.usage.output_tokens)
    for block in response.content:
        if hasattr(block, "text"):
            log.info("[%s]   text → %s", label, block.text[:300])
            return block.text
    return ""


# ---------------------------------------------------------------------------
# JSON extraction helper
# ---------------------------------------------------------------------------

def _extract_json(text: str) -> dict | list:
    """
    Extract the first valid JSON object or array from Claude's text response.
    Handles both bare JSON and JSON wrapped in markdown code blocks.
    """
    # Try markdown code block first
    match = re.search(r"```(?:json)?\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```", text)
    if match:
        return json.loads(match.group(1))

    # Try finding the outermost { } or [ ]
    for pattern in (r"(\{[\s\S]*\})", r"(\[[\s\S]*\])"):
        match = re.search(pattern, text)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                continue

    raise ValueError(f"No valid JSON found in response. Response preview: {text[:300]}")


# ---------------------------------------------------------------------------
# Skill helpers
# ---------------------------------------------------------------------------

def _load_skill(skill_name: str) -> str:
    """Load a skill's SKILL.md, stripping YAML frontmatter."""
    path = SKILLS_DIR / skill_name / "SKILL.md"
    log.info("[skill] ── LOADING SKILL ──────────────────────────────")
    log.info("[skill]   name: %s", skill_name)
    log.info("[skill]   path: %s", path)
    raw = path.read_text(encoding="utf-8")

    # Strip --- frontmatter ---
    if raw.startswith("---"):
        end = raw.index("---", 3)
        content = raw[end + 3:].strip()
    else:
        content = raw.strip()

    log.info("[skill] ✓ loaded %d chars", len(content))
    return content


# ---------------------------------------------------------------------------
# Step 1: Trending cricketers
# ---------------------------------------------------------------------------

def get_trending_cricketers() -> list[str]:
    """
    Use the trending-cricketers-finder skill to return 20 trending cricketer names.
    """
    log.info("=== STEP 1: finding trending cricketers ===")
    system_prompt = _load_skill("trending-cricketers-finder")
    today = date.today().strftime("%B %d, %Y")

    user_message = (
        f"Today's date is {today}.\n\n"
        "Use the web_search tool to find 20 currently trending cricketers following "
        "the skill instructions above. After your research, respond with ONLY a JSON "
        "object in this exact format (no other text):\n\n"
        '{"cricketers": ["Name 1", "Name 2", ..., "Name 20"]}'
    )

    response_text = run_with_tools(system_prompt, user_message, label="trending")
    log.debug("[trending] raw response: %s", response_text[:500])

    data = _extract_json(response_text)

    if isinstance(data, dict) and "cricketers" in data:
        names = data["cricketers"]
    elif isinstance(data, list):
        names = data
    else:
        raise ValueError(f"Unexpected JSON shape for cricketers: {data}")

    if len(names) < 1:
        raise ValueError("Received empty cricketers list from trending skill.")

    log.info("[trending] found %d cricketers: %s", len(names), names)
    return names


# ---------------------------------------------------------------------------
# Step 2: Trivia hints for one cricketer
# ---------------------------------------------------------------------------

_HINT_TYPE_MAP = {
    "easy": "easy",
    "medium-easy": "medium",
    "medium_easy": "medium",
    "medium": "medium",
    "medium-hard": "hard",
    "medium_hard": "hard",
    "hard": "hard",
}


def _normalise_hint_type(raw: str) -> str:
    return _HINT_TYPE_MAP.get(raw.lower().replace(" ", "-"), "medium")


def get_cricketer_hints(name: str) -> list[dict]:
    """
    Use the cricketer-trivia-finder skill to return 4 ordered hints for *name*.
    Returns a list of dicts: [{"hint_type": "easy|medium|hard", "hint_statement": "..."}]
    """
    log.info("=== STEP 3: fetching hints for '%s' ===", name)
    system_prompt = _load_skill("cricketer-trivia-finder")

    user_message = (
        f"The cricketer is: {name}\n\n"
        "Use the web_search tool to research this cricketer following the skill "
        "instructions above. Then respond with ONLY a JSON object in this exact "
        "format (no other text):\n\n"
        "{\n"
        '  "hints": [\n'
        '    {"hint_type": "easy",   "hint_statement": "..."},\n'
        '    {"hint_type": "medium", "hint_statement": "..."},\n'
        '    {"hint_type": "medium", "hint_statement": "..."},\n'
        '    {"hint_type": "hard",   "hint_statement": "..."}\n'
        "  ]\n"
        "}\n\n"
        "Rules: order hints from easiest to hardest. "
        "hint_type must be one of: easy, medium, hard. "
        "Do NOT include the cricketer's name in any hint."
    )

    response_text = run_with_tools(system_prompt, user_message, label="trivia")
    log.debug("[trivia] raw response: %s", response_text[:500])

    data = _extract_json(response_text)

    if isinstance(data, dict) and "hints" in data:
        raw_hints = data["hints"]
    elif isinstance(data, list):
        raw_hints = data
    else:
        raise ValueError(f"Unexpected JSON shape for hints: {data}")

    hints = []
    for h in raw_hints[:4]:
        hint = {
            "hint_type": _normalise_hint_type(h.get("hint_type", "medium")),
            "hint_statement": h.get("hint_statement", ""),
        }
        log.debug("[trivia] hint → type=%s  statement=%s", hint["hint_type"], hint["hint_statement"][:80])
        hints.append(hint)

    log.info("[trivia] parsed %d hints for '%s'", len(hints), name)
    return hints


# ---------------------------------------------------------------------------
# Combined entry point (used by main.py)
# ---------------------------------------------------------------------------

def generate_trivia() -> dict:
    """
    Full pipeline: trending → random pick → hints → structured response.
    """
    cricketers = get_trending_cricketers()

    chosen = random.choice(cricketers)
    log.info("=== STEP 2: randomly selected '%s' ===", chosen)

    hints = get_cricketer_hints(chosen)

    log.info("=== STEP 4: building final response ===")
    return {
        "cricketer-name": chosen,
        "hints": [
            {
                "hint-type": h["hint_type"],
                "hint-statementt": h["hint_statement"],  # preserved as specified
            }
            for h in hints
        ],
    }
