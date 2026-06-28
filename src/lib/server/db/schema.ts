import { sql } from 'drizzle-orm';
import {
	check,
	index,
	primaryKey,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	varchar
} from 'drizzle-orm/pg-core';

export const users = pgTable(
	'users',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		email: varchar('email', { length: 320 }).notNull(),
		displayName: varchar('display_name', { length: 80 }).notNull(),
		passwordHash: text('password_hash').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [uniqueIndex('users_email_unique').on(table.email)]
);

export const notes = pgTable(
	'notes',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		title: varchar('title', { length: 160 }).notNull(),
		body: text('body').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		index('notes_user_id_updated_at_index').on(table.userId, table.updatedAt),
		index('notes_title_trgm_index').using('gin', table.title.op('gin_trgm_ops')),
		index('notes_body_trgm_index').using('gin', table.body.op('gin_trgm_ops')),
		check('notes_title_not_blank', sql`char_length(trim(${table.title})) > 0`)
	]
);

export const tags = pgTable(
	'tags',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		name: varchar('name', { length: 40 }).notNull(),
		normalizedName: varchar('normalized_name', { length: 40 }).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		uniqueIndex('tags_user_id_normalized_name_unique').on(table.userId, table.normalizedName),
		index('tags_user_id_name_index').on(table.userId, table.name),
		check('tags_name_not_blank', sql`char_length(trim(${table.name})) > 0`)
	]
);

export const noteTags = pgTable(
	'note_tags',
	{
		noteId: uuid('note_id')
			.notNull()
			.references(() => notes.id, { onDelete: 'cascade' }),
		tagId: uuid('tag_id')
			.notNull()
			.references(() => tags.id, { onDelete: 'cascade' })
	},
	(table) => [
		primaryKey({ columns: [table.noteId, table.tagId] }),
		index('note_tags_tag_id_note_id_index').on(table.tagId, table.noteId)
	]
);

export const sessions = pgTable(
	'sessions',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		tokenHash: varchar('token_hash', { length: 64 }).notNull(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).defaultNow().notNull(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		userAgent: varchar('user_agent', { length: 500 })
	},
	(table) => [
		uniqueIndex('sessions_token_hash_unique').on(table.tokenHash),
		index('sessions_user_id_expires_at_index').on(table.userId, table.expiresAt)
	]
);

export type User = typeof users.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type Session = typeof sessions.$inferSelect;
