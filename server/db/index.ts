// Database connection singleton for Nitro server routes.
// Using better-sqlite3 because it is synchronous (no async/await needed for queries),
// fast, and works well with Bun. The alternative @libsql/client is async but adds
// complexity for a local-only setup.

import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'

// Path is relative to the project root (where bun run dev executes).
// The file is in data/ which is gitignored (only *.db files are ignored;
// .gitkeep is tracked so the directory exists on fresh clones).
const DB_PATH = './data/shopping-list.db'

// Module-level variable — persists across Nitro hot reloads in development.
// The singleton pattern ensures only one connection is opened, even when
// useDb() is called from multiple API routes during the same request.
let db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function useDb() {
  if (!db) {
    const sqlite = new Database(DB_PATH)

    // WAL (Write-Ahead Logging) mode improves concurrent read performance
    // by allowing reads to proceed while a write is in progress. Without it,
    // SQLite locks the entire database file during writes.
    sqlite.pragma('journal_mode = WAL')

    // Pass the schema object so Drizzle knows the table structure.
    // This enables type-safe queries: db.select().from(schema.lists) is
    // fully typed based on the column definitions in schema.ts.
    db = drizzle(sqlite, { schema })
  }
  return db
}
