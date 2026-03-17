# Mini Game Ô Chữ

Realtime crossword mini-game website used alongside Facebook/YouTube livestreams.

The website **does not** stream video and **does not** accept user answers. It displays a public crossword board that updates in real time as the admin controls the game.

## Stack

- **Next.js** (App Router) + **TypeScript** (strict mode)
- **Tailwind CSS** v4
- **Supabase** (Postgres, Auth, Realtime, Storage)
- **Zod** for input validation

## Getting Started

### Prerequisites
- Node.js 20+
- npm
- A Supabase project (or Supabase CLI for local dev)

### Setup

```bash
# Install dependencies
npm install

# Copy env file and fill in your Supabase credentials
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Service role key (server-side admin ops) |
| `UPSTASH_REDIS_REST_URL` | No | Upstash Redis REST URL for distributed rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | No | Upstash Redis REST token |

## Project Structure

```
app/                    → Next.js App Router pages
  (public)/             → Viewer pages (public)
  admin/                → Admin pages (protected)
  api/                  → API route handlers

features/               → Domain-driven feature modules
  programs/             → Program CRUD + types
  themes/               → Theme config
  games/                → Core game logic, rows, events
  viewer/               → Public snapshot + realtime
  admin/                → Auth, permissions, actions
  assets/               → File uploads

components/             → React components
  viewer/               → Crossword board, clue list, etc.
  admin/                → Control panel, forms, etc.
  shared/               → Reusable UI components
  ui/                   → Primitive UI components

lib/                    → Infrastructure & utilities
  supabase/             → Supabase client/server/middleware
  constants/            → App config, routes
  utils/                → cn(), date helpers, etc.

docs/                   → Living documentation
supabase/               → Migrations, seeds, config
```

## Development Rules

1. Business logic lives in `features/*/service.ts`, NOT in UI components
2. All statuses use constants from `features/games/constants.ts`
3. DB mutations go through service layer → mutations → Supabase
4. Import direction: `app → features → lib` (no circular imports)
5. Schema changes require migration + type + mapper + schema updates
6. Read `docs/DOMAIN_RULES.md` before modifying game logic

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Domain Rules](docs/DOMAIN_RULES.md)
- [Agent Guide](docs/AGENT_GUIDE.md)
- [Decisions](docs/DECISIONS.md)
- [UI States](docs/UI_STATES.md)
- [DB Schema](docs/DB_SCHEMA.md)
- [Ubuntu Deployment](docs/DEPLOY_UBUNTU.md)
