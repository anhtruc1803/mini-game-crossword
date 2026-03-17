# Feature: Themes

Visual configuration for programs — colors, backgrounds, logos, fonts.

## Data Flow
- Admin configures theme via `service.ts` → `mutations.ts` → Supabase
- Viewer loads theme alongside program snapshot
- Theme values applied as CSS variables on the viewer page

## Entry Points
- `service.ts` — business logic
- `schemas.ts` — Zod validation
