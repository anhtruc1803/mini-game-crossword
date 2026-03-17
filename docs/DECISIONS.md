# Technical Decisions

## Why Supabase?
- Provides Postgres, Auth, Realtime, and Storage in one service
- Reduces boilerplate for auth + realtime + file uploads
- Good developer experience with TypeScript client
- Free tier sufficient for MVP

## Why feature-based architecture?
- Easier for new developers and AI agents to navigate
- Each domain is self-contained with its own types, schemas, queries
- Reduces coupling between unrelated features
- Clear import direction: app → features → lib

## Why only 3 row statuses?
- `hidden` / `clue_visible` / `answer_revealed` covers the entire game flow
- Adding more states (e.g., "partially revealed") increases complexity without clear benefit
- Simpler state machines are easier to reason about and test

## Why separate desktop and mobile backgrounds?
- Livestream viewers often watch on mobile (portrait) while the game board is designed for landscape
- Different aspect ratios require different background images for visual quality
- Admin can optimize visual presentation per device type

## Why CSS variables for theming?
- Allows runtime theme switching without recompiling Tailwind
- Each program can have custom colors applied via inline styles
- Simpler than maintaining multiple Tailwind configs

## When to change schema
- Always create a new migration (never edit existing ones)
- Update all related types, mappers, and schemas in the same PR
- Test migration against seed data before deploying
