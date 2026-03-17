# Agent Guide

Guide for AI agents and new developers working in this repository.

## What this repo does

This project is a livestream companion website for a crossword mini-game.

- Viewers open `/{programSlug}` to watch the board state.
- Admins log in at `/admin/login` and control the game from `/admin/programs/...`.
- The site does not stream video and does not collect viewer answers.

## Current stack

- Next.js 16 App Router
- React 19
- Prisma
- SQLite
- Signed HTTP-only admin session cookies
- Local filesystem storage for uploaded assets
- Zod for validation
- Vitest for unit tests

## Read these files first

1. `docs/DOMAIN_RULES.md`
2. `features/games/constants.ts`
3. `features/games/service.ts`
4. `prisma/schema.prisma`
5. `lib/auth/session.ts`
6. `lib/auth/session-token.ts`
7. `proxy.ts`

## Main runtime flow

```text
Admin UI
  -> Server Action (features/admin/actions.ts)
  -> Service (features/*/service.ts)
  -> Mutation (features/*/mutations.ts)
  -> Prisma
  -> SQLite

Viewer Page
  -> SSR snapshot (features/viewer/queries.ts)
  -> Client polling (features/viewer/hooks.ts)
  -> /api/viewer-snapshot
```

There is no WebSocket or Supabase Realtime layer anymore.
Viewer updates are polling-based.

## Where to change things

### Change game logic

- `features/games/constants.ts`
- `features/games/service.ts`
- `docs/DOMAIN_RULES.md`

### Change admin auth

- `features/admin/auth.ts`
- `features/admin/permissions.ts`
- `lib/auth/session.ts`
- `lib/auth/session-token.ts`
- `proxy.ts`

### Change public viewer behavior

- `features/viewer/queries.ts`
- `features/viewer/view-model.ts`
- `features/viewer/hooks.ts`
- `components/viewer/`

### Change database schema

- `prisma/schema.prisma`
- `prisma/migrations/`
- `features/*/types.ts`
- `features/*/mapper.ts`
- `features/*/schemas.ts`
- `docs/DB_SCHEMA.md`

### Change asset handling

- `features/assets/upload.ts`
- `features/assets/service.ts`
- `features/assets/paths.ts`
- `features/themes/schemas.ts`

## Source of truth files

| Concern | File |
| --- | --- |
| Routes | `lib/constants/routes.ts` |
| Program statuses | `features/programs/types.ts` and `features/programs/service.ts` |
| Game and row statuses | `features/games/constants.ts` |
| Business rules | `features/games/service.ts` |
| Validation | `features/*/schemas.ts` |
| DB schema | `prisma/schema.prisma` |
| Session format | `lib/auth/session-token.ts` |
| Public viewer snapshot contract | `features/viewer/view-model.ts` |

## Important guardrails

- Reads may go through `queries.ts`.
- Writes must go through `service.ts`.
- UI components should not call Prisma directly.
- Admin pages under `app/admin/programs/` are protected by both `proxy.ts` and `app/admin/programs/layout.tsx`.
- Public viewer snapshots must never leak unrevealed answers or the final keyword early.

## Files to treat carefully

- `features/games/service.ts`
- `features/admin/actions.ts`
- `lib/auth/session-token.ts`
- `proxy.ts`
- `prisma/schema.prisma`

Small mistakes in these files tend to create security or state-transition regressions.

## Schema change checklist

1. Update `prisma/schema.prisma`.
2. Create a new migration under `prisma/migrations/`.
3. Update domain types, mappers, and validation.
4. Update docs in `docs/DB_SCHEMA.md` and any rule changes in `docs/DOMAIN_RULES.md`.
5. Run `npm test`, `npm run lint`, and `npm run build`.

## Anti-patterns to avoid

1. Do not put business logic in page components.
2. Do not bypass `service.ts` for mutations.
3. Do not reintroduce hidden-answer leaks in viewer payloads.
4. Do not store secrets or runtime SQLite files in Git.
5. Do not assume signed cookies are enough without checking admin state in the database.
6. Do not add polling-heavy features without considering SQLite load.

## Useful commands

```bash
npm test
npm run lint
npm run build
npm exec prisma generate
npm exec prisma migrate deploy
npm exec prisma db seed
```
