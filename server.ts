import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import { generateInsights, simulateDecision } from "./server/gemini";
import { HttpError, BadRequestError, UnauthorizedError } from "./server/errors";
import { API, validationErrorResponse } from "./server/api-routes";
import * as auth from "./server/auth";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(process.env.DATABASE_PATH || "finmodel.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS financial_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month TEXT NOT NULL,
    revenue REAL DEFAULT 0,
    expenses REAL DEFAULT 0,
    cash_on_hand REAL DEFAULT 0,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS decisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    decision_text TEXT NOT NULL,
    context TEXT,
    expected_outcome TEXT,
    actual_outcome TEXT,
    status TEXT DEFAULT 'pending'
  );

  CREATE TABLE IF NOT EXISTS agent_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    agent_name TEXT NOT NULL,
    action TEXT NOT NULL,
    recommendation TEXT,
    impact_score REAL
  );

  CREATE TABLE IF NOT EXISTS models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '1',
    config TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    config TEXT,
    status TEXT NOT NULL DEFAULT 'idle',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS integrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'disconnected',
    config TEXT,
    last_sync_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed initial data if empty
const rowCount = db.prepare("SELECT COUNT(*) as count FROM financial_data").get() as { count: number };
if (rowCount.count === 0) {
  const months = ["2025-09", "2025-10", "2025-11", "2025-12", "2026-01", "2026-02"];
  const insert = db.prepare("INSERT INTO financial_data (month, revenue, expenses, cash_on_hand) VALUES (?, ?, ?, ?)");
  let cash = 500000;
  months.forEach((m, i) => {
    const rev = 10000 + i * 5000 + Math.random() * 2000;
    const exp = 40000 + Math.random() * 5000;
    cash = cash + rev - exp;
    insert.run(m, rev, exp, cash);
  });
}

const agentCount = db.prepare("SELECT COUNT(*) as count FROM agents").get() as { count: number };
if (agentCount.count === 0) {
  const insertAgent = db.prepare("INSERT INTO agents (name, type, status) VALUES (?, ?, ?)");
  insertAgent.run("Financial analyst", "analyst", "active");
  insertAgent.run("CFO agent", "cfo", "active");
  insertAgent.run("Forecasting agent", "forecasting", "idle");
}

const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  const hash = auth.hashPassword("demo123");
  db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)").run("demo@finmodel.ai", hash);
}

async function startServer() {
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

  // API Routes
  app.get(API.financials, (_req, res) => {
    try {
      const data = db.prepare("SELECT * FROM financial_data ORDER BY month ASC").all();
      res.json(data);
    } catch (err) {
      console.error("GET /api/financials:", err);
      res.status(500).json({ error: "Failed to load financials" });
    }
  });

  app.get(API.decisions, (_req, res) => {
    try {
      const data = db.prepare("SELECT * FROM decisions ORDER BY timestamp DESC").all();
      res.json(data);
    } catch (err) {
      console.error("GET /api/decisions:", err);
      res.status(500).json({ error: "Failed to load decisions" });
    }
  });

  app.post(API.decisions, (req, res) => {
    try {
      const { decision_text, context, expected_outcome } = req.body ?? {};
      if (!decision_text || typeof decision_text !== "string") {
        return res.status(400).json(validationErrorResponse("decision_text is required", "decision_text"));
      }
      const info = db.prepare("INSERT INTO decisions (decision_text, context, expected_outcome) VALUES (?, ?, ?)")
        .run(decision_text, context ?? null, expected_outcome ?? null);
      broadcast("refresh", { source: "decisions" });
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (err) {
      console.error("POST", API.decisions, err);
      res.status(500).json({ error: "Failed to save decision" });
    }
  });

  app.get(API.agentLogs, (_req, res) => {
    try {
      const data = db.prepare("SELECT * FROM agent_logs ORDER BY timestamp DESC LIMIT 50").all();
      res.json(data);
    } catch (err) {
      console.error("GET /api/agent-logs:", err);
      res.status(500).json({ error: "Failed to load agent logs" });
    }
  });

  app.post(API.agentLogs, (req, res) => {
    try {
      const { agent_name, action, recommendation, impact_score } = req.body ?? {};
      if (!agent_name || typeof agent_name !== "string") {
        return res.status(400).json(validationErrorResponse("agent_name is required", "agent_name"));
      }
      if (!action || typeof action !== "string") {
        return res.status(400).json(validationErrorResponse("action is required", "action"));
      }
      const info = db.prepare("INSERT INTO agent_logs (agent_name, action, recommendation, impact_score) VALUES (?, ?, ?, ?)")
        .run(agent_name, action, recommendation ?? null, impact_score ?? null);
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

  app.get(API.models, (_req, res) => {
    try {
      const data = db.prepare("SELECT * FROM models ORDER BY updated_at DESC").all();
      res.json(data);
    } catch (err) {
      console.error("GET", API.models, err);
      res.status(500).json({ error: "Failed to load models" });
    }
  });

  app.post(API.models, (req, res) => {
    try {
      const { name, version, config } = req.body ?? {};
      if (!name || typeof name !== "string") {
        return res.status(400).json(validationErrorResponse("name is required", "name"));
      }
      const info = db.prepare("INSERT INTO models (name, version, config) VALUES (?, ?, ?)")
        .run(name, version ?? "1", config ?? null);
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (err) {
      console.error("POST", API.models, err);
      res.status(500).json({ error: "Failed to save model" });
    }
  });

  app.get(API.agents, (_req, res) => {
    try {
      const data = db.prepare("SELECT * FROM agents ORDER BY name ASC").all();
      res.json(data);
    } catch (err) {
      console.error("GET", API.agents, err);
      res.status(500).json({ error: "Failed to load agents" });
    }
  });

  app.post(API.agents, (req, res) => {
    try {
      const { name, type, config, status } = req.body ?? {};
      if (!name || typeof name !== "string") {
        return res.status(400).json(validationErrorResponse("name is required", "name"));
      }
      if (!type || typeof type !== "string") {
        return res.status(400).json(validationErrorResponse("type is required", "type"));
      }
      const info = db.prepare("INSERT INTO agents (name, type, config, status) VALUES (?, ?, ?, ?)")
        .run(name, type, config ?? null, status ?? "idle");
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (err) {
      console.error("POST", API.agents, err);
      res.status(500).json({ error: "Failed to save agent" });
    }
  });

  app.get(API.integrations, (_req, res) => {
    try {
      const data = db.prepare("SELECT * FROM integrations ORDER BY provider ASC").all();
      res.json(data);
    } catch (err) {
      console.error("GET", API.integrations, err);
      res.status(500).json({ error: "Failed to load integrations" });
    }
  });

  app.post(API.integrations, (req, res) => {
    try {
      const { provider, type, config, status } = req.body ?? {};
      if (!provider || typeof provider !== "string") {
        return res.status(400).json(validationErrorResponse("provider is required", "provider"));
      }
      if (!type || typeof type !== "string") {
        return res.status(400).json(validationErrorResponse("type is required", "type"));
      }
      const info = db.prepare("INSERT INTO integrations (provider, type, config, status) VALUES (?, ?, ?, ?)")
        .run(provider, type, config ?? null, status ?? "disconnected");
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

  app.post(API.login, (req, res) => {
    try {
      const { email, password } = req.body ?? {};
      if (!email || typeof email !== "string" || !password || typeof password !== "string") {
        return res.status(400).json(validationErrorResponse("email and password are required"));
      }
      const row = db.prepare("SELECT id, email, password_hash FROM users WHERE email = ?").get(email) as
        | { id: number; email: string; password_hash: string }
        | undefined;
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

  // Vite middleware for development
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
