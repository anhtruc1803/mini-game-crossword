CREATE TABLE "viewer_pageviews" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "program_id" TEXT NOT NULL,
  "session_id" TEXT NOT NULL,
  "path" TEXT,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "viewer_pageviews_program_id_fkey"
    FOREIGN KEY ("program_id") REFERENCES "programs" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "viewer_pageviews_program_id_created_at_idx"
  ON "viewer_pageviews"("program_id", "created_at");
