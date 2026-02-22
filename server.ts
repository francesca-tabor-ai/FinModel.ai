import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { generateInsights, simulateDecision, chat } from "./server/gemini";
import { HttpError, BadRequestError, UnauthorizedError } from "./server/errors";
import { API, validationErrorResponse } from "./server/api-routes";
import * as auth from "./server/auth";
import { getDb, initSchema } from "./server/db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seed(db: ReturnType<typeof getDb>) {
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

  app.use(express.json({ limit: "1mb" }));

  // Health check for load balancers and orchestrators
  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // Optional CORS: set CORS_ORIGIN in production if frontend is on another origin
  const corsOrigin = process.env.CORS_ORIGIN;
  if (corsOrigin) {
    app.use((req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", corsOrigin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      if (req.method === "OPTIONS") {
        return res.status(204).end();
      }
      next();
    });
  }
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    next();
  });

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

  app.post(API.chat, async (req, res) => {
    try {
      const { messages } = req.body ?? {};
      if (!Array.isArray(messages)) {
        throw BadRequestError("messages (array of { role, content }) is required");
      }
      const valid = messages.every(
        (m: unknown) =>
          m &&
          typeof m === "object" &&
          (m as { role?: string }).role in { user: 1, assistant: 1 } &&
          typeof (m as { content?: unknown }).content === "string"
      );
      if (!valid) {
        throw BadRequestError("Each message must have role 'user' or 'assistant' and content string");
      }
      const reply = await chat(messages as { role: "user" | "assistant"; content: string }[]);
      res.json({ reply });
    } catch (err) {
      if (err instanceof HttpError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      console.error("POST /api/chat:", err);
      res.status(500).json({ error: "Chat failed" });
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

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
