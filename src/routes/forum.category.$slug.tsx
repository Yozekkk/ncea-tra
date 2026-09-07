import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import {
  CommunityHero,
  CommunityShell,
  ErrorPanel,
  LoadingPanel,
} from "@/features/community/CommunityShell";
import { getForumCategory, getLatestTopics } from "@/features/forum/api";
import { forumKeys, TopicComposer, TopicList } from "@/features/forum/components";

export const Route = createFileRoute("/forum/category/$slug")({
  head: () => ({ meta: [{ title: "Категория форума — NCEA" }] }),
  component: ForumCategoryPage,
});

function ForumCategoryPage() {
  const { slug } = Route.useParams();
  const category = useQuery({
    queryKey: ["forum", "category", slug],
    queryFn: () => getForumCategory(slug),
  });
  const topics = useQuery({
    queryKey: forumKeys.topics(category.data?.id),
    queryFn: () => getLatestTopics(category.data!.id),
    enabled: Boolean(category.data),
  });
  if (category.isLoading)
    return (
      <CommunityShell>
        <LoadingPanel />
      </CommunityShell>
    );
  if (category.error || !category.data)
    return (
      <CommunityShell>
        <ErrorPanel message={category.error?.message ?? "Категория не найдена"} />
      </CommunityShell>
    );
  return (
    <CommunityShell>
      <section className="community-section">
        <Link to="/forum" className="back-link">
          <ChevronLeft />
          Все категории
        </Link>
        <CommunityHero
          eyebrow="КАТЕГОРИЯ ФОРУМА"
          title={category.data.name}
          description={category.data.description ?? "Обсуждения сообщества NCEA."}
        />
        <TopicComposer categories={[category.data]} initialCategoryId={category.data.id} />
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
