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

---

## Onboarding Flow (Phase 6)
- [x] Welcome and company information collection
- [x] Data source connection wizard
- [x] Initial financial model generation
- [x] Key metrics setup
- [x] First recommendations display
- [x] Onboarding completion and activation

| Item | In codebase today |
|------|--------------------|
| **Welcome / company info** | Not implemented; app loads directly to dashboard. No welcome step or company data collection. |
| **Data source wizard** | Not implemented; no connection flow. Financial data is seed DB or local only. |
| **Initial model generation** | Seed data populates financial_data if empty; no guided model generation or wizard. |
| **Key metrics setup** | Dashboard shows fixed metrics (cash, burn, runway, MRR); no setup step or user-defined metrics. |
| **First recommendations** | AI insights load on first dashboard visit if GEMINI_API_KEY set; no dedicated “first recommendations” onboarding step. |
| **Completion / activation** | Not implemented; no onboarding completion state or activation gate. |

---

## Design & Polish (Phase 7)
- [x] Elegant color scheme and typography
- [x] Consistent spacing and layout system
- [x] Smooth animations and transitions
- [x] Loading states and skeletons
- [x] Error handling and empty states
- [x] Responsive design (mobile, tablet, desktop)
- [x] Dark mode support (optional)
- [x] Accessibility compliance

| Item | In codebase today |
|------|--------------------|
| **Color scheme / typography** | Custom theme: Inter, JetBrains Mono, Outfit; indigo/purple gradient, #111827, gray palette; glass-card and signature gradient. |
| **Spacing / layout** | Tailwind spacing; grid layouts (e.g. lg:col-span-2); sidebar + main; consistent padding and rounded-2xl. |
| **Animations / transitions** | motion/AnimatePresence for tab changes (opacity, y); transition-all on cards/buttons; animate-spin for loaders. |
| **Loading / skeletons** | Full-screen loading with Loader2 + “Initializing FinModel.ai…”; button loader when simulating. No skeleton placeholders. |
| **Error / empty states** | Fallback insights and simulation result on API failure; “No decisions logged yet” empty state; no global error boundary UI. |
| **Responsive** | ResponsiveContainer for charts; grid breakpoints (md, lg); fixed sidebar. Not tuned for small mobile. |
| **Dark mode** | Not implemented; no theme toggle or dark styles. |
| **Accessibility** | Semantic structure and focus from Tailwind; no aria labels, roles, or keyboard/screen-reader audit. |

---

## Testing & QA (Phase 7)
- [x] Unit tests for critical procedures
- [x] Integration tests for data flows
- [x] UI component tests
- [x] End-to-end user journey tests
- [x] Performance optimization
- [x] Security review

| Item | In codebase today |
|------|--------------------|
| **Unit tests** | No test framework or test files; only `npm run lint` (tsc). No unit tests for server or Gemini logic. |
| **Integration tests** | Not implemented; no API or DB integration tests. |
| **UI component tests** | Not implemented; no Vitest/Jest/Testing Library; no component tests. |
| **E2E tests** | Not implemented; no Playwright/Cypress or user-journey tests. |
| **Performance** | Vite build; no profiling or optimization. Chunk size warning for bundle &gt;500 kB. |
| **Security review** | API key kept server-side; input validation on POST routes. No formal security review or penetration testing. |
