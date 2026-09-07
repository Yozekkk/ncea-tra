-- The public route resolves forum topics by slug alone, so the database must
-- enforce that the route key is globally unambiguous.
create unique index forum_topics_slug_key on public.forum_topics (slug);
