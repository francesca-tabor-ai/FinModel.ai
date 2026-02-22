-- FinModel.ai – Railway PostgreSQL schema
-- Run this in Railway Postgres: Dashboard → your Postgres service → Query, or via psql.
-- Tables are also created automatically when the app starts (initSchema in server/db.ts).

CREATE TABLE IF NOT EXISTS financial_data (
  id SERIAL PRIMARY KEY,
  month TEXT NOT NULL,
  revenue DOUBLE PRECISION DEFAULT 0,
  expenses DOUBLE PRECISION DEFAULT 0,
  cash_on_hand DOUBLE PRECISION DEFAULT 0,
  category TEXT
);

CREATE TABLE IF NOT EXISTS decisions (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  decision_text TEXT NOT NULL,
  context TEXT,
  expected_outcome TEXT,
  actual_outcome TEXT,
  status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS agent_logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  agent_name TEXT NOT NULL,
  action TEXT NOT NULL,
  recommendation TEXT,
  impact_score DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS models (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1',
  config TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agents (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  config TEXT,
  status TEXT NOT NULL DEFAULT 'idle',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS integrations (
  id SERIAL PRIMARY KEY,
  provider TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disconnected',
  config TEXT,
  last_sync_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
