# NCEA Platform and Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a secure NCEA forum/marketplace backend and a separately deployed administration application without changing the public site's UI.

**Architecture:** Extend the existing foundation schema with forward-only hardening migrations and use RLS as the authorization boundary. Add a standalone Vite/React SPA under `apps/admin`, then deploy that directory as its own Vercel Project.

**Tech Stack:** PostgreSQL 17, Supabase Auth/Storage/Data API, React 19, TypeScript 5.8, Vite 7, Supabase JS 2.115, Vercel.

**Spec:** `docs/superpowers/specs/2026-09-06-ncea-platform-admin-design.md`

## Global Constraints

- Make Supabase changes only to project `bualqaeinwifoopzflbt` in organization `NCEA`.
- Never modify any HunMaster resource.
- Do not change public routes, components, styles, navigation, copy, or behavior.
- Never commit secrets; browser code uses only publishable Supabase credentials.
- Keep the admin application a separate Vercel Project rooted at `apps/admin`.

---

### Task 1: Versioned database foundation

**Files:**

- Create: `supabase/migrations/20260906170000_ncea_platform_security_and_permissions.sql`
- Create: `supabase/tests/ncea_platform_rls.sql`

**Interfaces:**

- Consumes: the eight tables and two enums from `20260905220000_ncea_platform_foundation.sql`.
- Produces: `private.has_role(uuid, app_role)`, `private.is_staff(uuid)`, profile/role triggers, complete RLS policies, and `marketplace-listings` Storage policies.

- [ ] Generate the migration filename through the Supabase CLI and add private helper functions with `search_path = ''` and revoked public execution.
- [ ] Add explicit grants and RLS policies for public, owner, staff, and admin access, including both `USING` and `WITH CHECK` for updates.
- [ ] Add the profile/default-role and `updated_at` triggers, useful composite indexes, and private Storage bucket configuration.
- [ ] Add a rollback-only SQL verification script that creates User A, User B, and Admin, sets JWT claims, and raises an exception when any required scenario fails.
- [ ] Apply both migrations to the confirmed NCEA project and run the verification script with `execute_sql`.
- [ ] Run Supabase Security and Performance Advisors, fix actionable warnings, and re-run them.

### Task 2: Standalone admin application

**Files:**

- Create: `apps/admin/package.json`, `apps/admin/pnpm-lock.yaml`, `apps/admin/index.html`, `apps/admin/vite.config.ts`, `apps/admin/tsconfig.json`, `apps/admin/vercel.json`, `apps/admin/.env.example`
- Create: `apps/admin/src/main.tsx`, `apps/admin/src/App.tsx`, `apps/admin/src/styles.css`
- Create: `apps/admin/src/lib/supabase.ts`, `apps/admin/src/lib/types.ts`, `apps/admin/src/lib/data.ts`
- Create: `apps/admin/src/components/AuthGate.tsx`, `apps/admin/src/components/AppShell.tsx`, `apps/admin/src/components/ui.tsx`
- Create: `apps/admin/src/pages/LoginPage.tsx`, `AccessDeniedPage.tsx`, `DashboardPage.tsx`, `UsersPage.tsx`, `ForumPage.tsx`, `MarketplacePage.tsx`, `ModerationPage.tsx`, `SettingsPage.tsx`

**Interfaces:**

- Consumes: publishable Supabase environment variables and RLS-protected tables.
- Produces: guarded routes `/`, `/users`, `/forum`, `/marketplace`, `/moderation`, and `/settings`.

- [ ] Scaffold a pinned standalone package and generate its lockfile without modifying the public package or lockfile.
- [ ] Implement a lazy Supabase client and typed data/mutation functions that never use a service key.
- [ ] Implement login, session restoration, canonical admin-role lookup, Access denied sign-out, and guards before protected data queries.
- [ ] Implement the responsive sidebar, compact tables, dialogs/forms, loading states, errors, empty states, and noindex metadata.
- [ ] Implement exact dashboard counts and recent records plus Users, Forum, Marketplace, Moderation, and Settings behavior from the spec.
- [ ] Add visible focus, reduced motion, mobile navigation, and semantic labels.

### Task 3: Local verification

**Files:**

- Modify only files created by Tasks 1–2 when fixing failures.

**Interfaces:**

- Consumes: the complete admin package and migrations.
- Produces: reproducible verification evidence.

- [ ] Run dependency installation from `apps/admin` and confirm the lockfile is unchanged afterward.
- [ ] Run `pnpm lint`, `pnpm typecheck`, and `pnpm build` in `apps/admin`; fix all failures.
- [ ] Start the production preview and use Playwright CLI to inspect login, direct protected URLs, desktop, mobile, console errors, and failed requests.
- [ ] Run the public site's existing verification/build without changing its source and compare Git diff to confirm no visual files changed.

### Task 4: GitHub and Vercel delivery

**Files:**

- Deliver exactly the reviewed diff from Tasks 1–3.

**Interfaces:**

- Consumes: verified local files and GitHub parent SHA `ca78b41e6b22df5d2684da4e33fb6f65575b48a4`.
- Produces: one GitHub commit and one independent Vercel production deployment.

- [ ] Create Git blobs/tree/commit through the connected GitHub API and atomically update `refs/heads/main` only if its parent SHA is unchanged.
- [ ] Create or select Vercel Project `ncea-admin` with Root Directory `apps/admin`; do not change `ncea-tra` settings.
- [ ] Add only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to the admin project's environments without printing values.
- [ ] Deploy production, wait for `READY`, and inspect build logs.
- [ ] Verify login, direct protected routes, noindex, Supabase connectivity, browser console/network, and runtime errors on the production URL.
- [ ] Record the GitHub SHA, Vercel project/deployment identifiers, advisors, and test results in the final report.
