# NCEA Platform and Admin Design

## Scope

Build the backend foundation for NCEA forum and marketplace features and a separate administration application. The existing public application and its visual behavior remain unchanged. No HunMaster Supabase project, Vercel project, repository, or configuration is in scope.

## Confirmed resources

- GitHub repository: `Yozekkk/ncea-tra`.
- Supabase organization: `NCEA` (`nigvyzryewbeqfmhgcys`).
- Supabase project: existing healthy project `bualqaeinwifoopzflbt` inside NCEA.
- Public Vercel application: existing `ncea-tra`, read-only for this change.
- Admin Vercel application: a new independent project named `ncea-admin` with root directory `apps/admin`.

## Database design

The existing foundation migration remains the source of the eight public tables. A following hardening migration adds a private schema, fixed-search-path helper functions, automatic profile and default-role creation, consistent `updated_at` triggers, explicit Data API grants, owner/moderator/admin RLS policies, and useful status/recency indexes.

`public.user_roles` remains the canonical authorization source. A user has exactly one role (`user`, `moderator`, or `admin`). Users may read only their own role; administrators may read and update all roles. No policy derives authorization from user metadata.

Forum categories are public only while active. Public topics and posts are readable only through active categories. Authenticated users create rows owned by `auth.uid()`, can edit their own content, and cannot change owner IDs. Locked topics reject normal-user writes. Moderators and administrators can manage all forum content.

Marketplace categories are public only while active. Anonymous users see only published listings and their image records. Authenticated sellers manage their own drafts and archived listings but cannot self-publish; administrators publish, archive, edit, and delete any listing. Seller IDs are immutable outside elevated moderation.

The private `marketplace-listings` bucket uses paths in the form `<seller UUID>/<listing UUID>/<file>`. Reads are allowed for files belonging to published listings, owners can manage only paths belonging to their own listing, and administrators can manage all objects. The bucket allows image MIME types and has a 10 MB object limit.

## Admin application

`apps/admin` is a standalone Vite, React, and TypeScript SPA with no server-side secret. It uses only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Vercel rewrites all application routes to `index.html` and applies `X-Robots-Tag: noindex, nofollow`.

Unauthenticated visitors see only the login screen. Authenticated non-admin users see Access denied and cannot load protected data. Administrators get Dashboard, Users, Forum, Marketplace, Moderation, and Settings routes. Each mutation is performed with the signed-in user's JWT and is authorized again by RLS.

Dashboard values come from exact Supabase counts and recent-row queries. Empty datasets render zero and explicit empty states. Moderation intentionally renders an extensible empty state because reports are outside this MVP.

## Visual direction

The admin uses a compact editorial operations layout: near-black `#090909`, surface `#111111`, raised surface `#181818`, border `#2a2a2a`, primary text `#f5f5f5`, and secondary text `#a3a3a3`. Geist-style system grotesk and monospace fallbacks avoid an extra font dependency. Motion is limited to 160–220 ms fades, hover states, modal movement, and sidebar transitions, with reduced-motion support.

## Verification

Database verification runs inside rollback transactions with simulated JWT claims for anonymous, User A, User B, and Admin. It checks ownership, role escalation prevention, locked-topic moderation, draft/published visibility, admin publishing, and cross-owner Storage deletion. Security and performance advisors must be reviewed after migrations.

Application verification includes lint, TypeScript compilation, production build, direct-route fetches, login-only anonymous state, noindex headers/meta, browser console/network inspection, and Vercel runtime/build logs.
