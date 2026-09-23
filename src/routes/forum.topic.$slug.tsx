import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Lock, Pin } from "lucide-react";
import { CommunityShell, ErrorPanel, LoadingPanel } from "@/features/community/CommunityShell";
import { getForumTopic, getTopicPosts } from "@/features/forum/api";
import { forumKeys, PostCard, ReplyComposer, TopicActions } from "@/features/forum/components";

export const Route = createFileRoute("/forum/topic/$slug")({
  head: () => ({ meta: [{ title: "Тема форума — NCEA" }] }),
  component: ForumTopicPage,
});

function ForumTopicPage() {
  const { slug } = Route.useParams();
  const topic = useQuery({ queryKey: forumKeys.topic(slug), queryFn: () => getForumTopic(slug) });
  const posts = useQuery({
    queryKey: forumKeys.posts(topic.data?.id ?? "pending"),
    queryFn: () => getTopicPosts(topic.data!.id),
    enabled: Boolean(topic.data),
  });
  if (topic.isLoading)
    return (
      <CommunityShell>
        <LoadingPanel />
      </CommunityShell>
    );
  if (topic.error || !topic.data)
    return (
      <CommunityShell>
        <ErrorPanel message={topic.error?.message ?? "Тема не найдена"} />
      </CommunityShell>
    );
  const currentTopic = topic.data;
  return (
    <CommunityShell>
      <section className="community-section topic-page">
        <Link to="/forum" className="back-link">
          <ChevronLeft />
          Форум
        </Link>
        <header className="topic-header">
          <div className="topic-flags">
            {topic.data.is_pinned ? (
              <span>
                <Pin />
                Закреплено
              </span>
            ) : null}
            {topic.data.is_locked ? (
              <span>
                <Lock />
                Закрыто
              </span>
            ) : null}
          </div>
          <h1>{topic.data.title}</h1>
          <p>
            {topic.data.forum_categories?.name} · автор{" "}
            {topic.data.profiles?.username ?? "Участник NCEA"}
          </p>
          <TopicActions topic={topic.data} />
        </header>
        {posts.isLoading ? (
          <LoadingPanel />
        ) : posts.error ? (
          <ErrorPanel message={posts.error.message} />
        ) : (
          <div className="post-list">
            {posts.data?.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} topic={currentTopic} />
            ))}
          </div>
        )}
        <ReplyComposer topic={currentTopic} />
      </section>
    </CommunityShell>
  );
}
