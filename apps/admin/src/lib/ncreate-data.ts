import type { TablesInsert, TablesUpdate } from "./database.types";
import { getSupabase } from "./supabase";
import type {
  NCreateCard,
  NCreateForumCategory,
  NCreatePostView,
  NCreateSection,
  NCreateSettings,
  NCreateTopicView,
} from "./types";

function fail(message: string, error: { message: string } | null): never {
  throw new Error(error ? `${message}: ${error.message}` : message);
}

export async function getNCreateDashboard() {
  const supabase = getSupabase();
  const [settings, categories, topics, posts, sections] = await Promise.all([
    supabase.from("ncreate_site_settings").select("*").eq("site_id", "ncreate").single(),
    supabase.from("ncreate_forum_categories").select("*", { count: "exact", head: true }),
    supabase.from("ncreate_forum_topics").select("*", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("ncreate_forum_posts").select("*", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("ncreate_home_sections").select("*", { count: "exact", head: true }),
  ]);
  const error = settings.error || categories.error || topics.error || posts.error || sections.error;
  if (error) fail("Could not load NCreate dashboard", error);
  return {
    settings: settings.data,
    counts: { categories: categories.count ?? 0, topics: topics.count ?? 0, posts: posts.count ?? 0, sections: sections.count ?? 0 },
  };
}

export async function getNCreateSettings(): Promise<NCreateSettings> {
  const { data, error } = await getSupabase().from("ncreate_site_settings").select("*").eq("site_id", "ncreate").single();
  if (error) fail("Could not load NCreate settings", error);
  return data;
}

export async function saveNCreateSettings(values: TablesUpdate<"ncreate_site_settings">) {
  const { error } = await getSupabase().from("ncreate_site_settings").update(values).eq("site_id", "ncreate").select("site_id").single();
  if (error) fail("Could not save NCreate settings", error);
}

export async function getNCreateSections(): Promise<NCreateSection[]> {
  const { data, error } = await getSupabase().from("ncreate_home_sections").select("*").order("sort_order").order("id");
  if (error) fail("Could not load NCreate sections", error);
  return data;
}

export async function saveNCreateSection(id: number | null, values: TablesInsert<"ncreate_home_sections">) {
  const query = id ? getSupabase().from("ncreate_home_sections").update(values).eq("id", id) : getSupabase().from("ncreate_home_sections").insert(values);
  const { error } = await query;
  if (error) fail("Could not save NCreate section", error);
}

export async function getNCreateCards(): Promise<NCreateCard[]> {
  const { data, error } = await getSupabase().from("ncreate_home_cards").select("*").order("sort_order").order("id");
  if (error) fail("Could not load NCreate cards", error);
  return data;
}

export async function saveNCreateCard(id: number | null, values: TablesInsert<"ncreate_home_cards">) {
  const query = id ? getSupabase().from("ncreate_home_cards").update(values).eq("id", id) : getSupabase().from("ncreate_home_cards").insert(values);
  const { error } = await query;
  if (error) fail("Could not save NCreate card", error);
}

export async function getNCreateCategories(): Promise<NCreateForumCategory[]> {
  const { data, error } = await getSupabase().from("ncreate_forum_categories").select("*").order("sort_order").order("id");
  if (error) fail("Could not load NCreate categories", error);
  return data;
}

export async function saveNCreateCategory(id: number | null, values: TablesInsert<"ncreate_forum_categories">) {
  const query = id ? getSupabase().from("ncreate_forum_categories").update(values).eq("id", id) : getSupabase().from("ncreate_forum_categories").insert(values);
  const { error } = await query.select("id").single();
  if (error?.code === "23505") throw new Error("Категория с таким slug уже существует.");
  if (error) fail("Could not save NCreate category", error);
}

export async function deleteNCreateCategory(id: number) {
  const { error } = await getSupabase().from("ncreate_forum_categories").delete().eq("id", id).select("id").single();
  if (error?.code === "23503") {
    throw new Error("Нельзя удалить категорию, пока к ней относятся темы. Сначала скройте её.");
  }
  if (error) fail("Could not delete NCreate category", error);
}

export async function reorderNCreateCategories(ids: number[]) {
  const results = await Promise.all(ids.map((id, index) => getSupabase().from("ncreate_forum_categories").update({ sort_order: (index + 1) * 10 }).eq("id", id).select("id").single()));
  const error = results.find((result) => result.error)?.error ?? null;
  if (error) fail("Could not reorder NCreate categories", error);
}

export async function getNCreateTopics(): Promise<NCreateTopicView[]> {
  const { data, error } = await getSupabase().from("ncreate_forum_topics").select("*, profiles!ncreate_forum_topics_author_id_fkey(username), ncreate_forum_categories(name)").is("deleted_at", null).order("is_pinned", { ascending: false }).order("created_at", { ascending: false }).limit(200);
  if (error) fail("Could not load NCreate topics", error);
  return (data ?? []).map(({ profiles, ncreate_forum_categories, ...topic }) => ({ ...topic, author: profiles?.username ?? "Unknown", category: ncreate_forum_categories?.name ?? "Unknown" }));
}

export async function getNCreatePosts(): Promise<NCreatePostView[]> {
  const { data, error } = await getSupabase().from("ncreate_forum_posts").select("*, profiles!ncreate_forum_posts_author_id_fkey(username), ncreate_forum_topics(title)").is("deleted_at", null).order("created_at", { ascending: false }).limit(200);
  if (error) fail("Could not load NCreate posts", error);
  return (data ?? []).map(({ profiles, ncreate_forum_topics, ...post }) => ({ ...post, author: profiles?.username ?? "Unknown", topic: ncreate_forum_topics?.title ?? "Unknown" }));
}

export async function updateNCreateTopic(id: string, values: TablesUpdate<"ncreate_forum_topics">) {
  const { error } = await getSupabase().from("ncreate_forum_topics").update(values).eq("id", id).select("id").single();
  if (error) fail("Could not update NCreate topic", error);
}

async function currentUserId() {
  const { data, error } = await getSupabase().auth.getUser();
  if (error || !data.user) throw new Error("Administrator session is unavailable");
  return data.user.id;
}

export async function deleteNCreateTopic(id: string) {
  const userId = await currentUserId();
  await updateNCreateTopic(id, { deleted_at: new Date().toISOString(), deleted_by: userId, deletion_reason: "Moderated in NCEA Admin / NCreate" });
}

export async function updateNCreatePost(id: string, values: TablesUpdate<"ncreate_forum_posts">) {
  const { error } = await getSupabase().from("ncreate_forum_posts").update(values).eq("id", id).select("id").single();
  if (error) fail("Could not update NCreate post", error);
}

export async function deleteNCreatePost(id: string) {
  const userId = await currentUserId();
  await updateNCreatePost(id, { deleted_at: new Date().toISOString(), deleted_by: userId, deletion_reason: "Moderated in NCEA Admin / NCreate" });
}
