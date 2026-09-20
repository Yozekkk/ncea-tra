# NCEA Content Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship database-backed NCEA Employees plus Marketplace and Forum editor completion to live Supabase, GitHub main, and the existing Vercel production project.

**Architecture:** Add one RLS-protected NCEA table and one nullable NCEA forum column, then extend the existing React/Supabase flows without changing NCreate. Employees use direct Data API queries; official Forum topics reuse the guarded RPC.

**Tech Stack:** PostgreSQL 17, Supabase RLS/PostgREST, React 19, TypeScript 5.8, Vite 7, TanStack Query/Router, Zod, React Hook Form, pnpm/bun.

**Spec:** `docs/superpowers/specs/2026-09-20-ncea-content-management-design.md`

## Global Constraints

- NCEA-only changes; no intentional NCreate source/schema changes.
- No new dependencies, uploads, service-role browser keys, destructive table operations, or raw HTML.
- Preserve 7 Marketplace categories and 13 listings.
- Use additive migration and canonical `public.user_roles` helpers.

---

### Task 1: Add and verify the database migration

**Files:**

- Create: `supabase/migrations/<timestamp>_ncea_content_management.sql`
- Create: `supabase/tests/ncea_content_management_rls.sql`

**Interfaces:**

- Produces `public.ncea_employees`, `forum_topics.image_url`, and `owner_save_forum_topic(...,_image_url text)`.

- [ ] Create the migration with the repository's Supabase CLI naming convention.
- [ ] Add constraints, grants, RLS policies, trigger, index, deterministic six-row seed, and guarded Forum RPC.
- [ ] Add SQL assertions for active-only public reads, denied user/moderator writes, allowed admin/owner writes, Forum cover, preserved counts, and unchanged NCreate hashes.
- [ ] Apply to live project `bualqaeinwifoopzflbt`, regenerate TypeScript types, and re-introspect the live catalog.

### Task 2: Build Employees admin and public flow

**Files:**

- Create: `apps/admin/src/pages/EmployeesPage.tsx`
- Modify: `apps/admin/src/App.tsx`, `apps/admin/src/components/AppShell.tsx`, `apps/admin/src/lib/data.ts`, `apps/admin/src/lib/types.ts`, `apps/admin/src/lib/database.types.ts`, `apps/admin/src/styles.css`
- Modify: `src/lib/employees.ts`, `src/routes/workers.tsx`, `src/components/site/EmployeeCard.tsx`, `src/styles.css`

**Interfaces:**

- Produces `getEmployees`, `saveEmployee`, `NceaEmployee`, and the NCEA `/employees` route.

- [ ] Add typed direct Supabase reads/writes and URL/contact normalization.
- [ ] Add admin/owner-only route, navigation, responsive table, structured modal, pending/error states, preview and hide/publish actions.
- [ ] Remove static production rows and query active rows on `/workers` with stable ordering and all four states.
- [ ] Extend the existing card with optional image/bio and lazy-load fallback without changing actions or animation.

### Task 3: Complete Marketplace and Forum UX

**Files:**

- Modify: `apps/admin/src/pages/MarketplacePage.tsx`, `apps/admin/src/pages/ForumPage.tsx`, `apps/admin/src/lib/data.ts`, `apps/admin/src/lib/types.ts`, `apps/admin/src/styles.css`
- Modify: `src/features/community/types.ts`, `src/features/forum/components.tsx`, `src/styles.css`

**Interfaces:**

- Marketplace keeps `admin_save_marketplace_listing`; Forum editor passes `_image_url` to the updated RPC.

- [ ] Make Marketplace sections/actions explicit, preserve all existing fields, and provide accessible image failure feedback.
- [ ] Add Forum cover input/preview and allow both admin and owner to create/edit official topics.
- [ ] Render optional Forum covers in public topic lists with lazy loading and fallback.

### Task 4: Verify, publish, and validate production

**Files:**

- Modify generated route/type artifacts only when produced by project tooling.

**Interfaces:**

- Produces a tested GitHub `main` SHA and READY Vercel production deployment.

- [ ] Run root `typecheck`, `test`, `lint`, and `build`.
- [ ] Run admin `typecheck`, `lint`, and `build`.
- [ ] Run live SQL/RLS verification, both advisors, Marketplace counts, and before/after NCreate hashes.
- [ ] Commit, push the feature branch, integrate it into `main` without force-push, and push `main`.
- [ ] Deploy existing project `prj_ssvcm85DDV8kdezNzx35v3Zbv32E` to production.
- [ ] Verify NCEA and NCreate routes/admin at desktop/mobile widths, console health, and safe reversible employee CRUD without leaving test data.
