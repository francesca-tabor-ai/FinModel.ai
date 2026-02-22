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
| **Quick actions** | "Export report" and "New decision" in header. |

---

## AI Financial Modeling (Phase 4)
- [x] Automated financial model generation
- [x] Income statement, balance sheet, cash flow statements
- [x] Revenue and cost model builders
- [x] Model explainability and driver analysis
- [x] Historical model versions and comparisons

| Item | In codebase today |
|------|--------------------|
| **Automated model generation** | Seed data + Gemini-powered insights and simulations; no full model generator UI. |
| **Statements** | Pro-forma income statement (revenue, expenses, net income, cash); cash flow trajectory chart. No balance sheet or formal cash flow statement. |
| **Revenue/cost builders** | Unit economics (LTV, CAC, payback) and burn analysis displayed; no interactive model builder. |
| **Explainability / drivers** | AI insights and recommendations from Gemini; no structured driver breakdown or explainability view. |
| **Versions / comparisons** | Decision log and simulation results; no versioned models or side-by-side comparison. |

---

## Financial Predictions (Phase 4)
- [x] Revenue forecast with confidence intervals
- [x] Expense forecast with trend analysis
- [x] Runway prediction and risk alerts
- [x] Profitability date estimation
- [x] Monte Carlo simulation visualization

| Item | In codebase today |
|------|--------------------|
| **Revenue forecast** | Simulation returns revenue impact (text); no dedicated forecast series or confidence intervals. |
| **Expense forecast** | Burn and expenses in dashboard/model; no separate expense forecast or trend analysis. |
| **Runway / risk** | Runway on dashboard; simulation shows runway impact. No explicit risk alerts. |
| **Profitability date** | Simulation returns profitability (text from Gemini). No standalone estimator UI. |
| **Monte Carlo viz** | Probabilistic scenarios (Best/Worst/Expected) as bar chart; not full Monte Carlo distribution. |

---

## AI Insights & Recommendations (Phase 4)
- [x] Performance insights (burn rate, runway, profitability)
- [x] Risk insights (bankruptcy risk, runway risk, cost overruns)
- [x] Opportunity insights (pricing, cost reduction, growth)
- [x] Actionable recommendations with impact scoring
- [x] Insight history and tracking

| Item | In codebase today |
|------|--------------------|
| **Performance insights** | AI insights panel (burn, runway, revenue growth) and recommendations from Gemini; no structured performance vs risk vs opportunity buckets. |
| **Risk insights** | Not categorized; insights/recommendations may mention risk but no dedicated bankruptcy/runway/cost-overrun views. |
| **Opportunity insights** | Recommendations can cover pricing/cost/growth; no separate opportunity section or tagging. |
| **Recommendations + impact** | Strategic recommendations (title + description); simulation logs store impact_score (e.g. runway months). No generic impact scoring on recommendations. |
| **Insight history** | Decision log shows past simulations and impact; no dedicated insight/recommendation history or tracking. |

---

## Decision Intelligence Simulator (Phase 5)
- [x] Scenario builder for hiring, pricing, funding decisions
- [x] Outcome prediction display
- [x] Sensitivity analysis
- [x] Decision comparison tools
- [x] Decision history and learning

| Item | In codebase today |
|------|--------------------|
| **Scenario builder** | Free-text input for any scenario (placeholder mentions hiring, pricing, funding); no structured templates or step-by-step builder. |
| **Outcome prediction** | Summary, runway/revenue/profitability impacts, and probabilistic scenarios (Best/Worst/Expected) bar chart from Gemini. |
| **Sensitivity analysis** | Not implemented; no “vary one input, see output” or tornado charts. |
| **Decision comparison** | Single result per run; no side-by-side comparison of multiple scenarios. |
| **Decision history / learning** | Decision log lists past simulations with impact score; no learning loop or recommendations from history. |

---

## AI Agents Management (Phase 5)
- [x] Financial Analyst Agent display
- [x] CFO Agent interface
- [x] Forecasting Agent monitoring
- [x] Optimization Agent controls
- [x] Autonomous Execution Agent (premium)
- [x] Agent activity logs and recommendations

| Item | In codebase today |
|------|--------------------|
| **Financial Analyst Agent** | Card on AI agents tab (display only); description “Analyzing burn rate and unit economics.” No live execution or controls. |
| **CFO Agent** | Card on AI agents tab (display only); “Optimizing runway and hiring plans.” No interface or controls. |
| **Forecasting Agent** | Card on AI agents tab (Idle); “Predicting future financial outcomes.” Simulations log under this agent name; no dedicated monitoring UI. |
| **Optimization Agent** | Not present; only Financial analyst, CFO, Forecasting agents shown. No optimization agent or controls. |
| **Autonomous Execution Agent** | Not present; no premium or autonomous-execution agent. |
| **Activity logs / recommendations** | "Recent agent activity" list from `agent_logs` (agent_name, action, recommendation, timestamp). Decision simulations appear in log and in Decision log tab. |

---

## Integrations (Phase 5)
- [x] QuickBooks integration setup
- [x] Xero integration setup
- [x] Stripe/PayPal payment integration
- [x] HubSpot CRM integration
- [x] Gusto/Deel HR integration
- [x] Plaid banking integration
- [x] Integration status dashboard
- [x] Data sync controls and scheduling

| Item | In codebase today |
|------|--------------------|
| **QuickBooks** | Not implemented; no accounting integrations. |
| **Xero** | Not implemented; no accounting integrations. |
| **Stripe/PayPal** | Not implemented; no payment provider integrations. |
| **HubSpot CRM** | Not implemented; no CRM integrations. |
| **Gusto/Deel HR** | Not implemented; no HR/payroll integrations. |
| **Plaid** | Not implemented; no banking/transaction integrations. |
| **Integration status dashboard** | Not implemented; no integrations to show status for. |
| **Data sync / scheduling** | Not implemented; financial data is seed/local DB only; no sync or scheduling. |

---

## Financial Model Builder (Phase 6)
- [x] Editable assumptions interface
- [x] Revenue drivers configuration
- [x] Expense categories management
- [x] Model sensitivity controls
- [x] What-if analysis tools
- [x] Model export and sharing

| Item | In codebase today |
|------|--------------------|
| **Editable assumptions** | Financial model tab shows read-only pro-forma table and unit economics; no edit UI for assumptions or inputs. |
| **Revenue drivers** | Revenue in table/charts; no configuration of drivers or revenue model. |
| **Expense categories** | Single expenses total per month; `financial_data` has optional `category` column but no category management UI. |
| **Model sensitivity controls** | Not implemented; no sliders or inputs to vary assumptions and see impact. |
| **What-if analysis** | Simulation tab allows free-text what-if (one scenario at a time); no structured what-if builder or comparison. |
| **Model export / sharing** | "Export report" button in header; no export or sharing implementation. |

---

## Settings & Configuration (Phase 6)
- [x] Autonomous mode toggle and safeguards
- [x] Notification preferences
- [x] Data sync frequency and controls
- [x] API key management
- [x] User preferences
- [x] Account settings

| Item | In codebase today |
|------|--------------------|
| **Autonomous mode / safeguards** | Not implemented; no toggle or safeguards for autonomous agent execution. |
| **Notification preferences** | Not implemented; no notification or alert preferences. |
| **Data sync frequency / controls** | Not implemented; no integrations or sync; no frequency or control UI. |
| **API key management** | GEMINI_API_KEY is server env only; no in-app API key entry or management. |
| **User preferences** | Not implemented; no auth or user-specific preferences. |
| **Account settings** | Not implemented; Settings sidebar item has no target (onClick empty); no account or settings page. |
