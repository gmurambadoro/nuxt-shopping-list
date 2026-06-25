# Phase 3 — Learning Outcome Step 11: Database Setup with Drizzle ORM + SQLite

## Concepts covered

### Drizzle ORM vs a full ORM
Drizzle is lightweight — it does not manage relationships at the application
level or auto-load related data. You write explicit queries (select, insert,
update, delete) using typed objects rather than raw SQL strings, but you
stay close to the database. This avoids the "magic" of heavier ORMs while
still getting type safety.

### Schema definition with `sqliteTable`
```ts
export const lists = sqliteTable('lists', {
  id:        text('id').primaryKey(),
  name:      text('name').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})
```

Key points:
- The first argument to `sqliteTable` is the SQL table name.
- The key names (JS camelCase) can differ from the column names (SQL snake_case).
- `.primaryKey()` sets PRIMARY KEY.
- `.notNull()` adds NOT NULL — without it the column is nullable by default.
- `text()` stores ISO 8601 date strings in SQLite (no native DATETIME type).

### Foreign keys with cascade delete
```ts
listId: text('list_id').notNull().references(() => lists.id, { onDelete: 'cascade' })
```
- `.references()` creates a FOREIGN KEY constraint at the database level.
- `{ onDelete: 'cascade' }` means deleting a list automatically deletes
  all its items. This is enforced by SQLite itself — application code does
  not need to manually delete child rows. It is far more reliable than
  looping through items in JavaScript and deleting them one by one.

### Boolean mode in SQLite
```ts
purchased: integer('purchased', { mode: 'boolean' }).notNull().default(false)
```
SQLite has no native BOOLEAN type. Without `{ mode: 'boolean' }`, the column
would be typed as `number` in TypeScript (0 or 1). With the mode flag, Drizzle
maps 0/1 to `false`/`true` transparently. The `default(false)` sets the SQL
column DEFAULT to 0.

### Singleton database connection
```ts
let db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function useDb() {
  if (!db) {
    const sqlite = new Database(DB_PATH)
    sqlite.pragma('journal_mode = WAL')
    db = drizzle(sqlite, { schema })
  }
  return db
}
```
- The connection is created once and reused. Nitro hot-reloads the module in
  development, but the `let db` variable persists inside the module closure.
- `{ schema }` is passed so Drizzle knows the table structure. This enables
  fully typed queries — `db.select().from(schema.lists)` returns rows typed
  to the `lists` table definition.

### WAL mode
```sql
PRAGMA journal_mode = WAL;
```
Write-Ahead Logging allows concurrent reads during a write. Without it,
SQLite locks the entire database file while a write is in progress, which
blocks all other reads until the write finishes. WAL is the recommended
journal mode for most applications (especially web apps where multiple
requests may try to read simultaneously).

### Migrations workflow
1. Edit `server/db/schema.ts` (add columns, change types, etc.)
2. `bun run db:generate` — compares schema to current DB, writes SQL to
   `server/db/migrations/` (never edit migration files by hand)
3. `bun run db:migrate` — applies pending migrations to the database
4. Commit both the schema changes AND the generated migration files

The migration files should be committed to git. They are the definitive
record of how the database schema evolved over time. On a fresh clone,
`bun install && bun run db:migrate` recreates the database.

### drizzle-kit push vs generate/migrate
- `db:push` — synchronises the schema directly without creating migration
  files. Fast for prototyping but unsuitable for production (no audit trail,
  no rollback).
- `db:generate` + `db:migrate` — creates versioned migration files that are
  committed to git. Required for production deployments.
