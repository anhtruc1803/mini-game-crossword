# Feature: Viewer

Public-facing viewer logic — snapshot queries, realtime subscription, view models.

## Data Flow
- Page load → `queries.ts` → full game snapshot from Supabase
- After load → `realtime.ts` subscribes to Supabase Realtime channel
- Updates → `hooks.ts` re-renders viewer components
- Disconnect → fallback polling

## Entry Points
- `view-model.ts` — ViewerSnapshot type (what the UI receives)
- `queries.ts` — initial data fetch
- `hooks.ts` — React hooks for client components
