# Feature: Assets

File upload and storage management via Supabase Storage.

## Data Flow
- Admin uploads file → `upload.ts` → Supabase Storage
- Public URL returned and stored in themes/programs table
- Viewer loads assets via public Supabase Storage URLs

## Entry Points
- `upload.ts` — upload/delete operations
- `paths.ts` — storage path generators
