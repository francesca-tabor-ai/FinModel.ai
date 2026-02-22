#!/usr/bin/env tsx
/**
 * Seed database with demo data (financial data, agents, users, decisions, etc).
 * Run: npm run seed-tables
 * Uses DATABASE_URL from .env for Postgres, or SQLite locally.
 */
import "dotenv/config";
import { getDb, initSchema } from "../server/db";
import { seed } from "../server";

async function main() {
  await initSchema();
  const db = getDb();
  await seed(db);
  console.log("Database seeded successfully.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed to seed:", err);
    process.exit(1);
  });
