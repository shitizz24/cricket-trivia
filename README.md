# Cricket Trivia

A daily cricket trivia guessing game. Reveal hints one at a time and guess the cricketer — the fewer hints you need, the more stars you keep.

## How it works

1. A trending cricketer is selected using Claude (via web search) or pulled from a pre-populated MongoDB pool.
2. Four hints are generated for that cricketer, ordered from easy to hard.
3. The Next.js frontend presents the hints progressively. Players guess from a multiple-choice grid.
4. Stars (starting at 10) are deducted for each hint revealed and each wrong guess. Up to 4 wrong guesses before the game ends.

## Architecture

```
cricket-trivia/
├── api/                  # Python backend (FastAPI)
│   ├── main.py           # API routes: /trivia, /get-puzzle, /health
│   ├── agent.py          # Claude-powered agent: trending cricketers + hint generation
│   └── database.py       # MongoDB connection (Motor async driver)
├── frontend/             # Next.js app (React 19, Tailwind CSS v4)
│   └── src/
│       ├── app/
│       │   ├── page.tsx              # Main game UI
│       │   └── api/trivia/route.ts   # Proxies requests to the Python backend
│       ├── components/               # HintGrid, ChoiceGrid, ResultScreen, etc.
│       ├── hooks/useGame.ts          # All game logic (reveal, guess, scoring)
│       └── lib/                      # Types and cricketer distractor list
└── .claude/skills/       # Claude Code skills for trivia and trending finder
```

## API endpoints

| Endpoint | Description |
|---|---|
| `GET /trivia` | Picks a trending cricketer via web search and returns 4 hints |
| `GET /get-puzzle?date=YYYY-MM-DD` | Returns the puzzle assigned to a given date (idempotent) |
| `GET /health` | Health check |

## Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB (local or Atlas)
- Anthropic API key

### Backend

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill in your values:

```env
ANTHROPIC_API_KEY=your-anthropic-api-key
CLAUDE_MODEL=claude-sonnet-4-6
MONGODB_URL=mongodb://localhost:27017
MONGODB_DATABASE=cricket_trivia
```

Start the API:

```bash
uvicorn api.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend proxies `/api/trivia` to the backend at `http://localhost:8000` by default. Override with a `BACKEND_URL` environment variable.

Open [http://localhost:3000](http://localhost:3000) to play.
