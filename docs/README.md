# FinModel.ai – Project documentation

## Overview

FinModel.ai is a financial intelligence web app: React frontend, Express API, SQLite database, and server-side Gemini for insights and simulations. The API key is never sent to the browser.

## Project structure

```
FinModel.ai/
├── server.ts           # Express server, DB init, REST API
├── server/
│   └── gemini.ts       # Gemini API (insights, simulate) – server only
├── src/
│   ├── App.tsx         # Main UI (dashboard, model, simulations, agents, log)
│   ├── main.tsx        # React entry
│   ├── index.css       # Tailwind theme and components
│   ├── lib/utils.ts    # cn() helper
│   └── services/
│       └── geminiService.ts  # Client: calls /api/insights, /api/simulate
├── index.html
├── vite.config.ts
├── tsconfig.json
├── .env.example
├── CHANGELOG.md
├── docs/
│   ├── README.md       # This file
│   ├── RELEASE.md      # Checkpoint/release process
│   ├── USER_GUIDE.md   # User guide
│   └── API.md          # API reference
└── TODO.md             # Phase roadmap and implementation reference
```

## Environment variables

| Variable | Required | Description |
|--------|----------|-------------|
| `GEMINI_API_KEY` | Yes (for AI) | Google AI / Gemini API key. Get one at [Google AI Studio](https://ai.google.dev/). |
| `PORT` | No | Server port (default `3000`). |
| `NODE_ENV` | No | `production` for serving `dist/`; else Vite dev. |
| `DATABASE_PATH` | No | SQLite file path (default `finmodel.db`). |

Load from `.env` or `.env.local` (via `dotenv` in `server.ts`). Never commit `.env` (see `.gitignore`).

## Development

- **Install:** `npm install`
- **Run dev server:** `npm run dev` (Vite + Express; hot reload).
- **Lint:** `npm run lint` (TypeScript).
- **Build:** `npm run build` (output in `dist/`).
- **Run production:** `npm run start` (serves `dist/` when `NODE_ENV=production`).

## Database

SQLite with three tables:

- **financial_data** – monthly revenue, expenses, cash_on_hand (and optional category).
- **decisions** – decision_text, context, expected_outcome, status.
- **agent_logs** – agent_name, action, recommendation, impact_score, timestamp.

Seed data is inserted when `financial_data` is empty. DB file: `finmodel.db` (or `DATABASE_PATH`).

## Security

- `GEMINI_API_KEY` is read only in Node (`server/gemini.ts`); never in Vite or client bundle.
- POST bodies are validated (required fields, types); errors return 400/500 with JSON.
- No auth layer yet; suitable for single-tenant or internal use.

## See also

- [User guide](USER_GUIDE.md) – how to use the app.
- [API reference](API.md) – endpoints and payloads.
- [Release process](RELEASE.md) – checkpoints and tagging.
