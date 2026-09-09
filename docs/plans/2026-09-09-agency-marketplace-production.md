# NCEA Agency Marketplace — production implementation plan

## Scope and constraints

- Modify only the NCEA repository and the existing `ncea-tra` / `ncea-admin` Vercel projects.
- Keep the current TanStack Start + React + Supabase architecture.
- Do not create images, invent prices, create Vercel projects, or touch HunMaster.
- Ship only after local, database, browser, security, and production checks pass.

## Product and visual direction

The home page gains a compact official-partner row that reads as part of the existing light NCEA layout. It uses a restrained blue accent, a small hover lift, and a mobile stack. The outbound control is a real link to `https://my.awas.ovh/`, opens in a new tab, and carries `noopener noreferrer`.

Marketplace keeps the light page chrome and introduces two related card treatments. Official NCEA cards use a saturated blue/cyan field, subtle geometric background lines, a clear agency badge, and a built-in missing-image placeholder. User cards use a dark preview with a soft color glow and an unframed, readable information area. The grid is four columns on wide screens, three on standard desktop, two on tablet, and one on mobile without horizontal overflow. Motion is limited to transform/shadow and disabled for reduced-motion users.

Source filters are URL-addressable links: `Все`, `От агентства`, and `От пользователей`. The default order is deterministic:

1. agency listings: `sort_order ASC`, `created_at ASC`, `id ASC`;
2. eligible user listings (`current_streak >= 3`): `current_streak DESC`, `last_bumped_at DESC`, `created_at DESC`, `id ASC`;
3. remaining user listings: `created_at DESC`, `id ASC`.

## Data model and trust boundaries

- Add enum-backed `listing_source = agency | user` and an agency-only `sort_order`.
- Add a database trigger as the final invariant boundary; frontend fields are never trusted.
- Users can create and manage only their own `user` listings and cannot write `seller_id`, `listing_source`, `sort_order`, status-review timestamps, or streak-derived values.
- Moderators can review/hide/delete only `user` listings. They cannot create, convert, edit content of, or delete agency listings.
- Admins can fully manage agency listings.
- RLS policies, trigger checks, table privileges, storage-object policies, and RPC behavior must agree.
- Add protected Forum markers. Only admins may set them; moderators cannot update/delete protected topics/posts or content authored by admins.
- Seed the eight requested official services with `price = NULL` and no image rows. Existing marketplace rows are checked by slug/title to avoid duplicates.

## Verification strategy

1. Write unit tests for all ranking branches before implementation.
2. Add transactional SQL permission tests for two users, moderator, and admin, including direct-table attacks and RPC paths.
3. Run verify, typecheck, unit tests, lint, production build, and admin checks.
4. Run Supabase security/performance advisors after migration and inspect every warning.
5. Measure the production client bundle before and after; optimize only measured root-route costs.
6. Test desktop and mobile in a real browser: partner link/attributes, source tabs/order, card layout, no overflow, Forum smoke, console and failed network requests.
7. Commit and push `main`, deploy only the two existing NCEA projects, wait for `READY`, repeat browser and runtime-error checks, and remove any temporary test data.

## Rollback

Application rollback is the prior Git commit/deployment. Database rollback is a forward migration that removes seeded agency rows, restores prior policies/views/triggers, removes Forum protection fields, then drops `sort_order`, `listing_source`, and the enum only after dependent objects are restored. Tests use transactions and roll back, so they do not persist fixtures.
