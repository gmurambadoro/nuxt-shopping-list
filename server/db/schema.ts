// Drizzle ORM column types for SQLite.
// sqliteTable     — defines a table. The string 'lists' is the actual SQL table name.
// text, integer   — column type constructors. Customise with .primaryKey(), .notNull(),
//                   .default(), .references().
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

// The name passed to sqliteTable() becomes the database table name.
// In SQL this creates: CREATE TABLE lists (...)
// Keys on the returned object (e.g. lists.id) are used as query references.
export const lists = sqliteTable('lists', {
  // The argument to text() is the SQL column name. The JS key (id) is the property name
  // used in queries. They can differ — Drizzle maps between them.
  // .primaryKey() sets this as the PRIMARY KEY.
  id: text('id').primaryKey(),

  // .notNull() adds NOT NULL constraint. Without it the column defaults to nullable.
  name: text('name').notNull(),

  // ISO 8601 date strings stored as TEXT. SQLite has no native DATETIME type,
  // so dates are stored as text or integers. Text is more readable in the raw DB.
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const items = sqliteTable('items', {
  id: text('id').primaryKey(),

  // .references(() => lists.id) creates a FOREIGN KEY constraint.
  // { onDelete: 'cascade' } means: when a list is deleted, all its items are
  // automatically deleted by the database. This keeps referential integrity
  // at the database level, so application code does not need to manually
  // delete child rows.
  listId: text('list_id').notNull().references(() => lists.id, { onDelete: 'cascade' }),

  name: text('name').notNull(),

  // integer() with { mode: 'boolean' } stores 0/1 in SQLite but exposes the
  // field as a boolean in JavaScript. Without mode, it would be number (0 or 1).
  // .default(false) sets the SQL column DEFAULT to 0.
  purchased: integer('purchased', { mode: 'boolean' }).notNull().default(false),

  createdAt: text('created_at').notNull(),
})
