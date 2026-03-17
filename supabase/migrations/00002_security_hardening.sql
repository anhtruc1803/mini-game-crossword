-- ============================================================
-- Security hardening and public viewer snapshot RPC
-- ============================================================

create table if not exists public.admin_users (
  user_id uuid primary key,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = p_user_id
  );
$$;

grant execute on function public.is_admin(uuid) to authenticated;

drop policy if exists "Public read games" on public.games;
drop policy if exists "Public read rows" on public.crossword_rows;
drop policy if exists "Admin all themes" on public.themes;
drop policy if exists "Admin all programs" on public.programs;
drop policy if exists "Admin all games" on public.games;
drop policy if exists "Admin all rows" on public.crossword_rows;
drop policy if exists "Admin insert events" on public.game_events;

create policy "Admin users can view themselves"
  on public.admin_users
  for select
  using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Admins manage admin users"
  on public.admin_users
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "Admins manage themes"
  on public.themes
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "Admins manage programs"
  on public.programs
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "Admins manage games"
  on public.games
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "Admins manage rows"
  on public.crossword_rows
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "Admins manage events"
  on public.game_events
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create unique index if not exists crossword_rows_game_order_uidx
  on public.crossword_rows(game_id, row_order);

create index if not exists games_program_created_desc_idx
  on public.games(program_id, created_at desc);

create or replace function public.get_public_viewer_snapshot(p_program_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_program_row public.programs%rowtype;
  v_theme_row public.themes%rowtype;
  v_game_row public.games%rowtype;
  v_rows jsonb := '[]'::jsonb;
  v_events jsonb := '[]'::jsonb;
  v_all_revealed boolean := false;
  v_final_keyword text := null;
begin
  select *
  into v_program_row
  from public.programs
  where slug = p_program_slug
  limit 1;

  if not found then
    return null;
  end if;

  if v_program_row.theme_id is not null then
    select *
    into v_theme_row
    from public.themes
    where id = v_program_row.theme_id;
  end if;

  select *
  into v_game_row
  from public.games
  where program_id = v_program_row.id
  order by created_at desc
  limit 1;

  if found then
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', r.id,
          'rowOrder', r.row_order,
          'clueText', r.clue_text,
          'answerText', case
            when r.row_status = 'answer_revealed' then r.answer_text
            else ''
          end,
          'answerLength', r.answer_length,
          'highlightedIndexes', case
            when r.row_status = 'answer_revealed' then r.highlighted_indexes_json
            else '[]'::jsonb
          end,
          'rowStatus', r.row_status
        )
        order by r.row_order
      ),
      '[]'::jsonb
    )
    into v_rows
    from public.crossword_rows r
    where r.game_id = v_game_row.id;

    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', e.id,
          'gameId', e.game_id,
          'eventType', e.event_type,
          'message', e.message,
          'payloadJson', e.payload_json,
          'createdAt', e.created_at,
          'createdBy', e.created_by
        )
        order by e.created_at desc
      ),
      '[]'::jsonb
    )
    into v_events
    from (
      select *
      from public.game_events
      where game_id = v_game_row.id
      order by created_at desc
      limit 30
    ) e;

    select not exists (
      select 1
      from public.crossword_rows
      where game_id = v_game_row.id
        and row_status <> 'answer_revealed'
    )
    into v_all_revealed;

    if v_game_row.game_status = 'ended' and v_all_revealed then
      v_final_keyword := v_game_row.final_keyword;
    end if;
  end if;

  return jsonb_build_object(
    'program', jsonb_build_object(
      'id', v_program_row.id,
      'slug', v_program_row.slug,
      'title', v_program_row.title,
      'description', v_program_row.description,
      'status', v_program_row.status,
      'startAt', v_program_row.start_at,
      'endAt', v_program_row.end_at,
      'themeId', v_program_row.theme_id,
      'createdAt', v_program_row.created_at,
      'updatedAt', v_program_row.updated_at
    ),
    'theme', case
      when v_program_row.theme_id is null then null
      else jsonb_build_object(
        'id', v_theme_row.id,
        'name', v_theme_row.name,
        'logoUrl', v_theme_row.logo_url,
        'bannerUrl', v_theme_row.banner_url,
        'desktopBgUrl', v_theme_row.desktop_bg_url,
        'mobileBgUrl', v_theme_row.mobile_bg_url,
        'primaryColor', v_theme_row.primary_color,
        'secondaryColor', v_theme_row.secondary_color,
        'accentColor', v_theme_row.accent_color,
        'overlayOpacity', v_theme_row.overlay_opacity,
        'fontHeading', v_theme_row.font_heading,
        'fontBody', v_theme_row.font_body,
        'customCssJson', v_theme_row.custom_css_json,
        'createdAt', v_theme_row.created_at,
        'updatedAt', v_theme_row.updated_at
      )
    end,
    'game', case
      when v_game_row.id is null then null
      else jsonb_build_object(
        'id', v_game_row.id,
        'title', v_game_row.title,
        'subtitle', v_game_row.subtitle,
        'gameStatus', v_game_row.game_status,
        'announcementText', v_game_row.announcement_text
      )
    end,
    'rows', v_rows,
    'activeRowIndex', case when v_game_row.id is null then null else v_game_row.current_row_index end,
    'events', v_events,
    'finalKeyword', v_final_keyword
  );
end;
$$;

grant execute on function public.get_public_viewer_snapshot(text) to anon, authenticated;
