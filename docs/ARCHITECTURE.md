# Architecture

## High-level overview

```text
Next.js App
  |- Public viewer routes
  |- Admin routes
  |- API routes
  |
  |- Features layer
  |    |- admin
  |    |- programs
  |    |- themes
  |    |- games
  |    |- viewer
  |    |- assets
  |
  |- Infrastructure layer
       |- Prisma client
       |- signed session helpers
       |- rate limiting
       |- route constants
       |- shared utilities

Persistence
  |- SQLite via Prisma
  |- local filesystem asset storage
```

## Route structure

- `/`
  Landing page.
- `/{programSlug}`
  Public viewer page.
- `/admin/login`
  Admin sign-in page.
- `/admin/programs`
  Program list.
- `/admin/programs/new`
  Program creation page.
- `/admin/programs/{programId}`
  Program detail page.
- `/admin/programs/{programId}/game`
  Game control page.
- `/admin/programs/{programId}/rows`
  Row management page.
- `/admin/programs/{programId}/theme`
  Theme page.
- `/api/health`
  Health check.
- `/api/viewer-snapshot`
  Public polling endpoint for viewer state.

## Layering rules

The intended dependency direction is:

```text
app -> features -> lib
```

Feature modules can depend on `lib/`, but `lib/` should not depend on feature modules unless the abstraction is intentionally shared.

## Feature module pattern

Each feature folder is organized around one domain:

- `types.ts`
  Domain-facing TypeScript types.
- `schemas.ts`
  Input validation rules.
- `mapper.ts`
  Prisma row to domain mapping.
- `queries.ts`
  Read-only data access.
- `mutations.ts`
  Write-only data access.
- `service.ts`
  Business rules and orchestration.

Not every feature has every file, but this is the default shape.

## Auth architecture

Admin auth is custom and local to this app.

### Sign-in flow

1. User submits credentials on `/admin/login`.
2. `features/admin/auth.ts` validates input and rate limits attempts.
3. Credentials are checked against `admin_users` in SQLite.
4. A signed cookie token is created in `lib/auth/session-token.ts`.
5. `lib/auth/session.ts` stores the token as an HTTP-only cookie.

### Request protection

- `proxy.ts` rejects invalid or missing cookies before protected admin routes.
- `app/admin/programs/layout.tsx` performs a server-side admin check for all `/admin/programs/*` pages.
- Server actions call `requireAdmin()` again before mutating data.

This is deliberate defense in depth.

## Viewer architecture

The public viewer is snapshot-based.

### Initial load

1. `app/(public)/[programSlug]/page.tsx` loads a server-side snapshot.
2. `features/viewer/queries.ts` builds a sanitized public view model.
3. The page renders theme, game state, rows, and recent events.

### Live updates

1. `features/viewer/hooks.ts` polls `/api/viewer-snapshot`.
2. `/api/viewer-snapshot` validates and rate limits requests.
3. `features/viewer/queries.ts` returns a sanitized snapshot again.
4. Client state replaces the previous snapshot.

There is no optimistic merge reducer anymore.
The viewer uses whole-snapshot replacement.

## Data protection model

The public snapshot intentionally strips sensitive state.

- Unrevealed row answers are returned as `null`.
- The final keyword is only returned once the game is ended.
- Admin-only data is never fetched from the public route tree.

This server-side sanitization is a key part of the architecture.

## Persistence model

### Database

- Prisma client: `lib/db/prisma.ts`
- Schema: `prisma/schema.prisma`
- Default database: SQLite file

SQLite is appropriate for a single Ubuntu server deployment and low-to-moderate write volume.
If the project grows into a multi-instance deployment, the first major architectural migration should be moving Prisma to PostgreSQL.

### Assets

- Upload handling: `features/assets/upload.ts`
- Asset paths: `features/assets/paths.ts`
- Asset service: `features/assets/service.ts`

Assets are stored on local disk under `public/uploads/...`.
That means they are publicly reachable once saved.

## Rate limiting

Rate limiting lives in `lib/security/rate-limit.ts`.

- Auth attempts are rate limited by IP and email.
- Admin mutations are rate limited by admin ID and IP.
- Viewer snapshot polling is rate limited by IP and slug.

If Upstash Redis env vars are present, the app uses Redis-backed counters.
Otherwise it falls back to in-memory counters.

## Operational assumptions

The current codebase assumes:

- a single app instance is acceptable
- viewer updates are polling-based
- local filesystem writes are allowed
- SQLite file access is local to the app process

Those assumptions should stay documented because they drive many implementation choices in the repo.
