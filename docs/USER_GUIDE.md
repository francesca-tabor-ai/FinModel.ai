# FinModel.ai – User guide

## Getting started

1. **Install and run**  
   See the main [README](../README.md): `npm install`, set `GEMINI_API_KEY` in `.env`, then `npm run dev`.  
   Open the URL shown (e.g. `http://localhost:3000`).

2. **First load**  
   The app loads your financial data and, if the API key is set, fetches AI insights. You’ll land on the **Dashboard**.

---

## Dashboard

- **Metric cards**  
  Cash on Hand, Monthly Burn, Runway (months), and Revenue (MRR), with simple trend indicators.

- **Cash flow trajectory**  
  Chart of revenue vs expenses over time.

- **AI financial insights**  
  Short insights and **Strategic recommendations** (title + description) generated from your data.  
  If you see a message about setting `GEMINI_API_KEY`, configure it on the server and refresh.

- **Quick actions**  
  - **Export report** – placeholder (not yet implemented).  
  - **New decision** – use the **Simulations** tab to run a scenario.

---

## Financial model

Open **Financial model** from the sidebar.

- **Income statement (Pro-forma)**  
  Table of Total revenue, Total expenses, Net income (burn), and Cash on hand by month.  
  Toggle between Monthly view (and placeholder Quarterly).

- **Unit economics**  
  LTV, CAC, LTV/CAC ratio, Payback period with status (e.g. Healthy / Warning).

- **Burn analysis**  
  Bar chart of net burn by month.

---

## Simulations (outcome prediction)

Open **Simulations** from the sidebar.

- **Outcome prediction**  
  Describe a decision in the text box (e.g. “What if we hire 3 senior engineers and increase marketing spend by 20%?”).  
  Click **Run simulation**.

- **Results**  
  - A short **summary** and **impacts** (runway, revenue, profitability).  
  - **Probabilistic scenarios** (e.g. Best case, Worst case, Expected) as a bar chart.  
  - The run is logged in **Decision log** and in **AI agents** → Recent agent activity.

- **Requirements**  
  `GEMINI_API_KEY` must be set on the server; otherwise you’ll see an error message.

---

## AI agents

Open **AI agents** from the sidebar.

- **Agent cards**  
  Financial analyst, CFO agent, and Forecasting agent are shown with status (Active/Idle) and short descriptions.  
  These are informational; no live execution or controls yet.

- **Recent agent activity**  
  List of recent actions: agent name, action, recommendation snippet, and timestamp.  
  Decision simulations appear here as “Forecasting Agent” / “Decision Simulation”.

---

## Decision log

Open **Decision log** from the sidebar.

- **Decision intelligence log**  
  Past decision simulations: date, impact (e.g. +X or -X months), and the scenario text.  
  If none have been run, you’ll see “No decisions logged yet. Run a simulation to start tracking.”

---

## Settings

The **Settings** item in the sidebar is a placeholder; there is no settings page yet.  
Configuration is via environment variables (e.g. `GEMINI_API_KEY`, `PORT`) and `.env`.

---

## Troubleshooting

- **“Unable to load AI insights” / simulation errors**  
  Set `GEMINI_API_KEY` in `.env` or your server environment and restart the server.

- **Empty or missing data**  
  On first run, the app seeds sample financial data. For custom data you’d need to add it to the database or integrate a data source.

- **Port in use**  
  Set `PORT` in `.env` (e.g. `PORT=3001`) and run `npm run dev` or `npm run start` again.
