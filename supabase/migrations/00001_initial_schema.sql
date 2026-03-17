-- ============================================================
-- Mini Game Crossword — Initial Schema
-- ============================================================

-- 1) Themes
create table public.themes (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  logo_url       text,
  banner_url     text,
  desktop_bg_url text,
  mobile_bg_url  text,
  primary_color  text not null default '#6366f1',
  secondary_color text not null default '#8b5cf6',
  accent_color   text not null default '#f59e0b',
  overlay_opacity real not null default 0.5,
  font_heading   text,
  font_body      text,
  custom_css_json jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- 2) Programs
create table public.programs (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null,
  title       text not null,
  description text,
  status      text not null default 'draft'
                check (status in ('draft','live','ended')),
  start_at    timestamptz,
  end_at      timestamptz,
  theme_id    uuid references public.themes(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create unique index programs_slug_idx on public.programs(slug);

-- 3) Games
create table public.games (
  id                uuid primary key default gen_random_uuid(),
  program_id        uuid not null references public.programs(id) on delete cascade,
  title             text not null,
  subtitle          text,
  final_keyword     text,
  total_rows        int not null default 0,
  current_row_index int,
  game_status       text not null default 'draft'
                      check (game_status in ('draft','live','paused','ended')),
  announcement_text text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index games_program_id_idx on public.games(program_id);

-- 4) Crossword rows
create table public.crossword_rows (
  id                       uuid primary key default gen_random_uuid(),
  game_id                  uuid not null references public.games(id) on delete cascade,
  row_order                int not null,
  clue_text                text not null,
  answer_text              text not null,
  answer_length            int not null,
  highlighted_indexes_json jsonb not null default '[]'::jsonb,
  row_status               text not null default 'hidden'
                             check (row_status in ('hidden','clue_visible','answer_revealed')),
  note_text                text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index crossword_rows_game_order_idx on public.crossword_rows(game_id, row_order);

-- 5) Game events
create table public.game_events (
  id           uuid primary key default gen_random_uuid(),
  game_id      uuid not null references public.games(id) on delete cascade,
  event_type   text not null,
  message      text not null,
  payload_json jsonb,
  created_at   timestamptz not null default now(),
  created_by   uuid
);

create index game_events_game_created_idx on public.game_events(game_id, created_at desc);

-- ============================================================
-- RLS Policies
-- ============================================================

alter table public.themes enable row level security;
alter table public.programs enable row level security;
alter table public.games enable row level security;
alter table public.crossword_rows enable row level security;
alter table public.game_events enable row level security;

-- Public read for all tables (viewer needs to read)
create policy "Public read themes"       on public.themes       for select using (true);
create policy "Public read programs"     on public.programs     for select using (true);
create policy "Public read games"        on public.games        for select using (true);
create policy "Public read rows"         on public.crossword_rows for select using (true);
create policy "Public read events"       on public.game_events  for select using (true);

-- Authenticated users (admin) can do everything
create policy "Admin all themes"         on public.themes       for all using (auth.role() = 'authenticated');
create policy "Admin all programs"       on public.programs     for all using (auth.role() = 'authenticated');
create policy "Admin all games"          on public.games        for all using (auth.role() = 'authenticated');
create policy "Admin all rows"           on public.crossword_rows for all using (auth.role() = 'authenticated');
create policy "Admin insert events"      on public.game_events  for insert with check (auth.role() = 'authenticated');

-- ============================================================
-- updated_at trigger
-- ============================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger themes_updated_at       before update on public.themes       for each row execute function public.set_updated_at();
create trigger programs_updated_at     before update on public.programs     for each row execute function public.set_updated_at();
create trigger games_updated_at        before update on public.games        for each row execute function public.set_updated_at();
create trigger crossword_rows_updated_at before update on public.crossword_rows for each row execute function public.set_updated_at();

-- ============================================================
-- Enable Realtime for games and crossword_rows
-- ============================================================

alter publication supabase_realtime add table public.games;
alter publication supabase_realtime add table public.crossword_rows;
alter publication supabase_realtime add table public.game_events;
