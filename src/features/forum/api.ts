import { getSupabaseClient } from "@/lib/supabase";
import type { ForumCategory, ForumPost, ForumTopic } from "@/features/community/types";
import { makeSlug, type TopicValues } from "./schemas";

const topicSelect =
  "*, profiles!forum_topics_author_id_fkey(username, avatar_url), forum_categories(name, slug), forum_posts(count)";

function fail(error: { message: string } | null, fallback: string): never {
  throw new Error(error?.message ?? fallback);
}

export async function getForumCategories() {
  const { data, error } = await getSupabaseClient()
    .from("forum_categories")
    .select("*")
    .order("sort_order")
    .order("name");
  if (error) fail(error, "Не удалось загрузить категории");
  return data as ForumCategory[];
}

export async function getLatestTopics(categoryId?: number) {
  let query = getSupabaseClient()
    .from("forum_topics")
    .select(topicSelect)
    .is("deleted_at", null)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);
  if (categoryId) query = query.eq("category_id", categoryId);
  const { data, error } = await query;
  if (error) fail(error, "Не удалось загрузить темы");
  return data as unknown as ForumTopic[];
}

export async function getForumCategory(slug: string) {
  const { data, error } = await getSupabaseClient()
    .from("forum_categories")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) fail(error, "Категория не найдена");
  return data as ForumCategory;
}

export async function getForumTopic(slug: string) {
  const { data, error } = await getSupabaseClient()
    .from("forum_topics")
    .select(topicSelect)
    .eq("slug", slug)
    .is("deleted_at", null)
    .limit(1)
    .single();
  if (error) fail(error, "Тема не найдена");
  return data as unknown as ForumTopic;
}

export async function getTopicPosts(topicId: string) {
  const { data, error } = await getSupabaseClient()
    .from("forum_posts")
    .select("*, profiles!forum_posts_author_id_fkey(username, avatar_url)")
    .eq("topic_id", topicId)
    .is("deleted_at", null)
    .order("created_at");
  if (error) fail(error, "Не удалось загрузить сообщения");
  return data as unknown as ForumPost[];
}

export async function createTopic(values: TopicValues) {
  const slug = `${makeSlug(values.title)}-${crypto.randomUUID().slice(0, 8)}`;
  const { data, error } = await getSupabaseClient().rpc("create_forum_topic", {
    _category_id: values.categoryId,
    _title: values.title,
    _slug: slug,
    _body: values.body,
  });
  if (error) fail(error, "Не удалось создать тему");
  return { id: data as string, slug };
}

export async function createReply(topicId: string, body: string) {
  const { error } = await getSupabaseClient().rpc("create_forum_reply", {
    _topic_id: topicId,
    _body: body,
  });
  if (error) fail(error, "Не удалось отправить ответ");
}

export async function updateTopic(
  id: string,
  values: { title?: string; is_pinned?: boolean; is_locked?: boolean },
) {
  const { error } = await getSupabaseClient().from("forum_topics").update(values).eq("id", id);
  if (error) fail(error, "Не удалось обновить тему");
}

export async function deleteTopic(id: string) {
  const { error } = await getSupabaseClient().rpc("soft_delete_forum_topic", {
    _topic_id: id,
    _reason: null,
  });
  if (error) fail(error, "Не удалось удалить тему");
}

export async function updatePost(id: string, body: string) {
  const { error } = await getSupabaseClient()
    .from("forum_posts")
    .update({ body: body.trim() })
    .eq("id", id);
  if (error) fail(error, "Не удалось обновить сообщение");
}

export async function deletePost(id: string) {
  const { error } = await getSupabaseClient().rpc("soft_delete_forum_post", {
    _post_id: id,
    _reason: null,
  });
  if (error) fail(error, "Не удалось удалить сообщение");
}
