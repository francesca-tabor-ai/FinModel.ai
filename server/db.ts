/**
 * Database abstraction: PostgreSQL when DATABASE_URL or DATABASE_PUBLIC_URL is set
 * (e.g. Railway internal URL or public proxy URL), otherwise SQLite for local dev.
 */
import Database from "better-sqlite3";
import pg from "pg";

const DATABASE_URL = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;
const isPostgres = Boolean(DATABASE_URL);

/** Convert $1, $2... placeholders to ? for SQLite */
function toSqlitePlaceholders(sql: string): string {
  return sql.replace(/\$\d+/g, "?");
}

export type DbRunResult = { lastInsertRowid: number };

export interface DbAdapter {
  get<T = unknown>(sql: string, params?: unknown[]): Promise<T | undefined>;
  all<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  run(sql: string, params?: unknown[]): Promise<DbRunResult>;
  exec(sql: string): Promise<void>;
}

/** SQLite adapter (sync API wrapped in promises) */
function createSqliteAdapter(path: string): DbAdapter {
  const db = new Database(path);
  return {
    async get<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
      const s = toSqlitePlaceholders(sql);
      return db.prepare(s).get(...params) as T | undefined;
    },
    async all<T>(sql: string, params: unknown[] = []): Promise<T[]> {
      const s = toSqlitePlaceholders(sql);
      return (db.prepare(s).all(...params) as T[]) ?? [];
    },
    async run(sql: string, params: unknown[] = []): Promise<DbRunResult> {
      const s = toSqlitePlaceholders(sql).replace(/\s*RETURNING\s+id\s*$/i, "");
      const info = db.prepare(s).run(...params);
      return { lastInsertRowid: Number(info.lastInsertRowid) };
    },
    async exec(sql: string): Promise<void> {
      db.exec(toSqlitePlaceholders(sql));
    },
  };
}

/** PostgreSQL adapter (uses $1, $2 in SQL) */
function createPgAdapter(connectionString: string): DbAdapter {
  const pool = new pg.Pool({
    connectionString,
    ssl: /railway|rlwy\.net/.test(connectionString) ? { rejectUnauthorized: false } : undefined,
  });

  return {
    async get<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
      const r = await pool.query(sql, params);
      return (r.rows[0] as T) ?? undefined;
    },
    async all<T>(sql: string, params: unknown[] = []): Promise<T[]> {
      const r = await pool.query(sql, params);
      return (r.rows as T[]) ?? [];
    },
    async run(sql: string, params: unknown[] = []): Promise<DbRunResult> {
      const r = await pool.query(sql, params);
      const row = r.rows[0] as { id?: number } | undefined;
      return { lastInsertRowid: Number(row?.id ?? 0) };
    },
    async exec(sql: string): Promise<void> {
      await pool.query(sql);
    },
  };
}

let dbInstance: DbAdapter | null = null;

export function getDb(): DbAdapter {
  if (!dbInstance) {
    if (isPostgres && DATABASE_URL) {
      dbInstance = createPgAdapter(DATABASE_URL);
      console.log("Using PostgreSQL");
    } else {
      dbInstance = createSqliteAdapter(process.env.DATABASE_PATH || "finmodel.db");
      console.log("Using SQLite (local)");
    }
  }
  return dbInstance;
}

/** PostgreSQL schema (SERIAL, TIMESTAMP). For SQLite we use different DDL in initSchema. */
const PG_SCHEMA = `
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
`;

const SQLITE_SCHEMA = `
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
`;

export async function initSchema(): Promise<void> {
  const db = getDb();
  const schema = isPostgres ? PG_SCHEMA : SQLITE_SCHEMA;
  if (isPostgres) {
    for (const stmt of schema.split(";").filter((s) => s.trim())) {
      await db.exec(stmt.trim() + ";");
    }
  } else {
    await db.exec(schema);
  }
}
