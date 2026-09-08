-- Enum values added by PostgreSQL can only be referenced after the transaction
-- that creates them commits, so pending_review is intentionally isolated here.
alter type public.marketplace_listing_status
  add value if not exists 'pending_review' after 'draft';
