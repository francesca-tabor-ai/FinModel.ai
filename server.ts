import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { generateInsights, simulateDecision, chat } from "./server/gemini";
import { computeHealthScore } from "./server/healthScore";
import { HttpError, BadRequestError, UnauthorizedError } from "./server/errors";
import { API, validationErrorResponse } from "./server/api-routes";
import * as auth from "./server/auth";
import { getDb, initSchema } from "./server/db";
import { seed } from "./server/seed";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
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

  const MAX_TEXT_LENGTH = 10000;
  app.post(API.decisions, async (req, res) => {
    try {
      const { decision_text, context, expected_outcome } = req.body ?? {};
      if (!decision_text || typeof decision_text !== "string") {
        return res.status(400).json(validationErrorResponse("decision_text is required", "decision_text"));
      }
      if (decision_text.length > MAX_TEXT_LENGTH) {
        return res.status(400).json(validationErrorResponse("decision_text too long", "decision_text"));
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
      if (agent_name.length > MAX_TEXT_LENGTH || action.length > MAX_TEXT_LENGTH) {
        return res.status(400).json(validationErrorResponse("Field too long"));
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

  const MAX_ARRAY_LENGTH = 120; // ~10 years of monthly data
  app.post(API.healthScore, async (req, res) => {
    try {
      const data = req.body;
      if (!Array.isArray(data)) {
        return res.status(400).json({ error: "Expected array of financial metrics" });
      }
      if (data.length > MAX_ARRAY_LENGTH) {
        return res.status(400).json({ error: `Array too large (max ${MAX_ARRAY_LENGTH} items)` });
      }
      const normalized = data.map((d: unknown) => {
        const o = d && typeof d === "object" && !Array.isArray(d) ? (d as Record<string, unknown>) : {};
        return {
          month: String(o.month ?? ""),
          revenue: Number(o.revenue) || 0,
          expenses: Number(o.expenses) || 0,
          cash_on_hand: Number(o.cash_on_hand) || 0,
        };
      });
      const result = computeHealthScore(normalized);
      res.json(result);
    } catch (err) {
      console.error("POST /api/health-score:", err);
      res.status(500).json({ error: "Failed to compute health score" });
    }
  });

  app.post(API.insights, async (req, res) => {
    try {
      const data = req.body;
      if (!Array.isArray(data)) {
        throw BadRequestError("Expected array of financial metrics");
      }
      if (data.length > MAX_ARRAY_LENGTH) {
        throw BadRequestError(`Array too large (max ${MAX_ARRAY_LENGTH} items)`);
      }
      const normalized = data.map((d: unknown) => {
        const o = d && typeof d === "object" && !Array.isArray(d) ? (d as Record<string, unknown>) : {};
        return {
          month: String(o.month ?? ""),
          revenue: Number(o.revenue) || 0,
          expenses: Number(o.expenses) || 0,
          cash_on_hand: Number(o.cash_on_hand) || 0,
        };
      });
      const result = await generateInsights(normalized);
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
      if (decision.length > MAX_TEXT_LENGTH || financials.length > MAX_ARRAY_LENGTH) {
        throw BadRequestError("decision or financials too large");
      }
      const normalized = financials.slice(0, MAX_ARRAY_LENGTH).map((d: unknown) => {
        const o = d && typeof d === "object" && !Array.isArray(d) ? (d as Record<string, unknown>) : {};
        return {
          month: String(o.month ?? ""),
          revenue: Number(o.revenue) || 0,
          expenses: Number(o.expenses) || 0,
          cash_on_hand: Number(o.cash_on_hand) || 0,
        };
      });
      const result = await simulateDecision(decision, normalized);
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

  const MAX_CHAT_MESSAGES = 50;
  const MAX_MESSAGE_LENGTH = 8000;
  app.post(API.chat, async (req, res) => {
    try {
      const { messages } = req.body ?? {};
      if (!Array.isArray(messages)) {
        throw BadRequestError("messages (array of { role, content }) is required");
      }
      if (messages.length > MAX_CHAT_MESSAGES) {
        throw BadRequestError(`Too many messages (max ${MAX_CHAT_MESSAGES})`);
      }
      const valid = messages.every(
        (m: unknown) => {
          if (!m || typeof m !== "object") return false;
          const msg = m as { role?: string; content?: unknown };
          if (!(msg.role in { user: 1, assistant: 1 }) || typeof msg.content !== "string") return false;
          return msg.content.length <= MAX_MESSAGE_LENGTH;
        }
      );
      if (!valid) {
        throw BadRequestError("Each message must have role 'user' or 'assistant' and content string (max 8000 chars)");
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
      if (name.length > MAX_TEXT_LENGTH) {
        return res.status(400).json(validationErrorResponse("name too long", "name"));
      }
      const MAX_CONFIG_LENGTH = 50000;
      const configVal = config == null ? null : (typeof config === "string" ? config : JSON.stringify(config)).slice(0, MAX_CONFIG_LENGTH);
      const info = await db.run(
        "INSERT INTO models (name, version, config) VALUES ($1, $2, $3) RETURNING id",
        [name, version ?? "1", configVal]
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
      if (name.length > MAX_TEXT_LENGTH || type.length > 500) {
        return res.status(400).json(validationErrorResponse("Field too long"));
      }
      const MAX_CONFIG_LENGTH = 50000;
      const configVal = config == null ? null : (typeof config === "string" ? config : JSON.stringify(config)).slice(0, MAX_CONFIG_LENGTH);
      const info = await db.run(
        "INSERT INTO agents (name, type, config, status) VALUES ($1, $2, $3, $4) RETURNING id",
        [name, type, configVal, status ?? "idle"]
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
      if (provider.length > MAX_TEXT_LENGTH || type.length > 500) {
        return res.status(400).json(validationErrorResponse("Field too long"));
      }
      const MAX_CONFIG_LENGTH = 50000;
      const configVal = config == null ? null : (typeof config === "string" ? config : JSON.stringify(config)).slice(0, MAX_CONFIG_LENGTH);
      const info = await db.run(
        "INSERT INTO integrations (provider, type, config, status) VALUES ($1, $2, $3, $4) RETURNING id",
        [provider, type, configVal, status ?? "disconnected"]
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
