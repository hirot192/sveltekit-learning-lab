CREATE EXTENSION IF NOT EXISTS "pg_trgm";--> statement-breakpoint
CREATE INDEX "notes_title_trgm_index" ON "notes" USING gin ("title" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "notes_body_trgm_index" ON "notes" USING gin ("body" gin_trgm_ops);
