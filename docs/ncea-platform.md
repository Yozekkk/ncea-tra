# NCEA Platform

`ncea-platform` is a separate Supabase project inside the dedicated `NCA` organization.
It is not shared with or created inside HunMaster or any other existing backend.

## Applications

- The current NCEA site is the public frontend.
- A future admin panel will be a separate app and Vercel project.
- Both apps will use this same backend with different authorization levels.

## Initial schema

- `profiles` — public profile data linked to `auth.users`.
- `user_roles` — `user`, `moderator`, and `admin` role assignments.
- `forum_categories`, `forum_topics`, `forum_posts` — forum foundation.
- `marketplace_categories`, `marketplace_listings` — marketplace foundation.
- `marketplace_listing_images` — ordered listing image references.

## Security baseline

- RLS is enabled on every public table.
- Writes are denied by default until product flows are implemented.
- Public reads are limited to public profiles, active categories, and published listings.
- Elevated role checks will run server-side in the future admin application.
- The service-role key must never be exposed to browser code.

## Frontend environment

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

The reusable client is lazy and makes no request during a normal page load.
Secrets stay out of Git; production values are managed by Vercel.
