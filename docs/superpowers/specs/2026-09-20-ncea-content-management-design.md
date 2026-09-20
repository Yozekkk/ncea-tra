# NCEA Content Management Design

## Scope

Extend only the NCEA surfaces in `Yozekkk/ncea-tra`: database-backed employees, Marketplace editor polish, and Forum topic covers. NCreate source files, routes, tables, policies, and routines remain unchanged. The existing `c4f778d` NCreate commit may reach production as part of deploying current `main`, as explicitly authorized.

## Architecture

`public.ncea_employees` is the source of truth for the public workers page and the NCEA-only admin editor. Anonymous and ordinary authenticated users can select active rows only; admin and owner can select all rows and insert/update through normal Supabase Data API calls protected by RLS. No employee RPC or browser service-role key is introduced.

`public.forum_topics.image_url` is an additive nullable column. The existing official-topic RPC gains an image argument and authorizes the canonical admin hierarchy (`private.is_admin`, which includes owner). The ordinary `create_forum_topic` RPC is unchanged, so user topics keep `image_url = null` unless an authorized admin later edits them.

Marketplace keeps its current data model and RPC. Work is limited to validation, labels, preview states, loading feedback, and explicit save/archive actions.

## Data and Security

Employees use UUID primary keys, `text + check` constraints, nullable normalized contact/image fields, `timestamptz`, and a partial public-feed index on `(sort_order, id) where is_active`. Six legacy rows use stable UUIDs and `on conflict (id) do update`, making the seed deterministic.

Image and GitHub URLs must be trimmed, contain no credentials or markup, use `http:` or `https:`, and stay within 2048 characters. The database repeats protocol/length constraints. React renders user content as text; no raw HTML or server-side URL fetch is added.

## UI and Data Flow

The admin receives a NCEA-only `/employees` route and navigation item visible to admin/owner. Its responsive table opens a structured modal with image preview and graceful failure state. Save/publish/hide writes via Supabase, closes on success, and reloads the list.

`/workers` uses TanStack Query to select active employees ordered by `sort_order`, then `name`, then `id`. Loading, error, empty, and loaded states are explicit. Existing card actions, level styling, animation, and no-image layout remain intact.

Forum list cards optionally render a lazy-loaded cover. Marketplace and Forum forms share a small URL-validation helper pattern but avoid a shared refactor that could affect NCreate.

## Migration and Rollback

The migration is additive: create one table, add one nullable column, add policies/indexes/trigger, seed rows, and replace one NCEA RPC signature. No existing data is deleted. Code remains compatible while the migration rolls out because the old public flows do not require the new fields. Rollback is code-first; the new table/column can remain dormant to avoid destructive production rollback.

## Verification

Run root typecheck/tests/lint/build, admin typecheck/lint/build, SQL/RLS probes, generated-type comparison, Supabase advisors, NCreate schema hashes, browser checks at desktop/mobile widths, GitHub main verification, Vercel production deployment verification, and production route/admin regression checks.
