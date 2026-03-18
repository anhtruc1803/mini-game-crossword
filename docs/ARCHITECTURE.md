# Architecture

## Overview

```text
Next.js App
  |- Public viewer routes
  |- Admin routes
  |- API routes
  |- Media route
  |
  |- features/
  |    |- admin
  |    |- assets
  |    |- games
  |    |- programs
  |    |- themes
  |    |- viewer
  |
  |- lib/
       |- auth
       |- db
       |- security
       |- i18n
       |- constants

Persistence
  |- SQLite via Prisma
  |- local filesystem uploads
```

## Route map

- `/`
  Landing page
- `/{programSlug}`
  Public viewer
- `/admin/login`
  Admin sign-in
- `/admin/programs`
  Program list
- `/admin/programs/new`
  Program creation
- `/admin/programs/{programId}`
  Program detail
- `/admin/programs/{programId}/rows`
  Row management
- `/admin/programs/{programId}/game`
  Game control
- `/admin/programs/{programId}/theme`
  Theme management
- `/api/viewer-snapshot`
  Public polling endpoint
- `/api/health`
  Health endpoint
- `/media/{bucket}/{path}`
  Local file serving route

## Layering

Dependency direction:

```text
app -> features -> lib
```

## Feature module shape

Typical pattern:

- `types.ts`
- `schemas.ts`
- `mapper.ts`
- `queries.ts`
- `mutations.ts`
- `service.ts`

`service.ts` is the business-logic boundary.

## Admin auth architecture

### Sign-in

1. Login form posts credentials
2. `features/admin/auth.ts` validates input
3. Credentials are checked against `admin_users`
4. `lib/auth/session-token.ts` signs a stateless token
5. `lib/auth/session.ts` stores it in an HTTP-only cookie

### Protection layers

- `proxy.ts` blocks missing or invalid cookies
- `app/admin/programs/layout.tsx` protects server rendering
- server actions call `requireAdmin()` again

## Viewer architecture

### Initial render

1. `app/(public)/[programSlug]/page.tsx` loads a snapshot
2. `features/viewer/queries.ts` sanitizes game data
3. Viewer renders hero, question slider, board, keyword hint, and updates

### Live refresh

1. `features/viewer/hooks.ts` polls `/api/viewer-snapshot`
2. server returns a complete sanitized snapshot
3. client replaces the previous snapshot

The viewer is intentionally whole-snapshot based.

## Public data protection

Public viewer snapshots:

- hide unrevealed answers
- hide final keyword until game end
- expose only the viewer-facing game model

This is server-side, not UI-only.

## Persistence

### Database

- Prisma client in `lib/db/prisma.ts`
- SQLite database from `DATABASE_URL`
- schema in `prisma/schema.prisma`

### Assets

- uploads validated in `features/assets/upload.ts`
- files stored under `public/uploads` and mirrored into `data/uploads`
- URLs served from `/media/...`

## Rate limiting

`lib/security/rate-limit.ts` covers:

- admin sign-in
- admin mutations
- viewer snapshot polling

Backends:

- Upstash Redis if configured
- in-memory fallback otherwise

## Frontend design system

Current frontend direction:

- Birthday Glass visual language
- iNET branding accents
- dark / light mode
- subtle live badge pulse
- soft hover aura
- birthday balloons, sparkles, and periodic confetti during live celebratory sessions

## Current deployment assumption

The codebase is optimized for:

- one Ubuntu server
- one app process
- local writable disk
- SQLite

If the project grows beyond that, the next architectural move should be PostgreSQL plus shared object storage.
