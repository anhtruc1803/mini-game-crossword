# Agent Guide

Guide for AI agents and new developers to navigate and modify this codebase.

## What This Repo Does

A realtime crossword mini-game display website used alongside Facebook/YouTube livestreams. The website does NOT stream video and does NOT accept user answers. Admin controls the game; viewers watch the board update in real time.

## Start Reading Here

1. `docs/DOMAIN_RULES.md` — understand the domain first
2. `features/games/constants.ts` — all status values and valid transitions
3. `features/games/types.ts` — core data types
4. `features/games/service.ts` — business logic entry points
5. `app/` — routing structure

## Data Flow

```
Admin UI (components/admin/)
  → Server Action (features/admin/actions.ts)
  → Service (features/games/service.ts)
  → Mutation (features/games/mutations.ts)
  → Supabase DB
       │
       ├─ Realtime → features/viewer/realtime.ts → useGameRealtime hook → re-render
       └─ Polling  → /api/viewer-snapshot → full refresh (fallback)
```

## Where to Change Things

### "I want to change the UI"
- Viewer components: `components/viewer/`
- Admin components: `components/admin/`
- Shared components: `components/shared/`
- Pages: `app/`

### "I want to change game logic"
- Status transitions: `features/games/constants.ts`
- Business rules: `features/games/service.ts`
- Domain rules doc: `docs/DOMAIN_RULES.md` (update if rules change!)

### "I want to change the database schema"
- Create a new migration in `supabase/migrations/`
- Update types in `features/*/types.ts`
- Update mappers in `features/*/mapper.ts`
- Update Zod schemas in `features/*/schemas.ts`
- Update `docs/DB_SCHEMA.md`

### "I want to add a new feature"
1. Create a new folder under `features/`
2. Add types, schemas, queries, mutations, service
3. Add UI components under `components/`
4. Add pages under `app/`
5. Update docs

### "I want to change the realtime behavior"
- Subscription: `features/viewer/realtime.ts`
- State reducer: `features/viewer/hooks.ts`
- Polling endpoint: `app/api/viewer-snapshot/route.ts`
- Polling interval: `lib/constants/app-config.ts`

## Source of Truth Files

These files define the canonical state of the system:

| Concern | File |
|---------|------|
| Game/Row statuses | `features/games/constants.ts` |
| Domain types | `features/*/types.ts` |
| Validation | `features/*/schemas.ts` |
| DB ↔ Domain mapping | `features/*/mapper.ts` |
| Business rules | `features/games/service.ts` |
| Admin server actions | `features/admin/actions.ts` |
| Routes | `lib/constants/routes.ts` |
| DB types (Supabase) | `lib/supabase/database.types.ts` |
| Viewer snapshot | `features/viewer/view-model.ts` |

## Files You Should NOT Edit Without Understanding

- `middleware.ts` — auth session refresh + admin route protection
- `lib/supabase/middleware.ts` — Supabase cookie handling
- `features/games/constants.ts` — changing transitions affects the entire game flow
- `features/games/service.ts` — all mutations flow through here

## Checklist Before Modifying Code

- [ ] Read `docs/DOMAIN_RULES.md`
- [ ] Check `features/games/constants.ts` for valid status transitions
- [ ] Verify changes don't bypass the service layer
- [ ] If changing schema: create migration + update types + update mappers
- [ ] If changing game flow: update `docs/DOMAIN_RULES.md`
- [ ] If adding routes: update `lib/constants/routes.ts`

## Anti-Patterns to Avoid

1. **NO** direct Supabase calls from UI components — go through service/query layers
2. **NO** magic strings for statuses — use constants from `features/games/constants.ts`
3. **NO** business logic in page components — put it in `service.ts`
4. **NO** circular imports — flow is: `app → features → lib`
5. **NO** skipping service layer for mutations — always go through `service.ts`
6. **NO** editing `database.types.ts` manually when you can regenerate it
7. **NO** importing `lib/supabase/client.ts` in server code (or `server.ts` in client code)

## Running Tests

```bash
npm test          # run all tests once
npm run test:watch  # watch mode
```

Tests live in `tests/unit/`. They cover:
- Game constants and status transitions
- Selectors (keyword hint builder, row counting)
- Mappers (DB → domain type conversion)
- Zod schemas (validation rules)
