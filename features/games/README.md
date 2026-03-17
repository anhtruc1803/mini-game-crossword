# Feature: Games

Core domain — crossword game logic, rows, events.

**This is the most important feature.** Read `docs/DOMAIN_RULES.md` before modifying.

## Data Flow
- Admin controls game via `service.ts` → `mutations.ts` → Supabase
- State changes trigger Supabase Realtime → viewer updates
- All status transitions enforced in `constants.ts`

## Key Files
- `constants.ts` — status values + valid transitions (source of truth)
- `types.ts` — Game, CrosswordRow, GameEvent types
- `service.ts` — all game mutations go through here
- `selectors.ts` — derived data (final keyword hint, counts)
- `mapper.ts` — DB ↔ domain type conversion

## Do NOT
- Bypass `service.ts` for game state changes
- Use string literals for statuses (use constants)
- Add new statuses without updating transitions + docs
