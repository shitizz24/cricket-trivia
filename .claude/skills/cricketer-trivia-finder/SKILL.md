---
name: cricketer-trivia-finder
description: This skill should be used when asked to find trivia hints, facts, or clues about a cricketer for a guessing game. Activate when the input is a cricketer's name and the goal is to generate ordered hints from easy to tough for a trivia game.
version: 1.0.0
---

# Cricketer Trivia Finder

This skill finds 4 unique, web-sourced trivia hints about a cricketer, ordered from easiest to hardest to guess from. The hints are designed for a trivia game where players are revealed hints one by one and must guess the cricketer.

## When This Skill Applies

Activate when:
- A cricketer's name is provided as input
- The task is to generate trivia hints or clues about that cricketer
- The output will be used in a trivia guessing game

## Instructions

Given a cricketer's name, follow these steps:

### Step 1: Research
Search the web using multiple sources to gather facts about the cricketer:
- Wikipedia (career overview, personal life, records)
- ESPNcricinfo (detailed stats, career milestones)
- Reddit r/Cricket (discussions, lesser-known trivia)
- Cricket blogs and news sites (interesting anecdotes, rare facts)

Search queries to use:
- `"[cricketer name]" cricket career facts`
- `"[cricketer name]" cricket trivia`
- `"[cricketer name]" cricket unusual record OR interesting OR rare`
- `site:reddit.com/r/cricket "[cricketer name]"`
- `site:espncricinfo.com "[cricketer name]"`

### Step 2: Curate 4 Hints

Select exactly 4 facts and order them by difficulty — how hard it would be to identify the cricketer from that hint alone:

**Hint 1 — Easy**
A broad, well-known fact that strongly identifies the player. Examples:
- Nationality + role + era ("This right-handed batsman from India dominated Test cricket in the 2000s")
- Iconic record most people associate with them
- Something a casual cricket fan would know

**Hint 2 — Medium-Easy**
A notable achievement or record that dedicated fans would know. Examples:
- A famous innings or series performance
- A prominent team captaincy or award
- A career milestone (e.g., "first to do X in their country")

**Hint 3 — Medium-Hard**
A less commonly known stat, career detail, or fact. Examples:
- A lesser-known record they hold
- An unusual career stat or quirk
- A fact about their playing style or technique

**Hint 4 — Hard**
An obscure fact that makes the player difficult to identify. Examples:
- Early career detail (debut circumstances, childhood team)
- A personal/off-field fact (education, unusual hobby, nickname origin)
- A very specific/unusual stat that only hardcore fans would know
- Something that happened outside their peak fame period

### Step 3: Output Format

Return the 4 hints in this exact format:

```
**Cricketer:** [Name]

**Hint 1 (Easy):** [fact]

**Hint 2 (Medium-Easy):** [fact]

**Hint 3 (Medium-Hard):** [fact]

**Hint 4 (Hard):** [fact]
```

## Quality Rules

- All facts must be accurate and verifiable — do not hallucinate stats or records
- Each hint must be distinct — no overlapping information
- Hints should not contain the cricketer's name or make it trivially obvious
- Facts should come from real web sources, not just training data
- Prefer specific, concrete facts over vague generalities
- The difficulty gradient must be genuine — Hint 1 should strongly identify them, Hint 4 should make it hard to guess
- Each hint must be a single, crisp sentence — no run-ons or multi-part sentences
- Do NOT combine multiple identifying details in one hint (e.g., avoid naming both the opponent team AND the tournament together — pick one or neither)
- Avoid details that, when combined, make the player trivially obvious (e.g., "scored 149 in the 2007 World Cup final against Sri Lanka" is too pinpointing — use just the score or just the tournament)
