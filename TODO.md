# FinModel.ai – Project TODO

## Core Infrastructure
- [x] Database schema with financial data, models, decisions, agents, and integrations
- [x] Backend procedures for all features (tRPC routers)
- [x] Authentication and user management
- [x] Real-time data synchronization layer

---

### Current implementation (reference)

| Item | In codebase today |
|------|--------------------|
| **Database** | SQLite: `financial_data`, `decisions`, `agent_logs`. No separate tables yet for models, agents, or integrations. |
| **Backend** | Express REST API (`/api/financials`, `/api/decisions`, `/api/agent-logs`, `/api/insights`, `/api/simulate`). tRPC not added. |
| **Auth** | None. No login, sessions, or user management. |
| **Real-time** | None. No WebSockets or live sync; clients poll/refetch. |

To align the app with the checklist above, next steps could be: extend schema (models/agents/integrations tables), introduce tRPC (or keep REST), add auth (e.g. sessions or OAuth), and add a real-time layer (e.g. WebSockets or SSE).

---

## Dashboard & Metrics (Phase 3)
- [x] Financial overview widget (runway, burn rate, MRR, cash position)
- [x] Key metrics cards with trend indicators
- [x] Real-time charts and visualizations
- [x] Financial health score indicator
- [x] Quick action buttons

| Item | In codebase today |
|------|--------------------|
| **Financial overview** | Dashboard shows Cash on Hand, Monthly Burn, Runway, Revenue (MRR) via `StatCard`s. |
| **Trend indicators** | Cards show up/down trend badges (e.g. 12%, 4%, 2.1m, 18%). |
| **Charts** | Cash flow trajectory (AreaChart), burn bar chart; simulation scenario bars. |
| **Health score** | No dedicated health score widget; runway and metrics serve as proxies. |
| **Quick actions** | “Export report” and “New decision” in header. |
