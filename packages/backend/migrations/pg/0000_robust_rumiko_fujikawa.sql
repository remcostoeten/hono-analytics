CREATE TABLE IF NOT EXISTS "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" uuid NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"action" text,
	"label" text,
	"value" real,
	"properties" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pageviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" uuid NOT NULL,
	"url" text NOT NULL,
	"path" text NOT NULL,
	"query_params" text,
	"hash" text,
	"title" text,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"time_on_page" integer,
	"scroll_depth" integer,
	"clicks" integer DEFAULT 0 NOT NULL,
	"is_exit" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"domain" text,
	"api_key" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "projects_api_key_unique" UNIQUE("api_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"duration" integer,
	"page_count" integer DEFAULT 0 NOT NULL,
	"referrer" text,
	"referrer_domain" text,
	"landing_page" text,
	"exit_page" text,
	"origin" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"utm_term" text,
	"utm_content" text,
	"device_type" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" integer NOT NULL,
	"fingerprint" text,
	"first_seen" timestamp DEFAULT now() NOT NULL,
	"last_seen" timestamp DEFAULT now() NOT NULL,
	"device" text,
	"browser" text,
	"browser_version" text,
	"os" text,
	"os_version" text,
	"country" text,
	"region" text,
	"city" text,
	"lat" real,
	"lng" real,
	"timezone" text,
	"language" text,
	"is_dev" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pageviews" ADD CONSTRAINT "pageviews_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_session_id_idx" ON "events" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_name_idx" ON "events" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_timestamp_idx" ON "events" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pageviews_session_id_idx" ON "pageviews" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pageviews_timestamp_idx" ON "pageviews" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pageviews_path_idx" ON "pageviews" USING btree ("path");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "projects_api_key_idx" ON "projects" USING btree ("api_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "projects_domain_idx" ON "projects" USING btree ("domain");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessions_started_at_idx" ON "sessions" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessions_ended_at_idx" ON "sessions" USING btree ("ended_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_project_id_idx" ON "users" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_fingerprint_idx" ON "users" USING btree ("fingerprint");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_last_seen_idx" ON "users" USING btree ("last_seen");