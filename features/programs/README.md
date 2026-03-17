# Feature: Programs

Manages program/event entities — the top-level container for games.

## Data Flow
- Admin creates/edits program via `service.ts` → `mutations.ts` → Supabase
- Viewer reads program by slug via `queries.ts`
- DB rows mapped to domain types via `mapper.ts`

## Entry Points
- `service.ts` — business logic
- `queries.ts` — read operations
- `schemas.ts` — Zod validation for inputs
