# Feature: Admin

Admin authentication, permissions, and server actions.

## Data Flow
- Login → `auth.ts` → Supabase Auth
- Admin actions → `actions.ts` (server actions) → feature services
- Route protection → `middleware.ts` checks session

## Entry Points
- `auth.ts` — sign in/out
- `permissions.ts` — authorization checks
- `actions.ts` — Next.js server actions
