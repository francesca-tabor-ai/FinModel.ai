import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import { generateInsights, simulateDecision } from "./server/gemini";

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

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/financials", (_req, res) => {
    try {
      const data = db.prepare("SELECT * FROM financial_data ORDER BY month ASC").all();
      res.json(data);
    } catch (err) {
      console.error("GET /api/financials:", err);
      res.status(500).json({ error: "Failed to load financials" });
    }
  });

  app.get("/api/decisions", (_req, res) => {
    try {
      const data = db.prepare("SELECT * FROM decisions ORDER BY timestamp DESC").all();
      res.json(data);
    } catch (err) {
      console.error("GET /api/decisions:", err);
      res.status(500).json({ error: "Failed to load decisions" });
    }
  });

  app.post("/api/decisions", (req, res) => {
    try {
      const { decision_text, context, expected_outcome } = req.body ?? {};
      if (!decision_text || typeof decision_text !== "string") {
        res.status(400).json({ error: "decision_text is required" });
        return;
      }
      const info = db.prepare("INSERT INTO decisions (decision_text, context, expected_outcome) VALUES (?, ?, ?)")
        .run(decision_text, context ?? null, expected_outcome ?? null);
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (err) {
      console.error("POST /api/decisions:", err);
      res.status(500).json({ error: "Failed to save decision" });
    }
  });

  app.get("/api/agent-logs", (_req, res) => {
    try {
      const data = db.prepare("SELECT * FROM agent_logs ORDER BY timestamp DESC LIMIT 50").all();
      res.json(data);
    } catch (err) {
      console.error("GET /api/agent-logs:", err);
      res.status(500).json({ error: "Failed to load agent logs" });
    }
  });

  app.post("/api/agent-logs", (req, res) => {
    try {
      const { agent_name, action, recommendation, impact_score } = req.body ?? {};
      if (!agent_name || !action) {
        res.status(400).json({ error: "agent_name and action are required" });
        return;
      }
      const info = db.prepare("INSERT INTO agent_logs (agent_name, action, recommendation, impact_score) VALUES (?, ?, ?, ?)")
        .run(agent_name, action, recommendation ?? null, impact_score ?? null);
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (err) {
      console.error("POST /api/agent-logs:", err);
      res.status(500).json({ error: "Failed to save agent log" });
    }
  });

  app.post("/api/insights", async (req, res) => {
    try {
      const data = req.body;
      if (!Array.isArray(data)) {
        res.status(400).json({ error: "Expected array of financial metrics" });
        return;
      }
      const result = await generateInsights(data);
      res.json(result);
    } catch (err) {
      console.error("POST /api/insights:", err);
      res.status(500).json({ error: "Failed to generate insights" });
    }
  });

  app.post("/api/simulate", async (req, res) => {
    try {
      const { decision, financials } = req.body ?? {};
      if (!decision || typeof decision !== "string" || !Array.isArray(financials)) {
        res.status(400).json({ error: "decision (string) and financials (array) are required" });
        return;
      }
      const result = await simulateDecision(decision, financials);
      res.json(result);
    } catch (err) {
      console.error("POST /api/simulate:", err);
      res.status(500).json({ error: "Failed to run simulation" });
    }
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
