# NCEA Community Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver public Auth/Profile, Forum, Marketplace, shared admin moderation, hardened Supabase policies, complete role-based tests, and a verified production deployment.

**Architecture:** Feature-based React modules share one lazy Supabase client and root session provider. Forward-only SQL migrations make database and Storage policy enforcement authoritative; the main UI and existing admin UI expose only actions that match those policies.

**Tech Stack:** TanStack Start/Router/Query, React 19, TypeScript, Vite, Tailwind CSS 4, Supabase Auth/Postgres/Storage, Zod, React Hook Form, Node test runner, browser E2E.

**Spec:** `docs/superpowers/specs/2026-09-07-ncea-community-platform-design.md`

## Global Constraints

- Change only Supabase organization `NCEA`, project `bualqaeinwifoopzflbt`.
- Never inspect or mutate HunMaster resources.
- Keep the existing framework, homepage, brand palette, typography, spacing, and motion language.
- Never commit credentials or expose secret/service keys in browser code or logs.
- Keep all existing migrations and add one sequential forward-only migration.

---

### Task 1: Validation, types, and tests

**Files:** Create `src/features/auth/schemas.ts`, `src/features/forum/schemas.ts`, `src/features/marketplace/schemas.ts`, `tests/validation.test.mjs`; modify `package.json`.

**Interfaces:** Produces shared Zod schemas and normalized slug/username helpers used by forms and mutations.

- [x] Write tests for username boundaries, forum text, listing price/currency, and safe image types.
- [x] Run the tests and confirm they fail because feature modules do not exist.
- [x] Implement focused validation modules with matching UI messages and database constraints.
- [x] Run the tests and confirm they pass.

### Task 2: Forward-only Supabase migration

**Files:** Create `supabase/migrations/20260907*_ncea_community_platform.sql`; modify `supabase/tests/ncea_platform_rls.sql`.

**Interfaces:** Produces normalized username enforcement, signup profile creation, atomic topic RPC, listing owner workflow, category seeds, grants, indexes, and policies.

- [x] Add failing SQL assertions for case-insensitive usernames, role immutability, topic transaction ownership, listing archive transitions, and cross-user Storage mutations.
- [x] Add constraints/functions/policies with fixed search paths and narrow `EXECUTE` grants.
- [x] Re-run SQL inspection and the complete role matrix against the NCEA project.

### Task 3: Auth and Profile

**Files:** Create `src/features/auth/{api,AuthProvider,AuthForm,AccountMenu}.tsx`, `src/routes/{login,register,profile}.tsx`; modify `src/routes/__root.tsx`, `src/components/site/nav/Navbar.tsx`.

**Interfaces:** Produces `useAuth()`, authenticated session/profile/role state, signup/login/logout mutations, and reusable sign-in prompt.

- [x] Test immediate signup session, unique username errors, login persistence, logout, and public-route access.
- [x] Implement provider and accessible forms with inline errors, autocomplete, and stable loading states.
- [x] Add Guest Login/Register controls and signed-in account menu without protecting the root site.

### Task 4: Forum

**Files:** Create `src/features/forum/{api,queries,components}.tsx`, `src/routes/forum.index.tsx`, `src/routes/forum.category.$slug.tsx`, `src/routes/forum.topic.$slug.tsx`; modify navigation.

**Interfaces:** Consumes `useAuth()` and topic RPC; produces guest reads, topic/reply creation, owner edits/deletes, and staff moderation controls.

- [x] Test guest reads and write prompts, User A ownership, User B denial, admin pin/lock/moderation, locked-topic behavior, and plain-text rendering.
- [x] Implement category/latest topic lists, detail/replies, author/timestamp/count metadata, and accessible write forms.
- [x] Invalidate exact TanStack Query keys after successful mutations.

### Task 5: Marketplace and Storage

**Files:** Create `src/features/marketplace/{api,queries,storage,components}.tsx`, `src/routes/marketplace.index.tsx`, `src/routes/marketplace.$slug.tsx`, `src/routes/marketplace.new.tsx`, `src/routes/marketplace.my.tsx`, `src/routes/marketplace.$slug.edit.tsx`.

**Interfaces:** Consumes `useAuth()` and private Storage bucket; produces published browsing, owner draft CRUD, image management, and archived state.

- [x] Test guest reads, draft privacy, User A CRUD, User B denial, admin publication, MIME/size rejection, and object ownership.
- [x] Implement listing grids/details/forms, currency/price formatting, multi-image upload, preview cleanup, and owner status actions.
- [x] Ensure editing published content returns it to draft and public queries never expose drafts.

### Task 6: Admin integration

**Files:** Modify `apps/admin/src/{components/AuthGate.tsx,lib/data.ts,lib/database.types.ts,pages/ForumPage.tsx,pages/MarketplacePage.tsx}` as required.

**Interfaces:** Consumes the same Auth session and `user_roles`; produces moderation compatible with the final schema.

- [x] Verify ordinary users receive access denied and admin receives Forum/Marketplace actions.
- [x] Align admin mutations and labels with pin/lock/moderate/publish/archive behavior.
- [x] Build the admin SPA independently.

### Task 7: Full verification and delivery

**Files:** Modify `supabase/tests/ncea_api_verification.mjs`, `scripts/verify-site.mjs`, documentation and generated route tree as required.

**Interfaces:** Produces reproducible PASS/FAIL evidence and production deployment identifiers.

- [ ] Bootstrap the owner only from `.env.admin-bootstrap.local`, then promote by immutable user ID without logging credentials.
- [x] Run validation tests, lint, main build, admin build, SQL/API role matrix, and browser E2E at 375/768/1024/1440 widths.
- [x] Run Security and Performance Advisors and resolve actionable findings.
- [x] Scan tracked changes for secrets and review the full diff.
- [ ] Commit and push atomically, wait for Vercel, then smoke-test production routes and role flows.
