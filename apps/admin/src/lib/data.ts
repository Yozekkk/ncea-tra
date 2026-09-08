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

export async function getUsers(limit = 200): Promise<AdminUser[]> {
  const supabase = getSupabase();
  const [{ data: profiles, error: profileError }, { data: roles, error: roleError }] =
    await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(limit),
      supabase.from("user_roles").select("user_id, role"),
    ]);
  if (profileError) fail("Could not load users", profileError);
  if (roleError) fail("Could not load roles", roleError);
  const roleByUser = new Map((roles ?? []).map((item) => [item.user_id, item.role]));
  return (profiles ?? []).map((profile) => ({
    ...profile,
    role: roleByUser.get(profile.id) ?? "user",
  }));
}

export async function setUserRole(userId: string, role: AppRole): Promise<void> {
  const { error } = await getSupabase().from("user_roles").update({ role }).eq("user_id", userId);
  if (error) fail("Could not update role", error);
}

export async function getTopics(limit = 200): Promise<TopicView[]> {
  const { data, error } = await getSupabase()
    .from("forum_topics")
    .select("*, profiles(username), forum_categories(name)")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) fail("Could not load forum topics", error);
  return (data ?? []).map(({ profiles, forum_categories, ...topic }) => ({
    ...topic,
    author: profiles?.username ?? "Unknown",
    category: forum_categories?.name ?? "Unknown",
  }));
}

export async function getPosts(limit = 200): Promise<PostView[]> {
  const { data, error } = await getSupabase()
    .from("forum_posts")
    .select("*, profiles(username), forum_topics(title)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) fail("Could not load forum posts", error);
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
  const { error } = await query;
  if (error) fail("Could not save forum category", error);
}

export async function updateTopic(id: string, values: TablesUpdate<"forum_topics">): Promise<void> {
  const { error } = await getSupabase().from("forum_topics").update(values).eq("id", id);
  if (error) fail("Could not update topic", error);
}

export async function deleteTopic(id: string): Promise<void> {
  const { error } = await getSupabase().from("forum_topics").delete().eq("id", id);
  if (error) fail("Could not delete topic", error);
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await getSupabase().from("forum_posts").delete().eq("id", id);
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
  const { error } = await query;
  if (error) fail("Could not save marketplace category", error);
}

export async function getListings(limit = 200): Promise<ListingView[]> {
  const { data, error } = await getSupabase()
    .from("marketplace_listings")
    .select("*, profiles(username), marketplace_categories(name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) fail("Could not load listings", error);
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
    .eq("id", id);
  if (error) fail("Could not update listing status", error);
}

export async function deleteListing(id: string): Promise<void> {
  const supabase = getSupabase();
  const { data: images, error: imageError } = await supabase
    .from("marketplace_listing_images")
    .select("storage_path")
    .eq("listing_id", id);
  if (imageError) fail("Could not load listing images before deletion", imageError);

  const storagePaths = (images ?? []).map((image) => image.storage_path);
  if (storagePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("marketplace-listings")
      .remove(storagePaths);
    if (storageError) fail("Could not delete listing images", storageError);
  }

  const { error } = await supabase.from("marketplace_listings").delete().eq("id", id);
  if (error) fail("Could not delete listing", error);
}

async function count(table: "profiles" | "forum_topics" | "forum_posts" | "marketplace_listings") {
  const { count: result, error } = await getSupabase()
    .from(table)
    .select("*", { count: "exact", head: true });
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
        .eq("status", "published"),
    ]);
  if (published.error) fail("Could not count published listings", published.error);
  return {
    counts: {
      users: userCount,
      topics: topicCount,
      posts: postCount,
      listings: listingCount,
      published: published.count ?? 0,
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
