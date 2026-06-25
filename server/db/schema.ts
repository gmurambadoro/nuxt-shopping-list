import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id:           text('id').primaryKey(),
  email:        text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name:         text('name').notNull(),
  createdAt:    text('created_at').notNull(),
})

export const lists = sqliteTable('lists', {
  id:        text('id').primaryKey(),
  userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name:      text('name').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const shareTokens = sqliteTable('share_tokens', {
  id:        text('id').primaryKey(),
  listId:    text('list_id').notNull().references(() => lists.id, { onDelete: 'cascade' }),
  token:     text('token').notNull().unique(),
  role:      text('role', { enum: ['viewer', 'editor'] }).notNull().default('viewer'),
  email:     text('email'),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: text('created_at').notNull(),
})

export const items = sqliteTable('items', {
  id:        text('id').primaryKey(),
  listId:    text('list_id').notNull().references(() => lists.id, { onDelete: 'cascade' }),
  name:      text('name').notNull(),
  purchased: integer('purchased', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
})
