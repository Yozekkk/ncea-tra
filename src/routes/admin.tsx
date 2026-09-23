import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Archive, Lock, Pin, Shield, Trash2, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/AuthProvider";
import {
  CommunityHero,
  CommunityShell,
  ErrorPanel,
  LoadingPanel,
} from "@/features/community/CommunityShell";
import type { ForumPost, MarketplaceListing } from "@/features/community/types";
import { deletePost, getLatestTopics, updateTopic } from "@/features/forum/api";
import { formatCommunityDate, forumKeys } from "@/features/forum/components";
import { marketplaceKeys } from "@/features/marketplace/components";
import { getSupabaseClient } from "@/lib/supabase";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Модерация — NCEA" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AdminPage,
});

async function getAdminListings() {
  const { data, error } = await getSupabaseClient()
    .from("marketplace_listings")
    .select(
      "*, profiles!marketplace_listings_seller_id_fkey(username), marketplace_categories(name,slug)",
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data as unknown as MarketplaceListing[];
}

async function setListingStatus(id: string, status: MarketplaceListing["status"]) {
  const { error } = await getSupabaseClient()
    .from("marketplace_listings")
    .update({ status })
    .eq("id", id)
    .select("id")
    .single();
  if (error) throw error;
}

type AdminPost = ForumPost & { forum_topics?: { title: string; slug: string } | null };

async function getAdminPosts() {
  const { data, error } = await getSupabaseClient()
    .from("forum_posts")
    .select("*, profiles!forum_posts_author_id_fkey(username), forum_topics(title,slug)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data as unknown as AdminPost[];
}

function AdminWorkspace() {
  const queryClient = useQueryClient();
  const topics = useQuery({ queryKey: ["admin", "topics"], queryFn: () => getLatestTopics() });
  const posts = useQuery({ queryKey: ["admin", "posts"], queryFn: getAdminPosts });
  const listings = useQuery({ queryKey: ["admin", "listings"], queryFn: getAdminListings });
  const topicMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Parameters<typeof updateTopic>[1] }) =>
      updateTopic(id, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "topics"] });
      await queryClient.invalidateQueries({ queryKey: forumKeys.all });
    },
  });
  const postMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
      await queryClient.invalidateQueries({ queryKey: forumKeys.all });
    },
  });
  const listingMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: MarketplaceListing["status"] }) =>
      setListingStatus(id, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "listings"] }),
        queryClient.invalidateQueries({ queryKey: marketplaceKeys.all }),
      ]);
    },
  });
  return (
    <>
      <div className="admin-section">
        <h2>Темы форума</h2>
        {topicMutation.error ? <ErrorPanel message={topicMutation.error.message} /> : null}
        {topics.isLoading ? (
          <LoadingPanel />
        ) : topics.error ? (
          <ErrorPanel message={topics.error.message} />
        ) : (
          <div className="admin-list">
            {topics.data?.map((topic) => (
              <article key={topic.id}>
                <div>
                  <Link to="/forum/topic/$slug" params={{ slug: topic.slug }}>
                    <strong>{topic.title}</strong>
                  </Link>
                  <p>
                    {topic.profiles?.username} · {formatCommunityDate(topic.created_at)}
                  </p>
                </div>
                <div className="community-actions">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      topicMutation.mutate({
                        id: topic.id,
                        values: { is_pinned: !topic.is_pinned },
                      })
                    }
                  >
                    <Pin />
                    {topic.is_pinned ? "Открепить" : "Закрепить"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      topicMutation.mutate({
                        id: topic.id,
                        values: { is_locked: !topic.is_locked },
                      })
                    }
                  >
                    {topic.is_locked ? <Unlock /> : <Lock />}
                    {topic.is_locked ? "Открыть" : "Закрыть"}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <div className="admin-section">
        <h2>Сообщения форума</h2>
        {postMutation.error ? <ErrorPanel message={postMutation.error.message} /> : null}
        {posts.isLoading ? (
          <LoadingPanel />
        ) : posts.error ? (
          <ErrorPanel message={posts.error.message} />
        ) : (
          <div className="admin-list">
            {posts.data?.map((post) => (
              <article key={post.id}>
                <div>
                  <Link to="/forum/topic/$slug" params={{ slug: post.forum_topics?.slug ?? "" }}>
                    <strong>{post.forum_topics?.title ?? "Тема форума"}</strong>
                  </Link>
                  <p>
                    {post.profiles?.username} · {formatCommunityDate(post.created_at)}
                  </p>
                  <p>{post.body.slice(0, 180)}</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    window.confirm("Удалить это сообщение?") && postMutation.mutate(post.id)
                  }
                >
                  <Trash2 />
                  Удалить
                </Button>
              </article>
            ))}
          </div>
        )}
      </div>
      <div className="admin-section">
        <h2>Объявления</h2>
        {listingMutation.error ? <ErrorPanel message={listingMutation.error.message} /> : null}
        {listings.isLoading ? (
          <LoadingPanel />
        ) : listings.error ? (
          <ErrorPanel message={listings.error.message} />
        ) : (
          <div className="admin-list">
            {listings.data?.map((listing) => (
              <article key={listing.id}>
                <div>
                  <Link to="/marketplace/$slug" params={{ slug: listing.slug }}>
                    <strong>{listing.title}</strong>
                  </Link>
                  <p>
                    {listing.profiles?.username} · {listing.status} ·{" "}
                    {formatCommunityDate(listing.created_at)}
                  </p>
                </div>
                <div className="community-actions">
                  {listing.status !== "published" ? (
                    <Button
                      size="sm"
                      onClick={() =>
                        listingMutation.mutate({ id: listing.id, status: "published" })
                      }
                    >
                      Опубликовать
                    </Button>
                  ) : null}
                  {listing.status !== "archived" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => listingMutation.mutate({ id: listing.id, status: "archived" })}
                    >
                      <Archive />В архив
                    </Button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function AdminPage() {
  const auth = useAuth();
  if (!auth.ready)
    return (
      <CommunityShell>
        <LoadingPanel />
      </CommunityShell>
    );
  if (!auth.user)
    return (
      <CommunityShell>
        <section className="community-section">
          <div className="community-state">
            <Shield />
            <strong>Войдите с аккаунтом владельца</strong>
            <Link to="/login" search={{ redirect: "/admin" }} className="community-button">
              Войти
            </Link>
          </div>
        </section>
      </CommunityShell>
    );
  if (!auth.isAdmin)
    return (
      <CommunityShell>
        <section className="community-section">
          <ErrorPanel message="Для этой страницы требуется роль admin" />
        </section>
      </CommunityShell>
    );
  return (
    <CommunityShell>
      <section className="community-section">
        <CommunityHero
          eyebrow="ЗАЩИЩЁННАЯ ЗОНА"
          title="Модерация NCEA"
          description="Forum и Marketplace используют тот же аккаунт и canonical role из user_roles."
        />
        <AdminWorkspace />
      </section>
    </CommunityShell>
  );
}
