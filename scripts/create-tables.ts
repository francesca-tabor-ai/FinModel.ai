#!/usr/bin/env tsx
/**
 * Create PostgreSQL tables in Railway (or any Postgres).
 * Run: DATABASE_URL=postgresql://... npm run create-tables
 * Or with .env containing DATABASE_URL: npm run create-tables
 */
import "dotenv/config";
import { initSchema } from "../server/db";

initSchema()
  .then(() => {
    console.log("Tables created successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to create tables:", err);
    process.exit(1);
  });
