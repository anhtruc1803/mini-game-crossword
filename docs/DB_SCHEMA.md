# Database Schema

The database source of truth is `prisma/schema.prisma`.
This document summarizes the current schema in domain language.

## Engine

- ORM: Prisma
- Database: SQLite
- Connection string source: `DATABASE_URL`

The default local pattern is:

```dotenv
DATABASE_URL="file:../data/app.db"
```

Because the Prisma schema lives in `prisma/`, the `../data/app.db` path resolves to `data/app.db` at the project root.

## Models

### admin_users

Stores local admin accounts for the custom sign-in flow.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | primary key, UUID |
| `email` | `String` | unique |
| `username` | `String?` | unique, optional |
| `password_hash` | `String` | bcrypt hash |
| `full_name` | `String?` | optional |
| `role` | `String` | currently expected to be `admin` |
| `is_active` | `Boolean` | soft-disable flag |
| `created_at` | `DateTime` | default now |
| `updated_at` | `DateTime` | auto-updated |

### themes

Theme and branding configuration for a program.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | primary key, UUID |
| `name` | `String` | required |
| `logo_url` | `String?` | optional |
| `banner_url` | `String?` | optional |
| `desktop_bg_url` | `String?` | optional |
| `mobile_bg_url` | `String?` | optional |
| `primary_color` | `String` | hex color |
| `secondary_color` | `String` | hex color |
| `accent_color` | `String` | hex color |
| `overlay_opacity` | `Float` | 0 to 1 |
| `font_heading` | `String?` | optional |
| `font_body` | `String?` | optional |
| `custom_css_json` | `String?` | JSON string, optional |
| `created_at` | `DateTime` | default now |
| `updated_at` | `DateTime` | auto-updated |

### programs

Top-level event or show container.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | primary key, UUID |
| `slug` | `String` | unique, used in public URL |
| `title` | `String` | required |
| `description` | `String?` | optional |
| `status` | `String` | `draft`, `live`, `ended` |
| `start_at` | `DateTime?` | optional |
| `end_at` | `DateTime?` | optional |
| `theme_id` | `String?` | nullable FK to `themes` |
| `created_at` | `DateTime` | default now |
| `updated_at` | `DateTime` | auto-updated |

Relations:

- one program optionally has one active linked theme
- one program can have many games

### games

Crossword game state attached to a program.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | primary key, UUID |
| `program_id` | `String` | FK to `programs` |
| `title` | `String` | required |
| `subtitle` | `String?` | optional |
| `final_keyword` | `String?` | optional |
| `total_rows` | `Int` | cached row count |
| `current_row_index` | `Int?` | nullable active pointer |
| `game_status` | `String` | `draft`, `live`, `paused`, `ended` |
| `announcement_text` | `String?` | optional |
| `created_at` | `DateTime` | default now |
| `updated_at` | `DateTime` | auto-updated |

Relations:

- one game belongs to one program
- one game has many crossword rows
- one game has many game events

### crossword_rows

Question and answer rows for a game board.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | primary key, UUID |
| `game_id` | `String` | FK to `games` |
| `row_order` | `Int` | 0-based row order |
| `clue_text` | `String` | required |
| `answer_text` | `String` | required, uppercase via validation |
| `answer_length` | `Int` | cached answer length |
| `highlighted_indexes_json` | `String` | JSON array of indexes |
| `row_status` | `String` | `hidden`, `clue_visible`, `answer_revealed` |
| `note_text` | `String?` | admin note |
| `created_at` | `DateTime` | default now |
| `updated_at` | `DateTime` | auto-updated |

Important constraint:

- unique `(game_id, row_order)`

### game_events

Human-readable audit trail for game actions.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | primary key, UUID |
| `game_id` | `String` | FK to `games` |
| `event_type` | `String` | see `EVENT_TYPES` |
| `message` | `String` | display-ready event text |
| `payload_json` | `String?` | optional JSON string |
| `created_at` | `DateTime` | default now |
| `created_by` | `String?` | optional actor ID |

## Constraints and relationships

- `programs.slug` is unique
- `admin_users.email` is unique
- `admin_users.username` is unique when present
- `crossword_rows(game_id, row_order)` is unique
- deleting a program cascades to its games
- deleting a game cascades to its rows and events
- deleting a theme sets `program.theme_id` to `null`

## Session storage note

There is no `sessions` table.
Admin sessions are stateless signed cookies verified from `SESSION_SECRET`.

That means:

- session invalidation mainly happens by deleting the cookie
- admin authorization is still checked against `admin_users` on the server
- disabling an admin user in the database still blocks protected actions and pages

## Migration workflow

Schema changes should use Prisma migrations.

Typical flow:

```bash
npm exec prisma migrate dev --name your_change_name
```

Production deploy flow:

```bash
npm exec prisma migrate deploy
```
