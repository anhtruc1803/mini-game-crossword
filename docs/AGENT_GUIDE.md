# Agent Guide

Guide for AI agents and new developers working in this repository.

## What this repo is now

This repository is a Next.js crossword companion app with:

- Prisma + SQLite
- signed cookie admin auth
- local media uploads
- polling-based viewer updates
- Birthday Glass viewer UI
- dark / light mode

Older Supabase-specific docs are no longer relevant.

## Read these first

1. `docs/DOMAIN_RULES.md`
2. `docs/ARCHITECTURE.md`
3. `prisma/schema.prisma`
4. `features/games/service.ts`
5. `features/viewer/queries.ts`
6. `features/admin/actions.ts`
7. `lib/auth/session-token.ts`
8. `proxy.ts`

## Runtime flows

### Admin

```text
Page / Form
-> server action
-> service
-> mutation
-> Prisma
-> SQLite
```

### Viewer

```text
SSR snapshot
-> sanitized view model
-> polling refresh
-> /api/viewer-snapshot
-> whole snapshot replace
```

## Important source-of-truth files

| Concern | File |
| --- | --- |
| Database schema | `prisma/schema.prisma` |
| Game rules | `features/games/service.ts` |
| Game constants | `features/games/constants.ts` |
| Public viewer payload | `features/viewer/view-model.ts` |
| Snapshot sanitization | `features/viewer/queries.ts` |
| Admin auth | `features/admin/auth.ts` |
| Session signing | `lib/auth/session-token.ts` |
| Route protection | `proxy.ts` |
| Upload restrictions | `features/assets/upload.ts` |
| Global visual tokens | `app/globals.css` |

## Rules to follow

- Reads can go through `queries.ts`
- Writes must go through `service.ts`
- Do not call Prisma directly from UI components
- Do not leak hidden answers into public routes
- Do not bypass `requireAdmin()` for mutations
- Keep docs updated when rules, routes, or schema change

## Files that need extra care

- `features/games/service.ts`
- `features/viewer/queries.ts`
- `features/admin/actions.ts`
- `lib/auth/session-token.ts`
- `proxy.ts`
- `prisma/schema.prisma`

## Schema change checklist

1. Update `prisma/schema.prisma`
2. Create migration
3. Update types, mappers, schemas, services
4. Update docs
5. Run:

```bash
npm run lint
npm test
npm run build
```

## UI change checklist

If you change viewer or admin UI:

1. Update `docs/UI_STATES.md`
2. Update `README.md` if the user-facing behavior changed
3. Update `docs/USAGE.md` if operator flow changed

## Anti-patterns to avoid

- adding hidden-answer logic only in the client
- mutating data from pages/components
- introducing in-memory admin auth state
- storing uploads outside approved paths
- reducing polling interval without considering SQLite load
