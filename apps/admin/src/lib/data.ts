import { readRows } from "./readRows";
import type { TablesInsert, TablesUpdate } from "./database.types";
import { getSupabase } from "./supabase";
import type {
  AdminUser,
  AppRole,
  DashboardData,
  ForumCategory,
  ListingStatus,
  MarketplaceCategory,
  PostView,
  TopicView,
  ListingView,
  DeletedItem,
  DeletedContentType,
  ForumTopicEditorValues,
  MarketplaceEditorValues,
  EmployeeEditorValues,
  NceaEmployee,
} from "./types";

function fail(message: string, error: { message: string } | null): never {
  throw new Error(error ? `${message}: ${error.message}` : message);
}

export async function getCurrentRole(userId: string): Promise<AppRole | null> {
  const { data, error } = await getSupabase()
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) fail("Could not verify administrator role", error);
  return data?.role ?? null;
}

export async function getUsers(limit?: number): Promise<AdminUser[]> {
  const supabase = getSupabase();
  const [profiles, roles] = await Promise.all([
    readRows(
      (from, to) =>
        supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false })
          .order("id")
          .range(from, to),
      limit,
    ),
    readRows((from, to) =>
      supabase.from("user_roles").select("user_id, role").order("user_id").range(from, to),
    ),
  ]);
  const roleByUser = new Map((roles ?? []).map((item) => [item.user_id, item.role]));
  return (profiles ?? []).map((profile) => ({
    ...profile,
    role: roleByUser.get(profile.id) ?? "user",
  }));
}

export async function setUserRole(userId: string, role: AppRole): Promise<void> {
  if (role === "owner") throw new Error("Owner role is managed only through backend migrations.");
  const { error } = await getSupabase().rpc("set_user_role", { _user_id: userId, _role: role });
  if (error) fail("Could not update role", error);
}

export async function getTopics(limit?: number): Promise<TopicView[]> {
  const data = await readRows(
    (from, to) =>
      getSupabase()
        .from("forum_topics")
        .select("*, profiles!forum_topics_author_id_fkey(username), forum_categories(name)")
        .is("deleted_at", null)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .order("id")
        .range(from, to),
    limit,
  );
  return (data ?? []).map(({ profiles, forum_categories, ...topic }) => ({
    ...topic,
    author: profiles?.username ?? "Unknown",
    category: forum_categories?.name ?? "Unknown",
  }));
}

export async function getPosts(limit?: number): Promise<PostView[]> {
  const data = await readRows(
    (from, to) =>
      getSupabase()
        .from("forum_posts")
        .select("*, profiles!forum_posts_author_id_fkey(username), forum_topics(title)")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .order("id")
        .range(from, to),
    limit,
  );
  return (data ?? []).map(({ profiles, forum_topics, ...post }) => ({
    ...post,
    author: profiles?.username ?? "Unknown",
    topic: forum_topics?.title ?? "Unknown",
  }));
}

export async function getForumCategories(): Promise<ForumCategory[]> {
  const { data, error } = await getSupabase()
    .from("forum_categories")
    .select("*")
    .order("sort_order")
    .order("name");
  if (error) fail("Could not load forum categories", error);
  return data ?? [];
}

export async function saveForumCategory(
  id: number | null,
  values: TablesInsert<"forum_categories">,
): Promise<void> {
  const query = id
    ? getSupabase().from("forum_categories").update(values).eq("id", id)
    : getSupabase().from("forum_categories").insert(values);
  const { error } = await query.select("id").single();
  if (error) fail("Could not save forum category", error);
}

export async function updateTopic(id: string, values: TablesUpdate<"forum_topics">): Promise<void> {
  const { error } = await getSupabase()
    .from("forum_topics")
    .update(values)
    .eq("id", id)
    .select("id")
    .single();
  if (error) fail("Could not update topic", error);
}

export async function deleteTopic(id: string): Promise<void> {
  const { error } = await getSupabase().rpc("soft_delete_forum_topic", {
    _topic_id: id,
    _reason: "Moderated in NCEA Admin",
  });
  if (error) fail("Could not delete topic", error);
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await getSupabase().rpc("soft_delete_forum_post", {
    _post_id: id,
    _reason: "Moderated in NCEA Admin",
  });
  if (error) fail("Could not moderate post", error);
}

export async function getMarketplaceCategories(): Promise<MarketplaceCategory[]> {
  const { data, error } = await getSupabase()
    .from("marketplace_categories")
    .select("*")
    .order("sort_order")
    .order("name");
  if (error) fail("Could not load marketplace categories", error);
  return data ?? [];
}

export async function saveMarketplaceCategory(
  id: number | null,
  values: TablesInsert<"marketplace_categories">,
): Promise<void> {
  const query = id
    ? getSupabase().from("marketplace_categories").update(values).eq("id", id)
    : getSupabase().from("marketplace_categories").insert(values);
  const { error } = await query.select("id").single();
  if (error) fail("Could not save marketplace category", error);
}

export async function getListings(limit?: number): Promise<ListingView[]> {
  const data = await readRows(
    (from, to) =>
      getSupabase()
        .from("marketplace_listings")
        .select(
          "*, profiles!marketplace_listings_seller_id_fkey(username), marketplace_categories(name)",
        )
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .order("id")
        .range(from, to),
    limit,
  );
  return (data ?? []).map(({ profiles, marketplace_categories, ...listing }) => ({
    ...listing,
    seller: profiles?.username ?? "Unknown",
    category: marketplace_categories?.name ?? "Unknown",
  }));
}

export async function setListingStatus(id: string, status: ListingStatus): Promise<void> {
  const { error } = await getSupabase()
    .from("marketplace_listings")
    .update({ status })
    .eq("id", id)
    .select("id")
    .single();
  if (error) fail("Could not update listing status", error);
}

export async function saveMarketplaceListing(
  id: string | null,
  values: MarketplaceEditorValues,
): Promise<void> {
  const { error } = await getSupabase().rpc("admin_save_marketplace_listing", {
    _listing_id: id,
    _category_id: values.category_id,
    _title: values.title,
    _short_description: values.short_description,
    _description: values.description,
    _listing_source: values.listing_source,
    _image_url: values.image_url,
    _price_amount: values.price_amount,
    _price_text: values.price_text,
    _currency_code: values.currency_code,
    _minecraft_version: values.minecraft_version,
    _platform: values.platform,
    _sort_order: values.sort_order,
    _status: values.status,
  });
  if (error) fail("Could not save Marketplace listing", error);
}

export async function deleteListing(id: string): Promise<void> {
  const { error } = await getSupabase().rpc("soft_delete_marketplace_listing", {
    _listing_id: id,
    _reason: "Removed in NCEA Admin",
  });
  if (error) fail("Could not delete listing", error);
}

export async function getForumTopicContent(topicId: string): Promise<string> {
  const { data, error } = await getSupabase()
    .from("forum_posts")
    .select("body")
    .eq("topic_id", topicId)
    .is("deleted_at", null)
    .order("created_at")
    .limit(1)
    .maybeSingle();
  if (error) fail("Could not load topic content", error);
  return data?.body ?? "";
}

export async function saveOwnerForumTopic(
  id: string | null,
  values: ForumTopicEditorValues,
): Promise<void> {
  const { error } = await getSupabase().rpc("owner_save_forum_topic", {
    _topic_id: id,
    _category_id: values.category_id,
    _title: values.title,
    _content: values.content,
    _is_pinned: values.is_pinned,
    _is_locked: values.is_locked,
    _is_protected: values.is_protected,
    _image_url: values.image_url,
  });
  if (error) fail("Could not save Forum topic", error);
}

export async function getEmployees(): Promise<NceaEmployee[]> {
  return readRows((from, to) =>
    getSupabase()
      .from("ncea_employees")
      .select("*")
      .order("sort_order")
      .order("name")
      .order("id")
      .range(from, to),
  );
}

export async function saveEmployee(id: string | null, values: EmployeeEditorValues): Promise<void> {
  const query = id
    ? getSupabase().from("ncea_employees").update(values).eq("id", id).select("id").single()
    : getSupabase().from("ncea_employees").insert(values).select("id").single();
  const { error } = await query;
  if (error) fail("Could not save employee", error);
}

export async function setEmployeeActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await getSupabase()
    .from("ncea_employees")
    .update({ is_active: isActive })
    .eq("id", id)
    .select("id")
    .single();
  if (error) fail("Could not update employee visibility", error);
}

export async function updateOwnerForumPost(id: string, body: string): Promise<void> {
  const { error } = await getSupabase().rpc("owner_update_forum_post", {
    _post_id: id,
    _body: body,
  });
  if (error) fail("Could not update Forum post", error);
}

export async function getDeletedContent(kind: "all" | DeletedContentType = "all") {
  const { data, error } = await getSupabase().rpc("get_deleted_content", { _kind: kind });
  if (error) fail("Could not load deleted content", error);
  return (data ?? []) as DeletedItem[];
}

export async function restoreDeletedContent(item: DeletedItem): Promise<void> {
  const { error } = await getSupabase().rpc("restore_deleted_content", {
    _kind: item.content_type,
    _id: item.id,
  });
  if (error) fail("Could not restore content", error);
}

export async function permanentlyDeleteContent(item: DeletedItem): Promise<void> {
  const supabase = getSupabase();
  if (item.content_type === "marketplace" && item.storage_paths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("marketplace-listings")
      .remove(item.storage_paths);
    if (storageError) fail("Could not permanently delete related files", storageError);
  }
  const { error } = await supabase.rpc("permanently_delete_content", {
    _kind: item.content_type,
    _id: item.id,
  });
  if (error) fail("Could not permanently delete content", error);
}

async function count(table: "profiles" | "forum_topics" | "forum_posts" | "marketplace_listings") {
  const query = getSupabase().from(table).select("*", { count: "exact", head: true });
  const { count: result, error } = await (table === "profiles"
    ? query
    : query.is("deleted_at", null));
  if (error) fail(`Could not count ${table}`, error);
  return result ?? 0;
}

export async function getDashboard(): Promise<DashboardData> {
  const [users, topics, listings, userCount, topicCount, postCount, listingCount, published] =
    await Promise.all([
      getUsers(5),
      getTopics(5),
      getListings(5),
      count("profiles"),
      count("forum_topics"),
      count("forum_posts"),
      count("marketplace_listings"),
      getSupabase()
        .from("marketplace_listings")
        .select("*", { count: "exact", head: true })
        .eq("status", "published")
        .is("deleted_at", null),
    ]);
  if (published.error) fail("Could not count published listings", published.error);
  const db = getSupabase();
  const metrics = await Promise.all([
    db
      .from("marketplace_listings")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("status", "pending_review"),
    db
      .from("marketplace_listings")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("status", "archived"),
    db.from("ncea_employees").select("*", { count: "exact", head: true }).is("deleted_at", null),
    db
      .from("ncea_employees")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("is_active", true),
    db
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),
    db
      .from("marketplace_listings")
      .select("*", { count: "exact", head: true })
      .not("deleted_at", "is", null),
    db
      .from("forum_topics")
      .select("*", { count: "exact", head: true })
      .not("deleted_at", "is", null),
    db
      .from("forum_posts")
      .select("*", { count: "exact", head: true })
      .not("deleted_at", "is", null),
  ]);
  for (const result of metrics)
    if (result.error) fail("Could not load dashboard metric", result.error);
  return {
    counts: {
      users: userCount,
      topics: topicCount,
      posts: postCount,
      listings: listingCount,
      published: published.count ?? 0,
      pending: metrics[0].count ?? 0,
      archived: metrics[1].count ?? 0,
      employees: metrics[2].count ?? 0,
      activeEmployees: metrics[3].count ?? 0,
      newUsers: metrics[4].count ?? 0,
      deleted: metrics.slice(5).reduce((sum, result) => sum + (result.count ?? 0), 0),
    },
    users,
    topics,
    listings,
  };
}

export async function checkDatabaseHealth(): Promise<{ ok: boolean; latency: number }> {
  const started = performance.now();
  const { error } = await getSupabase().from("profiles").select("id").limit(1);
  return { ok: !error, latency: Math.round(performance.now() - started) };
}
