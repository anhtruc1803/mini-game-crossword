# CLAUDE.md — Project Instructions for AI Agents

## Project

Mini Game Ô Chữ — realtime crossword game display website. Viewers watch; admin controls.

## Stack

Next.js 16 (App Router) + TypeScript (strict) + Tailwind CSS v4 + Supabase + Zod

## Architecture

Feature-based: `features/{programs,themes,games,viewer,admin,assets}/`
Each feature: types → schemas → queries → mutations → service → mapper

## Key Rules

- All game state mutations go through `features/games/service.ts`
- Use constants from `features/games/constants.ts`, never magic strings
- Import direction: `app → components → features → lib` (no cycles)
- DB changes need: migration + types + mapper + schema updates
- Admin server actions are in `features/admin/actions.ts`
- Viewer uses SSR snapshot + Supabase Realtime + polling fallback

## Commands

```bash
npm run dev       # dev server
npm run build     # production build
npm test          # run unit tests
npm run lint      # eslint
```

## Before Editing

1. Read `docs/DOMAIN_RULES.md` for business rules
2. Check `features/games/constants.ts` for valid status transitions
3. Run `npm test` after changes to verify nothing breaks
