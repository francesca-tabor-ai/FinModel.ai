<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# FinModel.ai

**Financial intelligence, powered by AI.** FinModel.ai turns your numbers into clear insights and actionable decisions—so you can focus on building, not spreadsheets.

## Product description

FinModel.ai is an AI-driven financial intelligence platform built for founders, finance teams, and operators who want real-time visibility into cash, burn, and runway—without drowning in manual modeling.

- **Live financial dashboard** — Cash on hand, monthly burn, runway, and MRR at a glance, with trends and trajectory charts.
- **Pro-forma financial model** — Income statement, unit economics (LTV, CAC, payback), and burn analysis in one place.
- **Outcome prediction** — Simulate the impact of hiring, pricing changes, or funding before you commit. See runway, revenue, and profitability under different scenarios.
- **AI agents** — Autonomous analysts (Financial analyst, CFO agent, Forecasting agent) that surface insights and recommendations from your data.
- **Decision log** — A clear record of simulations and recommendations so you can track what was considered and why.

Built on **Google AI Studio** and **Gemini**, FinModel.ai brings CFO-level analysis and scenario planning to your browser—so you can run the business with confidence.

---

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/1321f7cf-886f-4329-b855-6a8eade8c9c5

## Run locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Copy [.env.example](.env.example) to `.env` or `.env.local` and set `GEMINI_API_KEY` (get a key at [Google AI Studio](https://ai.google.dev/)).
3. Run the app: `npm run dev`

## Production

1. Build the frontend: `npm run build`
2. Set `GEMINI_API_KEY` (and optionally `PORT`, `NODE_ENV=production`) in your environment.
3. Start the server: `npm run start`

The server serves the built app from `dist/` and runs the API (including Gemini) server-side so your API key is never exposed to the browser.
