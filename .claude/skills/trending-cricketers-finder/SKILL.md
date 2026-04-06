---
name: trending-cricketers-finder
description: This skill should be used when asked to find currently trending cricketers. Activate when the goal is to discover which cricketers are in the news or trending right now based on recent innings, birthdays, or personal records broken.
version: 1.0.0
---

# Trending Cricketers Finder

This skill searches the web for the 20 most trending cricketers right now, based on three signals: recent impactful innings, birthdays today/this week, and personal records recently broken.

## When This Skill Applies

Activate when:
- The user asks for trending, popular, or newsworthy cricketers
- The user wants to know who is in the cricket news right now
- The goal is to surface 20 relevant cricketers for a trivia game or similar use case

## Instructions

### Step 1: Determine Today's Date

Use the current date from the conversation context (provided as `currentDate`). This is critical for birthday lookups and recency filtering.

### Step 2: Search the Web Across Three Signals

Run searches for each of the three trending signals:

**Signal A — Recent Impactful Innings**
Search for cricketers who have played notable innings in the last 7–14 days:
- `cricket best innings this week [current month] [current year]`
- `cricket standout performance [current month] [current year]`
- `site:espncricinfo.com cricket highlights [current month] [current year]`
- `site:cricbuzz.com top performances [current month] [current year]`

Look for: centuries, five-wicket hauls, match-winning contributions, exceptional economy rates or strike rates.

Also look for: cricketers who made their **international debut** in the last 7–14 days.

**Signal B — Birthdays**
Search for cricketers whose birthdays fall within ±3 days of today:
- `cricketer birthday [today's date, e.g. "April 4"]`
- `famous cricketers born on [today's date]`
- `cricket birthday today [current year]`

Look for: active or recently retired cricketers with significant fan followings.

**Signal C — Personal Records Broken**
Search for cricketers who have recently set or broken a personal record:
- `cricketer breaks personal record [current month] [current year]`
- `cricket new record set [current month] [current year]`
- `cricketer career best [current month] [current year]`
- `site:espncricinfo.com record [current month] [current year]`

Look for: career-best scores, fastest milestones, most wickets/runs in a format, firsts in a format.

### Step 3: Compile the List

From the three signals, select **exactly 20 cricketers**.

**Eligibility Filter — apply before selecting any cricketer:**
A cricketer may only be included if they meet at least one of:
- Have played **5 or more international innings** across any format (Test, ODI, T20I), OR
- Made their **international debut** within the last 14 days, OR
- Have **broken or set an international record** (not a domestic or franchise record) within the last 14 days.

Do not include a cricketer who fails all three criteria, even if they had a standout domestic or IPL innings.

Balance the list:
- At least 6 from Signal A (recent innings)
- At least 4 from Signal B (birthdays)
- At least 4 from Signal C (records broken)
- Remaining slots filled by the strongest remaining candidates across any signal

Rules:
- Prioritize active cricketers over retired ones
- Each cricketer may only appear once even if they qualify under multiple signals
- Include cricketers from different countries — avoid over-representing one nation
- Do not include a cricketer unless there is a concrete, verifiable reason tied to one of the three signals

### Step 4: Output Format

Return the list in this exact format:

```
**Trending Cricketers — [Today's Date]**

**Recent Impactful Innings**
1. [Name] ([Country]) — [One sentence: what they did, when, in which match/series]
2. ...

**Birthdays This Week**
1. [Name] ([Country]) — Born [date]; [one sentence: why they are notable]
2. ...

**Personal Records Broken**
1. [Name] ([Country]) — [One sentence: what record, when it was set]
2. ...
```

Entries within each section are ordered by recency (most recent first) or, for birthdays, by closeness to today.

## Quality Rules

- All facts must be accurate and verifiable — do not hallucinate matches, scores, or dates
- Each entry must have a concrete reason tied to the signal — no vague "in good form" entries
- Do not repeat a cricketer across sections
- Prefer specificity: name the match, the score, the date, or the record where possible
- Do not include a cricketer solely based on training data — the reason must come from a real, recent web source
- Keep each entry to a single, crisp sentence
- Do not include a cricketer who has fewer than 5 international innings **unless** they debuted internationally or broke an international record in the last 14 days
