# Mini Game O Chu

Livestream companion website for a crossword mini-game.

The site has two main surfaces:

- Public viewer at `/{programSlug}`
- Admin console at `/admin/...`

The viewer does not stream video and does not accept player submissions. It shows the current crossword board, clue progression, final keyword hint, announcements, and recent game events while the admin controls the flow.

## Current stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Prisma
- SQLite
- Signed HTTP-only cookie sessions for admin auth
- Local media storage under `public/uploads` and `data/uploads`
- Zod validation
- Vitest

## Main features

- Program management with public slug and image
- Crossword game creation and row management
- Admin controls for start, pause, resume, answer reveal, next question, previous question, reset, and end
- Public viewer with Birthday Glass UI
- Dark / light mode toggle for both viewer and admin
- Public snapshot sanitization so unrevealed answers are never leaked
- Local image uploads through `/media/...`
- Rate limiting for auth, viewer snapshot polling, and admin mutations

## Quick start

### Requirements

- Node.js 22+
- npm

### Install

```bash
npm install
cp .env.example .env.local
```

Recommended local env:

```dotenv
DATABASE_URL="file:./dev.db"
SESSION_SECRET="mini-game-local-dev-secret"
SEED_ADMIN_EMAIL="admin@example.com"
SEED_ADMIN_PASSWORD="change-me-before-seeding"
```

### Prepare database

```bash
npm exec prisma generate
npm exec prisma migrate deploy
npm exec prisma db seed
```

### Run

```bash
npm run dev
```

Open:

- `http://localhost:3000/`
- `http://localhost:3000/admin/login`

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start local dev server |
| `npm run build` | Production build |
| `npm run start` | Start built app |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest |
| `npm exec prisma generate` | Generate Prisma client |
| `npm exec prisma migrate deploy` | Apply migrations |
| `npm exec prisma db seed` | Seed admin/demo data |

## Project structure

```text
app/
  (public)/              public viewer routes
  admin/                 admin routes
  api/                   route handlers
  media/                 local media proxy route

components/
  admin/                 admin UI
  viewer/                viewer UI
  shared/                shared UI

features/
  admin/                 auth, permissions, server actions
  assets/                upload and path helpers
  games/                 game rules and orchestration
  programs/              program CRUD
  themes/                theme CRUD
  viewer/                sanitized public snapshot and polling

lib/
  auth/                  signed session helpers
  db/                    Prisma client
  security/              errors, rate limit, request helpers
  constants/             routes and config
  i18n/                  locale provider

prisma/
  schema.prisma          source of truth schema
  migrations/            Prisma migrations
  seed.ts                optional bootstrap data

docs/
  *.md                   project documentation
```

## How the app works

### Viewer flow

1. `app/(public)/[programSlug]/page.tsx` renders a server snapshot.
2. `features/viewer/queries.ts` sanitizes the public payload.
3. `features/viewer/hooks.ts` polls `/api/viewer-snapshot`.
4. The viewer updates the whole snapshot client-side.

### Admin flow

1. Admin signs in on `/admin/login`.
2. `features/admin/auth.ts` verifies credentials and creates a signed cookie.
3. `proxy.ts` blocks invalid admin requests early.
4. Server actions in `features/admin/actions.ts` call services in `features/*/service.ts`.

## Security model

- Public snapshots never expose hidden answers
- Final keyword is only returned when the game has ended
- Admin routes are protected by both `proxy.ts` and server-side admin checks
- Admin mutations are rate limited
- Auth attempts are rate limited
- Uploads are restricted by type and size

## Usage guide

See:

- [Usage Guide](docs/USAGE.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Domain Rules](docs/DOMAIN_RULES.md)
- [Database Schema](docs/DB_SCHEMA.md)
- [Ubuntu Deployment](docs/DEPLOY_UBUNTU.md)
- [Agent Guide](docs/AGENT_GUIDE.md)
- [Technical Decisions](docs/DECISIONS.md)
- [UI States](docs/UI_STATES.md)

## Production notes

- Current architecture is optimized for a single Ubuntu server
- SQLite is fine for this deployment model
- If you need multi-instance scaling later, migrate Prisma to PostgreSQL and move uploads to object storage
- `SESSION_SECRET` must be set in production
- Keep `data/` and `public/uploads/` writable by the app user

## Recommended verification before deploy

```bash
npm run lint
npm test
npm run build
```
