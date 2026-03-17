-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "themes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "logo_url" TEXT,
    "banner_url" TEXT,
    "desktop_bg_url" TEXT,
    "mobile_bg_url" TEXT,
    "primary_color" TEXT NOT NULL DEFAULT '#6366f1',
    "secondary_color" TEXT NOT NULL DEFAULT '#8b5cf6',
    "accent_color" TEXT NOT NULL DEFAULT '#f59e0b',
    "overlay_opacity" REAL NOT NULL DEFAULT 0.5,
    "font_heading" TEXT,
    "font_body" TEXT,
    "custom_css_json" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "programs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "start_at" DATETIME,
    "end_at" DATETIME,
    "theme_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "programs_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "themes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "program_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "final_keyword" TEXT,
    "total_rows" INTEGER NOT NULL DEFAULT 0,
    "current_row_index" INTEGER,
    "game_status" TEXT NOT NULL DEFAULT 'draft',
    "announcement_text" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "games_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "crossword_rows" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "game_id" TEXT NOT NULL,
    "row_order" INTEGER NOT NULL,
    "clue_text" TEXT NOT NULL,
    "answer_text" TEXT NOT NULL,
    "answer_length" INTEGER NOT NULL,
    "highlighted_indexes_json" TEXT NOT NULL DEFAULT '[]',
    "row_status" TEXT NOT NULL DEFAULT 'hidden',
    "note_text" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "crossword_rows_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "game_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "game_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "payload_json" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    CONSTRAINT "game_events_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_username_key" ON "admin_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "programs_slug_key" ON "programs"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "crossword_rows_game_id_row_order_key" ON "crossword_rows"("game_id", "row_order");
