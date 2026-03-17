# Database Schema

> Schema will be fully defined in Phase 2 with Supabase migrations.

## Tables (planned)

### programs
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, default gen_random_uuid() |
| slug | text | unique, used in public URL |
| title | text | not null |
| description | text | nullable |
| status | text | 'draft' / 'live' / 'ended' |
| start_at | timestamptz | nullable |
| end_at | timestamptz | nullable |
| theme_id | uuid | FK → themes.id, nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

### themes
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | not null |
| logo_url | text | nullable |
| banner_url | text | nullable |
| desktop_bg_url | text | nullable |
| mobile_bg_url | text | nullable |
| primary_color | text | default '#6366f1' |
| secondary_color | text | default '#8b5cf6' |
| accent_color | text | default '#f59e0b' |
| overlay_opacity | real | default 0.5 |
| font_heading | text | nullable |
| font_body | text | nullable |
| custom_css_json | jsonb | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

### games
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| program_id | uuid | FK → programs.id |
| title | text | not null |
| subtitle | text | nullable |
| final_keyword | text | nullable |
| total_rows | int | default 0 |
| current_row_index | int | nullable |
| game_status | text | 'draft' / 'live' / 'paused' / 'ended' |
| announcement_text | text | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

### crossword_rows
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| game_id | uuid | FK → games.id |
| row_order | int | position in crossword |
| clue_text | text | the question/clue |
| answer_text | text | the answer |
| answer_length | int | cached length of answer_text |
| highlighted_indexes_json | jsonb | array of 0-based indexes |
| row_status | text | 'hidden' / 'clue_visible' / 'answer_revealed' |
| note_text | text | nullable, admin note |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

### game_events
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| game_id | uuid | FK → games.id |
| event_type | text | see EVENT_TYPES in constants.ts |
| message | text | human-readable description |
| payload_json | jsonb | nullable, extra data |
| created_at | timestamptz | default now() |
| created_by | uuid | FK → auth.users.id, nullable |

## Indexes (planned)
- `programs.slug` — unique index
- `games.program_id` — for lookup by program
- `crossword_rows.game_id` + `row_order` — for ordered retrieval
- `game_events.game_id` + `created_at` — for event log queries

## RLS Policies (planned)
- `programs`: public read, admin write
- `themes`: public read, admin write
- `games`: public read, admin write
- `crossword_rows`: public read (filtered by row_status), admin write
- `game_events`: public read, admin insert
