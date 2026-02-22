/**
 * Seed database with demo data (financial data, agents, users, decisions, etc).
 * Used by server.ts at startup and by scripts/seed-tables.ts for standalone seeding.
 */
import * as auth from "./auth";
import type { DbAdapter } from "./db";

export async function seed(db: DbAdapter) {
  // Financial data: 12 months, deterministic for reproducible seed
  const financialCount = (await db.get<{ count: string }>("SELECT COUNT(*) as count FROM financial_data"))!;
  if (Number(financialCount.count) === 0) {
    const months = [
      { month: "2025-03", revenue: 9800, expenses: 40500, category: "operating" },
      { month: "2025-04", revenue: 11200, expenses: 41200, category: "operating" },
      { month: "2025-05", revenue: 12500, expenses: 42000, category: "operating" },
      { month: "2025-06", revenue: 14800, expenses: 42800, category: "operating" },
      { month: "2025-07", revenue: 16200, expenses: 43200, category: "operating" },
      { month: "2025-08", revenue: 18200, expenses: 43500, category: "operating" },
      { month: "2025-09", revenue: 21500, expenses: 44800, category: "operating" },
      { month: "2025-10", revenue: 24800, expenses: 45500, category: "operating" },
      { month: "2025-11", revenue: 26800, expenses: 46200, category: "operating" },
      { month: "2025-12", revenue: 30200, expenses: 44100, category: "operating" },
      { month: "2026-01", revenue: 31800, expenses: 45500, category: "operating" },
      { month: "2026-02", revenue: 33500, expenses: 46800, category: "operating" },
    ];
    let cash = 500000;
    for (const row of months) {
      cash = cash + row.revenue - row.expenses;
      await db.run(
        "INSERT INTO financial_data (month, revenue, expenses, cash_on_hand, category) VALUES ($1, $2, $3, $4, $5)",
        [row.month, row.revenue, row.expenses, cash, row.category]
      );
    }
  }

  // Agents
  const agentCount = (await db.get<{ count: string }>("SELECT COUNT(*) as count FROM agents"))!;
  if (Number(agentCount.count) === 0) {
    await db.run("INSERT INTO agents (name, type, status) VALUES ($1, $2, $3)", ["Financial analyst", "analyst", "active"]);
    await db.run("INSERT INTO agents (name, type, status) VALUES ($1, $2, $3)", ["CFO agent", "cfo", "active"]);
    await db.run("INSERT INTO agents (name, type, status) VALUES ($1, $2, $3)", ["Forecasting agent", "forecasting", "idle"]);
  }

  // Demo user
  const userCount = (await db.get<{ count: string }>("SELECT COUNT(*) as count FROM users"))!;
  if (Number(userCount.count) === 0) {
    const hash = auth.hashPassword("demo123");
    await db.run("INSERT INTO users (email, password_hash) VALUES ($1, $2)", ["demo@finmodel.ai", hash]);
  }

  // Sample decisions
  const decisionsCount = (await db.get<{ count: string }>("SELECT COUNT(*) as count FROM decisions"))!;
  if (Number(decisionsCount.count) === 0) {
    const decisions = [
      { decision_text: "Increase marketing spend by 15% in Q1", context: "Strong pipeline, need brand awareness", expected_outcome: "Higher lead volume", status: "pending" as const },
      { decision_text: "Hire two additional engineers", context: "Product backlog growing", expected_outcome: "Faster feature delivery", status: "pending" as const },
      { decision_text: "Negotiate extended payment terms with key supplier", context: "Cash flow optimization", expected_outcome: "Improved runway", status: "pending" as const },
      { decision_text: "Launch paid tier for SMB segment", context: "Product-market fit validated", expected_outcome: "Recurring revenue growth", status: "pending" as const },
      { decision_text: "Consolidate cloud providers to reduce spend", context: "Current spend 40% above benchmark", expected_outcome: "15–20% infra cost reduction", status: "pending" as const },
      { decision_text: "Open second sales region (EMEA)", context: "Demand from EU prospects", expected_outcome: "New pipeline within 2 quarters", status: "pending" as const },
    ];
    for (const d of decisions) {
      await db.run(
        "INSERT INTO decisions (decision_text, context, expected_outcome, status) VALUES ($1, $2, $3, $4) RETURNING id",
        [d.decision_text, d.context, d.expected_outcome, d.status]
      );
    }
  }

  // Sample agent logs
  const agentLogsCount = (await db.get<{ count: string }>("SELECT COUNT(*) as count FROM agent_logs"))!;
  if (Number(agentLogsCount.count) === 0) {
    const logs = [
      { agent_name: "Financial analyst", action: "Reviewed monthly P&L", recommendation: "Consider reducing discretionary spend in Q2", impact_score: 0.7 },
      { agent_name: "CFO agent", action: "Cash flow forecast updated", recommendation: "Maintain 6-month runway buffer", impact_score: 0.9 },
      { agent_name: "Forecasting agent", action: "Revenue model recalibrated", recommendation: "Revise Q3 targets upward by 8%", impact_score: 0.6 },
      { agent_name: "Financial analyst", action: "Variance analysis (actual vs budget)", recommendation: "Investigate 12% overspend in marketing", impact_score: 0.8 },
      { agent_name: "CFO agent", action: "Runway projection", recommendation: "Extend runway by delaying non-critical hires", impact_score: 0.75 },
      { agent_name: "Forecasting agent", action: "Churn model updated", recommendation: "Focus retention on accounts 18–24 months old", impact_score: 0.65 },
    ];
    for (const log of logs) {
      await db.run(
        "INSERT INTO agent_logs (agent_name, action, recommendation, impact_score) VALUES ($1, $2, $3, $4) RETURNING id",
        [log.agent_name, log.action, log.recommendation, log.impact_score]
      );
    }
  }

  // Sample models
  const modelsCount = (await db.get<{ count: string }>("SELECT COUNT(*) as count FROM models"))!;
  if (Number(modelsCount.count) === 0) {
    const models = [
      ["Revenue forecast v1", "1", JSON.stringify({ horizon_months: 12, method: "linear" })],
      ["Expense model", "1", JSON.stringify({ categories: ["payroll", "ops", "marketing"] })],
      ["Churn prediction", "1", JSON.stringify({ lookback_months: 6, threshold: 0.4 })],
      ["CAC payback", "1", JSON.stringify({ cohort_window: 12 })],
    ];
    for (const [name, version, config] of models) {
      await db.run(
        "INSERT INTO models (name, version, config) VALUES ($1, $2, $3) RETURNING id",
        [name, version, config]
      );
    }
  }

  // Sample integrations
  const integrationsCount = (await db.get<{ count: string }>("SELECT COUNT(*) as count FROM integrations"))!;
  if (Number(integrationsCount.count) === 0) {
    const integrations = [
      { provider: "QuickBooks", type: "accounting", status: "disconnected" },
      { provider: "Stripe", type: "payments", status: "disconnected" },
      { provider: "Xero", type: "accounting", status: "disconnected" },
    ];
    for (const i of integrations) {
      await db.run(
        "INSERT INTO integrations (provider, type, status) VALUES ($1, $2, $3) RETURNING id",
        [i.provider, i.type, i.status]
      );
    }
  }
}
