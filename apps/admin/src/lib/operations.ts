import { getSupabase } from "./supabase";

export type SiteSettings = {
  site_id: string;
  announcement: string;
  announcement_enabled: boolean;
  updated_at: string;
};
export type AuditEntry = {
  id: number;
  actor_id: string | null;
  action: string;
  entity: string;
  entity_id: string;
  created_at: string;
  actor: string;
};
function client() {
  return getSupabase();
}
export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await client()
    .from("ncea_site_settings")
    .select("*")
    .eq("site_id", "ncea")
    .single();
  if (error) throw new Error(error.message);
  return data;
}
export async function saveSiteSettings(
  values: Pick<SiteSettings, "announcement" | "announcement_enabled">,
) {
  const { error } = await client()
    .from("ncea_site_settings")
    .update(values)
    .eq("site_id", "ncea")
    .select("site_id")
    .single();
  if (error) throw new Error(error.message);
}
export async function getAuditEntries(): Promise<AuditEntry[]> {
  const { data, error } = await client()
    .from("ncea_admin_audit")
    .select("*, profiles!ncea_admin_audit_actor_id_fkey(username)")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return data.map(({ profiles, ...entry }) => ({
    ...entry,
    actor: profiles?.username ?? entry.actor_id ?? "Удалённый пользователь",
  }));
}
export async function setEmployeeDeleted(id: string, deleted: boolean) {
  const { error } = await client()
    .from("ncea_employees")
    .update({ deleted_at: deleted ? new Date().toISOString() : null, is_active: false })
    .eq("id", id)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
}
export async function reorderEmployees(ids: string[]) {
  const { error } = await client().rpc("admin_reorder_employees", { _ids: ids });
  if (error) throw new Error(error.message);
}
/** Bulk writes are atomic per statement and report a concurrent deletion instead of success. */
export async function bulkEmployees(ids: string[], active: boolean) {
  if (!ids.length) return;
  const { data, error } = await client()
    .from("ncea_employees")
    .update({ is_active: active })
    .in("id", ids)
    .is("deleted_at", null)
    .select("id");
  if (error) throw new Error(error.message);
  if (data.length !== ids.length)
    throw new Error("Часть карточек недоступна. Список обновлён; проверьте результат.");
}
export async function bulkListings(ids: string[], status: "published" | "archived" | "draft") {
  if (!ids.length) return;
  const { data, error } = await client()
    .from("marketplace_listings")
    .update({ status })
    .in("id", ids)
    .is("deleted_at", null)
    .select("id");
  if (error) throw new Error(error.message);
  if (data.length !== ids.length)
    throw new Error("Часть объявлений недоступна. Список обновлён; проверьте результат.");
}
export async function bulkTopics(ids: string[], locked: boolean) {
  if (!ids.length) return;
  const { data, error } = await client()
    .from("forum_topics")
    .update({ is_locked: locked })
    .in("id", ids)
    .is("deleted_at", null)
    .select("id");
  if (error) throw new Error(error.message);
  if (data.length !== ids.length)
    throw new Error("Часть тем недоступна. Список обновлён; проверьте результат.");
}
export async function getListingFiles(id: string) {
  const { data, error } = await client()
    .from("marketplace_listing_images")
    .select("*")
    .eq("listing_id", id)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data;
}
export async function getUserActivity(id: string) {
  const db = client();
  const queries = await Promise.all([
    db
      .from("forum_topics")
      .select("*", { count: "exact", head: true })
      .eq("author_id", id)
      .is("deleted_at", null),
    db
      .from("forum_posts")
      .select("*", { count: "exact", head: true })
      .eq("author_id", id)
      .is("deleted_at", null),
    db
      .from("marketplace_listings")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", id)
      .is("deleted_at", null),
  ]);
  for (const q of queries) if (q.error) throw new Error(q.error.message);
  return {
    topics: queries[0].count ?? 0,
    posts: queries[1].count ?? 0,
    listings: queries[2].count ?? 0,
  };
}
