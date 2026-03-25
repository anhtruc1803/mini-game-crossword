CREATE TABLE "viewer_sessions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "program_id" TEXT NOT NULL,
  "session_id" TEXT NOT NULL,
  "page_views" INTEGER NOT NULL DEFAULT 1,
  "last_path" TEXT,
  "user_agent" TEXT,
  "ip_hash" TEXT,
  "first_seen_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "last_seen_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "viewer_sessions_program_id_fkey"
    FOREIGN KEY ("program_id") REFERENCES "programs" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "viewer_sessions_program_id_session_id_key"
  ON "viewer_sessions"("program_id", "session_id");

CREATE INDEX "viewer_sessions_program_id_last_seen_at_idx"
  ON "viewer_sessions"("program_id", "last_seen_at");

CREATE INDEX "viewer_sessions_program_id_first_seen_at_idx"
  ON "viewer_sessions"("program_id", "first_seen_at");
