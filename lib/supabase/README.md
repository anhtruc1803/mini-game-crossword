# Supabase Client Setup

## Files
- `client.ts` — Browser client for Client Components (`"use client"`)
- `server.ts` — Server client for Server Components, Server Actions, Route Handlers
- `middleware.ts` — Session refresh in Next.js middleware

## Usage
```ts
// Client Component
import { createSupabaseBrowser } from "@/lib/supabase/client";
const supabase = createSupabaseBrowser();

// Server Component / Server Action
import { createSupabaseServer } from "@/lib/supabase/server";
const supabase = await createSupabaseServer();
```

## Important
- NEVER import `client.ts` in server code or vice versa
- Session refresh happens automatically in middleware
- The `setAll` in server.ts can fail in Server Components (read-only cookies) — this is expected
