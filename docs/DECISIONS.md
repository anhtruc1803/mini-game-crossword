# Technical Decisions

## Why Prisma + SQLite

- lightweight for a single-server deployment
- easy local setup
- typed Prisma client
- simple backup model

Tradeoff:

- not ideal for multi-instance horizontal scaling

## Why signed cookies for admin sessions

- avoids keeping session state in memory
- survives process restarts better than in-memory session maps
- works well for a small self-hosted admin console

Tradeoff:

- no central session revocation table

## Why polling instead of WebSockets

- simpler operating model
- easier to reason about with sanitized whole snapshots
- good enough for a livestream companion site

Tradeoff:

- less immediate than sockets
- polling interval must stay conservative because SQLite is local

## Why server-side snapshot sanitization

- public payloads are visible in the browser
- UI-only hiding is not enough
- hidden answers and final keyword must never leak early

This remains a non-negotiable rule.

## Why local file storage

- simple Ubuntu deployment
- no object storage dependency
- easy to inspect and back up

Tradeoff:

- shared multi-node storage is harder later

## Why Birthday Glass UI

- fits celebratory programs better than plain dark admin UI
- still preserves readability for a livestream screen
- supports iNET brand accents without becoming too noisy

## Why keep dark and light mode

- viewer screens vary widely across venues and devices
- dark works well for streams
- light helps operators and mobile users in bright environments

## When to revisit the current architecture

Revisit if:

- more than one app instance is required
- polling becomes too expensive
- media needs CDN or private object storage
- admin auth needs centralized session revocation
- analytics/reporting load grows beyond SQLite comfort
