import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle } from "lucide-react";
import {
  CommunityHero,
  CommunityShell,
  ErrorPanel,
  LoadingPanel,
} from "@/features/community/CommunityShell";
import { getForumCategories, getLatestTopics } from "@/features/forum/api";
import { forumKeys, TopicComposer, TopicList } from "@/features/forum/components";

export const Route = createFileRoute("/forum/")({
  head: () => ({
    meta: [
      { title: "Форум — NCEA" },
      {
        name: "description",
        content: "Обсуждения Minecraft-разработки, дизайна и проектов сообщества NCEA.",
      },
    ],
  }),
  component: ForumPage,
});

function ForumPage() {
  const categories = useQuery({ queryKey: forumKeys.categories, queryFn: getForumCategories });
  const topics = useQuery({ queryKey: forumKeys.topics(), queryFn: () => getLatestTopics() });
  return (
    <CommunityShell>
      <section className="community-section">
        <CommunityHero
          eyebrow="СООБЩЕСТВО"
          title="Форум NCEA"
          description="Обсуждайте разработку, показывайте проекты и находите команду. Читать можно без аккаунта."
        />
        {categories.isLoading ? (
          <LoadingPanel />
        ) : categories.error ? (
          <ErrorPanel message={categories.error.message} />
        ) : (
          <>
            <div className="category-grid">
              {categories.data?.map((category) => (
                <Link
                  key={category.id}
                  to="/forum/category/$slug"
                  params={{ slug: category.slug }}
                  className="category-card"
                >
                  <span className="activity-rail" aria-hidden="true" />
                  <MessageCircle aria-hidden="true" />
                  <h2>{category.name}</h2>
                  <p>{category.description}</p>
                  <span className="card-link">
                    Открыть <ArrowRight />
                  </span>
                </Link>
              ))}
            </div>
            <TopicComposer categories={categories.data ?? []} />
          </>
        )}
        <div className="community-section-heading">
          <div>
            <p className="ref-eyebrow">СВЕЖИЕ ОБСУЖДЕНИЯ</p>
            <h2>Последние темы</h2>
          </div>
        </div>
        {topics.isLoading ? (
          <LoadingPanel />
        ) : topics.error ? (
          <ErrorPanel message={topics.error.message} />
        ) : (
          <TopicList topics={topics.data ?? []} />
        )}
      </section>
    </CommunityShell>
  );
}
