import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { generateInsights, simulateDecision } from "./server/gemini";
import { HttpError, BadRequestError, UnauthorizedError } from "./server/errors";
import { API, validationErrorResponse } from "./server/api-routes";
import * as auth from "./server/auth";
import { getDb, initSchema } from "./server/db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed(db: ReturnType<typeof getDb>) {
  // Financial data: 6 months, deterministic for reproducible seed
  const financialCount = (await db.get<{ count: string }>("SELECT COUNT(*) as count FROM financial_data"))!;
  if (Number(financialCount.count) === 0) {
    const months = [
      { month: "2025-09", revenue: 12500, expenses: 42000 },
      { month: "2025-10", revenue: 18200, expenses: 43500 },
      { month: "2025-11", revenue: 21500, expenses: 44800 },
      { month: "2025-12", revenue: 26800, expenses: 46200 },
      { month: "2026-01", revenue: 30200, expenses: 44100 },
      { month: "2026-02", revenue: 31800, expenses: 45500 },
    ];
    let cash = 500000;
    for (const row of months) {
      cash = cash + row.revenue - row.expenses;
      await db.run(
        "INSERT INTO financial_data (month, revenue, expenses, cash_on_hand, category) VALUES ($1, $2, $3, $4, $5)",
        [row.month, row.revenue, row.expenses, cash, "operating"]
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
      { decision_text: "Increase marketing spend by 15% in Q1", context: "Strong pipeline, need brand awareness", expected_outcome: "Higher lead volume" },
      { decision_text: "Hire two additional engineers", context: "Product backlog growing", expected_outcome: "Faster feature delivery" },
      { decision_text: "Negotiate extended payment terms with key supplier", context: "Cash flow optimization", expected_outcome: "Improved runway" },
    ];
    for (const d of decisions) {
      await db.run(
        "INSERT INTO decisions (decision_text, context, expected_outcome, status) VALUES ($1, $2, $3, $4) RETURNING id",
        [d.decision_text, d.context, d.expected_outcome, "pending"]
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
    await db.run(
      "INSERT INTO models (name, version, config) VALUES ($1, $2, $3) RETURNING id",
      ["Revenue forecast v1", "1", JSON.stringify({ horizon_months: 12, method: "linear" })]
    );
    await db.run(
      "INSERT INTO models (name, version, config) VALUES ($1, $2, $3) RETURNING id",
      ["Expense model", "1", JSON.stringify({ categories: ["payroll", "ops", "marketing"] })]
    );
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

async function startServer() {
  await initSchema();
  const db = getDb();
  await seed(db);

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  const sseClients = new Set<express.Response>();
  function broadcast(event: string, data?: object) {
    const payload = data === undefined ? `${event}\n\n` : `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    sseClients.forEach((res) => {
      try {
        res.write(payload);
      } catch {
        sseClients.delete(res);
      }
    });
  }

  app.use(express.json());

  app.get(API.financials, async (_req, res) => {
    try {
      const data = await db.all("SELECT * FROM financial_data ORDER BY month ASC");
      res.json(data);
    } catch (err) {
      console.error("GET /api/financials:", err);
      res.status(500).json({ error: "Failed to load financials" });
    }
  });

  app.get(API.decisions, async (_req, res) => {
    try {
      const data = await db.all("SELECT * FROM decisions ORDER BY timestamp DESC");
      res.json(data);
    } catch (err) {
      console.error("GET /api/decisions:", err);
      res.status(500).json({ error: "Failed to load decisions" });
    }
  });

  app.post(API.decisions, async (req, res) => {
    try {
      const { decision_text, context, expected_outcome } = req.body ?? {};
      if (!decision_text || typeof decision_text !== "string") {
        return res.status(400).json(validationErrorResponse("decision_text is required", "decision_text"));
      }
      const info = await db.run(
        "INSERT INTO decisions (decision_text, context, expected_outcome) VALUES ($1, $2, $3) RETURNING id",
        [decision_text, context ?? null, expected_outcome ?? null]
      );
      broadcast("refresh", { source: "decisions" });
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (err) {
      console.error("POST", API.decisions, err);
      res.status(500).json({ error: "Failed to save decision" });
    }
  });

  app.get(API.agentLogs, async (_req, res) => {
    try {
      const data = await db.all("SELECT * FROM agent_logs ORDER BY timestamp DESC LIMIT 50");
      res.json(data);
    } catch (err) {
      console.error("GET /api/agent-logs:", err);
      res.status(500).json({ error: "Failed to load agent logs" });
    }
  });

  app.post(API.agentLogs, async (req, res) => {
    try {
      const { agent_name, action, recommendation, impact_score } = req.body ?? {};
      if (!agent_name || typeof agent_name !== "string") {
        return res.status(400).json(validationErrorResponse("agent_name is required", "agent_name"));
      }
      if (!action || typeof action !== "string") {
        return res.status(400).json(validationErrorResponse("action is required", "action"));
      }
      const info = await db.run(
        "INSERT INTO agent_logs (agent_name, action, recommendation, impact_score) VALUES ($1, $2, $3, $4) RETURNING id",
        [agent_name, action, recommendation ?? null, impact_score ?? null]
      );
      broadcast("refresh", { source: "agent_logs" });
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (err) {
      console.error("POST", API.agentLogs, err);
      res.status(500).json({ error: "Failed to save agent log" });
    }
  });

  app.post(API.insights, async (req, res) => {
    try {
      const data = req.body;
      if (!Array.isArray(data)) {
        throw BadRequestError("Expected array of financial metrics");
      }
      const result = await generateInsights(data);
      res.json(result);
    } catch (err) {
      if (err instanceof HttpError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      console.error("POST /api/insights:", err);
      res.status(500).json({ error: "Failed to generate insights" });
    }
  });

  app.post(API.simulate, async (req, res) => {
    try {
      const { decision, financials } = req.body ?? {};
      if (!decision || typeof decision !== "string" || !Array.isArray(financials)) {
        throw BadRequestError("decision (string) and financials (array) are required");
      }
      const result = await simulateDecision(decision, financials);
      res.json(result);
    } catch (err) {
      if (err instanceof HttpError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      console.error("POST /api/simulate:", err);
      res.status(500).json({ error: "Failed to run simulation" });
    }
  });

  app.get(API.models, async (_req, res) => {
    try {
      const data = await db.all("SELECT * FROM models ORDER BY updated_at DESC");
      res.json(data);
    } catch (err) {
      console.error("GET", API.models, err);
      res.status(500).json({ error: "Failed to load models" });
    }
  });

  app.post(API.models, async (req, res) => {
    try {
      const { name, version, config } = req.body ?? {};
      if (!name || typeof name !== "string") {
        return res.status(400).json(validationErrorResponse("name is required", "name"));
      }
      const info = await db.run(
        "INSERT INTO models (name, version, config) VALUES ($1, $2, $3) RETURNING id",
        [name, version ?? "1", config ?? null]
      );
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (err) {
      console.error("POST", API.models, err);
      res.status(500).json({ error: "Failed to save model" });
    }
  });

  app.get(API.agents, async (_req, res) => {
    try {
      const data = await db.all("SELECT * FROM agents ORDER BY name ASC");
      res.json(data);
    } catch (err) {
      console.error("GET", API.agents, err);
      res.status(500).json({ error: "Failed to load agents" });
    }
  });

  app.post(API.agents, async (req, res) => {
    try {
      const { name, type, config, status } = req.body ?? {};
      if (!name || typeof name !== "string") {
        return res.status(400).json(validationErrorResponse("name is required", "name"));
      }
      if (!type || typeof type !== "string") {
        return res.status(400).json(validationErrorResponse("type is required", "type"));
      }
      const info = await db.run(
        "INSERT INTO agents (name, type, config, status) VALUES ($1, $2, $3, $4) RETURNING id",
        [name, type, config ?? null, status ?? "idle"]
      );
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (err) {
      console.error("POST", API.agents, err);
      res.status(500).json({ error: "Failed to save agent" });
    }
  });

  app.get(API.integrations, async (_req, res) => {
    try {
      const data = await db.all("SELECT * FROM integrations ORDER BY provider ASC");
      res.json(data);
    } catch (err) {
      console.error("GET", API.integrations, err);
      res.status(500).json({ error: "Failed to load integrations" });
    }
  });

  app.post(API.integrations, async (req, res) => {
    try {
      const { provider, type, config, status } = req.body ?? {};
      if (!provider || typeof provider !== "string") {
        return res.status(400).json(validationErrorResponse("provider is required", "provider"));
      }
      if (!type || typeof type !== "string") {
        return res.status(400).json(validationErrorResponse("type is required", "type"));
      }
      const info = await db.run(
        "INSERT INTO integrations (provider, type, config, status) VALUES ($1, $2, $3, $4) RETURNING id",
        [provider, type, config ?? null, status ?? "disconnected"]
      );
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (err) {
      console.error("POST", API.integrations, err);
      res.status(500).json({ error: "Failed to save integration" });
    }
  });

  app.get(API.me, (req, res) => {
    try {
      const session = auth.getSessionFromCookie(req.headers.cookie);
      if (!session) {
        throw UnauthorizedError("Not logged in");
      }
      res.json({ id: session.userId, email: session.email });
    } catch (err) {
      if (err instanceof HttpError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      throw err;
    }
  });

  app.post(API.login, async (req, res) => {
    try {
      const { email, password } = req.body ?? {};
      if (!email || typeof email !== "string" || !password || typeof password !== "string") {
        return res.status(400).json(validationErrorResponse("email and password are required"));
      }
      const row = await db.get<{ id: number; email: string; password_hash: string }>(
        "SELECT id, email, password_hash FROM users WHERE email = $1",
        [email]
      );
      if (!row || !auth.verifyPassword(password, row.password_hash)) {
        throw UnauthorizedError("Invalid email or password");
      }
      const sessionId = auth.createSession(row.id, row.email);
      res.setHeader("Set-Cookie", auth.setSessionCookie(sessionId));
      res.json({ user: { id: row.id, email: row.email } });
    } catch (err) {
      if (err instanceof HttpError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      console.error("POST", API.login, err);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post(API.logout, (_req, res) => {
    res.setHeader("Set-Cookie", auth.clearSessionCookie());
    res.json({ ok: true });
  });

  app.get(API.events, (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    sseClients.add(res);
    res.write(": connected\n\n");
    const keepalive = setInterval(() => res.write(": keepalive\n\n"), 30000);
    req.on("close", () => {
      clearInterval(keepalive);
      sseClients.delete(res);
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} (NODE_ENV=${process.env.NODE_ENV ?? "development"})`);
  });
}

startServer();
