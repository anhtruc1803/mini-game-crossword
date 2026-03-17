# Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────┐
│                    Next.js App                       │
│                                                     │
│  ┌──────────┐   ┌──────────┐   ┌────────────────┐  │
│  │  Viewer   │   │  Admin   │   │  API Routes    │  │
│  │  (public) │   │  (auth)  │   │  (health, etc) │  │
│  └─────┬─────┘   └─────┬────┘   └───────┬────────┘  │
│        │               │                │           │
│  ┌─────▼───────────────▼────────────────▼────────┐  │
│  │              Features Layer                    │  │
│  │  programs / themes / games / viewer / admin    │  │
│  │  (schemas, types, queries, mutations, service) │  │
│  └─────────────────────┬─────────────────────────┘  │
│                        │                            │
│  ┌─────────────────────▼─────────────────────────┐  │
│  │           Infrastructure (lib/)                │  │
│  │  supabase client/server, auth, utils, consts   │  │
│  └─────────────────────┬─────────────────────────┘  │
└────────────────────────┼────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │     Supabase        │
              │  Postgres + Auth    │
              │  Realtime + Storage │
              └─────────────────────┘
```

## App Router Structure

- `app/(public)/[programSlug]/` — Viewer page. Public, no auth required.
- `app/admin/` — Admin pages. Protected by middleware (redirect to login if no session).
- `app/api/` — API route handlers.

## Feature-Based Architecture

Code is organized by domain, not by technical layer:

```
features/
├── programs/   → Program CRUD, types, schemas
├── themes/     → Theme config, types, schemas
├── games/      → Core game logic, crossword rows, events
├── viewer/     → Public snapshot queries, realtime subscription
├── admin/      → Auth, permissions, server actions
└── assets/     → File upload, storage paths
```

Each feature contains:
- `types.ts` — Domain types (TypeScript interfaces)
- `schemas.ts` — Zod validation schemas
- `constants.ts` — Status enums and config (where applicable)
- `queries.ts` — Read operations (Supabase SELECT)
- `mutations.ts` — Write operations (Supabase INSERT/UPDATE/DELETE)
- `service.ts` — Business logic orchestration
- `mapper.ts` — DB row ↔ domain type mapping

## Service Layer

All business logic flows through service files. UI components and route handlers MUST NOT mutate data directly. The flow is:

```
UI / Server Action → service.ts → mutations.ts → Supabase
```

## Realtime Flow

```
Admin clicks button
  → Server Action (features/admin/actions.ts)
  → Service (features/games/service.ts)
  → Mutation (features/games/mutations.ts)
  → Supabase DB UPDATE
       │
       ├─ Supabase Realtime broadcasts change
       │    → Viewer: features/viewer/realtime.ts receives payload
       │    → useGameRealtime() reducer merges into state
       │    → React re-renders affected components
       │
       └─ Fallback: /api/viewer-snapshot polled every 5s
            → Full snapshot refresh if realtime misses
```

### Viewer page architecture

- **SSR**: `app/(public)/[programSlug]/page.tsx` (Server Component) loads initial snapshot
- **Client hydration**: `ViewerRealtimeWrapper` receives snapshot, subscribes to Realtime
- **State management**: `useReducer` with actions: GAME_UPDATED, ROW_UPDATED, EVENT_ADDED, FULL_REFRESH
- **Channels**: 3 Supabase Realtime listeners per game (games, crossword_rows, game_events)

## Asset / Theme Flow

1. Admin uploads image → features/assets/upload.ts → Supabase Storage
2. Public URL stored in themes table
3. Viewer loads theme → applies background, banner, colors via CSS variables
4. Desktop and mobile backgrounds are separate fields

## Testing

- **Unit tests**: `tests/unit/` — selectors, mappers, schemas, constants
- **Runner**: Vitest
- **Run**: `npm test`
