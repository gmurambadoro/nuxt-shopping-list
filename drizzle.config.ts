// Drizzle Kit configuration — used by drizzle-kit CLI for generating and
// running migrations. Not imported by application code.
//
// Commands:
//   bun run db:generate   — compares schema.ts to the current DB and writes
//                            a migration SQL file to server/db/migrations/
//   bun run db:migrate    — applies pending migrations from server/db/migrations/
//   bun run db:push       — pushes schema directly without migration files
//                            (useful for prototyping, but avoid in production)

import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  // Path to the Drizzle schema file(s). Glob patterns are supported:
  // './server/db/schema.ts' or './server/db/*.ts' for multiple files.
  schema: './server/db/schema.ts',

  // Directory where generated migration SQL files are written.
  // Each migration gets a numbered folder with a timestamp.
  out: './server/db/migrations',

  // Database dialect. Options: 'sqlite', 'postgresql', 'mysql', 'turso'.
  dialect: 'sqlite',

  dbCredentials: {
    // Path to the SQLite database file. Must match DB_PATH in server/db/index.ts.
    // drizzle-kit uses this to read the current schema for comparison when generating
    // migrations.
    url: './data/shopping-list.db',
  },
})
