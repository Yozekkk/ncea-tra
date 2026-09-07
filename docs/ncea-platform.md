# NCEA Platform

`ncea-platform` is a separate Supabase project inside the dedicated `NCEA` organization.
It is not shared with or created inside HunMaster or any other existing backend.

## Applications

- The current NCEA site is the public frontend.
- The existing admin app and the protected `/admin` route use the same Auth and role source.
- Both apps will use this same backend with different authorization levels.

## Initial schema

- `profiles` — public profile data linked to `auth.users`.
- `user_roles` — `user`, `moderator`, and `admin` role assignments.
- `forum_categories`, `forum_topics`, `forum_posts` — forum foundation.
- `marketplace_categories`, `marketplace_listings` — marketplace foundation.
- `marketplace_listing_images` — ordered listing image references.

## Security baseline

- RLS is enabled on every public table.
- Forum and Marketplace writes use ownership-based policies with `USING` and `WITH CHECK`.
- Public reads are limited to public profiles, active categories, and published listings.
- Elevated permissions use the protected `user_roles` table and database RLS functions.
- The service-role key must never be exposed to browser code.

## Frontend environment

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

The reusable client is lazy and makes no request during a normal page load.
Secrets stay out of Git; production values are managed by Vercel.

Registration calls the public `register-account` Edge Function. It validates the request, uses the
platform-provided service role only inside Supabase, confirms the new email server-side, and the
browser immediately signs in with the submitted credentials. The secret key is never returned to or
stored by the frontend.
