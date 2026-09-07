# NCEA Community Platform Design

## Goal

Extend the existing public NCEA site with one Supabase Auth identity system, a readable-by-guests
forum, a readable-by-guests listings marketplace, owner/admin permissions, protected media, and
the existing admin application as the moderation surface.

## Confirmed boundaries

- Only Supabase organization `NCEA`, project `bualqaeinwifoopzflbt` may be changed.
- HunMaster and every HunMaster resource are out of scope.
- The existing TanStack Start/Vite/React stack and NCEA design system remain in place.
- Registration uses username, email, and password. Email confirmation, OTP, OAuth, CAPTCHA,
  payments, reputation, reactions, and rich-text editing are out of scope.
- Guest access remains the default for the site, forum reads, and published marketplace reads.
- `public.user_roles` is the canonical authorization source. User metadata is never trusted for roles.
- Secrets remain runtime-only and are never committed or exposed to browser code.

## Architecture

The main application gains feature-owned Auth, Forum, and Marketplace modules. A root AuthProvider
observes the existing Supabase session but does not guard public routes. TanStack Query owns remote
server state; Zod owns client input validation; PostgreSQL constraints, triggers, explicit grants,
RLS, and Storage policies remain the security boundary.

The existing admin SPA continues to authenticate against the same project and grants access only
after reading an `admin` role from `user_roles`. It moderates Forum and Marketplace content rather
than introducing a second identity store.

## Data decisions

- Usernames are trimmed, lowercase-comparable, 3–32 characters, and limited to letters, digits,
  underscore, hyphen, and period. Display casing is preserved while uniqueness uses `lower(username)`.
- Signup metadata supplies only the initial username. The signup trigger validates it and creates
  both the profile and default `user` role.
- A public, origin-restricted Edge Function creates the email-confirmed Auth user with the
  platform-provided server secret; the browser then immediately opens a password session. The
  function returns no credential or user identifier.
- Topic creation and its original post are one database transaction exposed through a narrowly
  granted authenticated RPC.
- Topic/post ownership columns and moderation flags cannot be reassigned by normal users.
- Listing publication is an admin action. An owner editing published content returns it to draft;
  an owner may archive their published listing.
- Marketplace objects use `{user_id}/{listing_id}/{random-file}` and a private bucket. Public image
  reads are allowed only for published listings; owners and admins retain scoped management access.

## UX decisions

- Routes: `/login`, `/register`, `/profile`, `/forum`, `/forum/category/$slug`,
  `/forum/topic/$slug`, `/marketplace`, `/marketplace/$slug`, `/marketplace/new`,
  `/marketplace/my`, and `/marketplace/$slug/edit`.
- Signed-out navigation presents Login/Register; signed-in navigation presents avatar placeholder,
  username, Profile, My listings, Admin (admin only), and Logout.
- Write affordances remain visible to guests but open a clear Login/Register prompt.
- User content is plain text rendered by React with preserved whitespace and no HTML injection.
- Every collection/detail/form supplies loading, empty, error, and actionable permission states.

## Verification contract

- Guest can read public forum content and published listings but cannot write.
- User A can create/edit/delete their permitted content and cannot mutate User B ownership/content.
- User B cannot update or delete User A forum posts, listings, or Storage objects.
- Admin can pin/lock/moderate forum content and publish/archive marketplace listings.
- Registration creates an immediate session and a profile with the selected unique username.
- Main and admin builds, lint, tests, SQL assertions, API integration, browser flows, Advisors, and
  production smoke checks must produce fresh evidence before completion is claimed.
