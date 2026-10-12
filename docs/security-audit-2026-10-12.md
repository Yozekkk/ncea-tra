# NCEA security audit — 12 October 2026

Scope: live Supabase project `bualqaeinwifoopzflbt`, current `main` migrations, public REST API, and the anonymous NCEA Admin login gate. Read-only checks were used; no production rows or schema were changed.

## Live access checks

- All 18 `public` tables have RLS enabled. `anon` has no `EXECUTE` privilege on any `public` `SECURITY DEFINER` function.
- `authenticated` has no direct `UPDATE` privilege on `user_roles` or `INSERT` privilege on `ncea_admin_audit`; `anon` cannot read either table (REST returned HTTP 401 / PostgreSQL `42501`). Public forum and NCreate category reads returned HTTP 200.
- All 11 advisor-listed functions are owned by `postgres`, have `search_path = ''`, and grant `EXECUTE` to `authenticated` but not `anon`. Two further public definer functions, `consume_registration_attempt` and `record_daily_activity`, are not callable by `authenticated` or `anon`.
- The production Security Advisor reported one warning containing 11 `authenticated_security_definer_function_executable` findings and one `auth_leaked_password_protection` warning. [Supabase documents that advisor findings may be intentional](https://supabase.com/docs/guides/observability/advisors) and that a definer function runs with its owner's privileges, so each callable function was reviewed individually.

## Eleven callable definer functions

| RPC | Live authorization in function | Reason elevated access is currently used |
| --- | --- | --- |
| `admin_save_marketplace_listing` | Signed-in `private.is_admin` caller; owner check for a deleted listing | Admin save across seller-owned rows |
| `get_deleted_content` | Signed-in owner only | Read deleted rows outside normal RLS visibility |
| `owner_save_forum_topic` | Signed-in admin or owner; name retained for API compatibility | Create or edit a protected topic and first post together |
| `owner_update_forum_post` | Signed-in owner only | Edit protected forum post |
| `permanently_delete_content` | Signed-in owner only | Purge previously deleted content |
| `renew_strike_mode` | Signed-in caller; all reads and writes scoped to `auth.uid()` | Atomic per-user streak renewal |
| `restore_deleted_content` | Signed-in owner only | Restore rows hidden by normal policies |
| `set_user_role` | Signed-in admin or owner; owner assignment and changes to an existing owner are rejected | Controlled role update without client table writes |
| `soft_delete_forum_post` | Signed-in owner, or staff/self subject to protected and locked checks | Record deletion actor and reason atomically |
| `soft_delete_forum_topic` | Signed-in owner, or staff/self subject to protected and locked checks | Record deletion actor and reason atomically |
| `soft_delete_marketplace_listing` | Signed-in owner, or permitted staff/seller | Record deletion actor and reason atomically |

These are intentional privileged API operations with explicit checks. Revoking `authenticated` execution or changing them to invoker without replacing their access path would break admin, moderation, marketplace, and user flows. The 11 linter findings remain visible. A future migration could move privileged implementations to a private schema behind invoker wrappers, with a database backup and role-by-role regression tests first. [Supabase's function guidance](https://supabase.com/docs/guides/database/functions) explains the execution and ownership risks.

## Password protection and remaining verification

The Auth security advisor confirms leaked-password protection is **disabled**. The `register-account` Edge Function checks Have I Been Pwned with a hash prefix and fails closed when that lookup is unavailable. However, the public Auth settings endpoint reports `disable_signup: false`, so a direct Auth signup can bypass the Edge Function's extra password check. Enable leaked-password protection in the confirmed Supabase project's Auth settings; this setting was not changed because the connected Supabase tools expose no Auth configuration update operation. Re-run the Security Advisor after enabling it. [Supabase password guidance](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

No admin, moderator, owner, or ordinary user credentials were available for destructive or authenticated browser E2E checks. The Admin login gate rendered correctly, and the public app plus Admin typecheck, tests, lint, and production builds passed. These checks do not prove authenticated mutations or every Admin screen works in production.
