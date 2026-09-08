# NCEA Community Hardening and Launch Plan

Date: 2026-09-08
Status: approved

## Scope

Finish and production-verify the existing NCEA Forum and Marketplace without changing the HunMaster application or redesigning the NCEA home page.

## Architecture

- Keep Forum categories and routes as the existing forum taxonomy.
- Replace the active Marketplace taxonomy with `plugin-bundles`, `mod-bundles`, and `plugins`; expose “От пользователей” as a logical storefront view rather than a database category.
- Add `short_description`, optional Minecraft version/platform metadata, and the moderated lifecycle `draft -> pending_review -> published -> archived`.
- Derive `seller_id` from `auth.uid()` inside database RPCs. Protect ownership, listing status, promotion fields, and storage paths with RLS and triggers.
- Store activity in a normalized `user_activity_streaks` table. The authenticated public RPC has no date or user arguments; it records at most one increment per UTC day using database time. A private deterministic helper is available only to database owners for transactional tests.
- Rank only published Marketplace listings using an effective streak that expires after a missed UTC day, then `last_bumped_at`, listing recency, and UUID as stable tie-breakers.
- Record activity during authenticated session hydration and show streak/progress in Profile and Marketplace.
- Retain the existing private Storage bucket and signed URLs; validate MIME type, size, ownership, listing mutability, and object path.
- Keep the standalone `ncea-admin` Vercel project. Extend it for pending-review moderation; do not move it under the main site.

## Verification gates

1. Add failing unit and SQL contract tests before implementation.
2. Implement migrations, API boundaries, UI states, and admin moderation.
3. Pass root/admin verify, typecheck, lint, unit/integration, SQL RLS/Storage/streak, and browser smoke tests.
4. Run secrets/dependency/security checks and Supabase Security Advisor.
5. Measure bundle/query/browser performance and run Supabase Performance Advisor.
6. Apply the reviewed migration and deploy the reviewed Edge Function/config.
7. Create temporary production User A, User B, and Admin accounts; execute Forum, Marketplace, Storage, streak, ownership, moderation, direct-route, refresh, mobile/desktop, console, network, and runtime-log scenarios.
8. Delete test objects, rows, and auth users; confirm cleanup.
9. Commit and push the tested tree to the current `main`; verify the remote SHA.
10. Deploy the existing `ncea-tra` and `ncea-admin` projects, wait for `READY`, and repeat production smoke/critical-path checks.

## Rollback

- Database changes are additive and preserve old category rows as inactive records.
- Vercel deployments remain individually addressable for rollback.
- The git commit is the single code/config handoff point; no secrets or test credentials are committed.
