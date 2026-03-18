# Database Schema

Source of truth:

- `prisma/schema.prisma`

Current database engine:

- SQLite via Prisma

Typical production URL:

```dotenv
DATABASE_URL="file:../data/app.db"
```

## Models

### `admin_users`

Stores local admin accounts.

Key fields:

- `id`
- `email`
- `username`
- `password_hash`
- `full_name`
- `role`
- `is_active`
- `created_at`
- `updated_at`

Notes:

- `email` is unique
- `username` is unique when present
- active admin check is enforced at runtime

### `themes`

Stores theme and branding settings.

Key fields:

- `name`
- `logo_url`
- `banner_url`
- `desktop_bg_url`
- `mobile_bg_url`
- `primary_color`
- `secondary_color`
- `accent_color`
- `overlay_opacity`
- `font_heading`
- `font_body`
- `custom_css_json`

### `programs`

Top-level livestream or event container.

Key fields:

- `slug`
- `title`
- `description`
- `image_url`
- `status`
- `start_at`
- `end_at`
- `theme_id`

Relations:

- belongs to zero or one theme
- owns many games

### `games`

Crossword game instance attached to a program.

Key fields:

- `program_id`
- `title`
- `subtitle`
- `final_keyword`
- `total_rows`
- `current_row_index`
- `game_status`
- `announcement_text`

Relations:

- belongs to one program
- has many rows
- has many game events

### `crossword_rows`

One clue + one answer line in a crossword game.

Key fields:

- `game_id`
- `row_order`
- `clue_text`
- `answer_text`
- `answer_length`
- `highlighted_indexes_json`
- `row_status`
- `note_text`

Important constraint:

- unique `(game_id, row_order)`

### `game_events`

Audit trail and viewer timeline.

Key fields:

- `game_id`
- `event_type`
- `message`
- `payload_json`
- `created_at`
- `created_by`

## Status values

### Program status

- `draft`
- `live`
- `ended`

### Game status

- `draft`
- `live`
- `paused`
- `ended`

### Row status

- `hidden`
- `clue_visible`
- `answer_revealed`

## Session note

There is no sessions table.

Admin sessions are:

- signed
- stateless
- stored in cookies
- verified against `SESSION_SECRET`

## Migration workflow

Local development:

```bash
npm exec prisma migrate dev --name your_change_name
```

Production:

```bash
npm exec prisma migrate deploy
```

## Schema update checklist

When schema changes:

1. update Prisma schema
2. add migration
3. update feature types
4. update mappers and validation
5. update docs
6. run lint, tests, and build
