# Technical Decisions

## Why Prisma + SQLite

- The current project targets a simple single-server deployment.
- Prisma gives typed queries and a migration workflow without Supabase-specific code.
- SQLite keeps infrastructure light for an event-site style application.

Tradeoff:

- This is not the best long-term choice for multi-instance scaling.
- If viewer traffic or operational requirements grow significantly, PostgreSQL should be the next step.

## Why signed cookie sessions instead of in-memory sessions

- In-memory sessions were lost on restart.
- In-memory sessions do not work well once more than one process is involved.
- Signed cookies let the app verify the session format on every request without a session table.

Tradeoff:

- Cookie invalidation is not centrally tracked.
- Server-side admin checks still remain necessary.

## Why polling instead of realtime subscriptions

- The codebase no longer depends on Supabase Realtime.
- Polling keeps the viewer pipeline simpler and easier to operate with Prisma + SQLite.
- Full snapshot replacement is easier to reason about than partial live reducers.

Tradeoff:

- Polling is less responsive than WebSockets.
- Polling frequency must stay conservative because SQLite is local and single-node.

## Why server-side snapshot sanitization

- The public viewer must never receive hidden answers early.
- Hiding data only in the UI is not enough because payloads are visible in the browser.
- Sanitizing the snapshot server-side protects both SSR payloads and API responses.

This is one of the most important security decisions in the project.

## Why local filesystem asset storage

- It avoids requiring external object storage for a simple deployment.
- It is easy to back up together with the app.
- It works well enough for controlled admin uploads on one server.

Tradeoff:

- Files are public once stored under `public/uploads`.
- Horizontal scaling and CDN workflows are harder than with object storage.

## Why feature-based folders

- The codebase is easier to navigate by business domain.
- Related types, schemas, queries, mutations, and services stay near each other.
- It reduces the chance of scattering one feature across many unrelated folders.

## Why keep route protection in multiple layers

- `proxy.ts` blocks obviously invalid requests early.
- `app/admin/programs/layout.tsx` prevents SSR leaks.
- `requireAdmin()` protects server actions and sensitive reads.

This repetition is intentional because admin data exposure is a high-risk failure mode.

## When these decisions should be revisited

Revisit the architecture if any of these become true:

- more than one app instance is needed
- viewer polling becomes too expensive
- asset storage needs privacy, CDN delivery, or shared storage
- admin session revocation needs to be centrally managed
- reporting or analytics require heavier database workloads
