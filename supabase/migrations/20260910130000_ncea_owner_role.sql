-- Add the NCEA owner role in its own committed transaction. PostgreSQL does
-- not allow a newly-added enum value to be consumed safely in the same one.

alter type public.app_role add value if not exists 'owner' after 'admin';

