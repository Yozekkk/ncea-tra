import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/features/auth/AuthProvider";
import {
  CommunityHero,
  CommunityShell,
  ErrorPanel,
  LoadingPanel,
} from "@/features/community/CommunityShell";
import { LoginPrompt } from "@/features/forum/components";
import { getListing, getMarketplaceCategories } from "@/features/marketplace/api";
import {
  ListingForm,
  ListingImageManager,
  marketplaceKeys,
} from "@/features/marketplace/components";

export const Route = createFileRoute("/marketplace/$slug/edit")({
  head: () => ({
    meta: [{ title: "Редактировать объявление — NCEA" }, { name: "robots", content: "noindex" }],
  }),
  component: EditListingPage,
});
function EditListingPage() {
  const { slug } = Route.useParams();
  const auth = useAuth();
  const listing = useQuery({
    queryKey: marketplaceKeys.listing(slug),
    queryFn: () => getListing(slug),
    enabled: auth.ready,
  });
  const categories = useQuery({
    queryKey: marketplaceKeys.categories,
    queryFn: getMarketplaceCategories,
  });
  if (!auth.ready || listing.isLoading || categories.isLoading)
    return (
      <CommunityShell>
        <LoadingPanel />
      </CommunityShell>
    );
  if (!auth.user)
    return (
      <CommunityShell>
        <section className="community-section">
          <LoginPrompt action="изменить объявление" redirect={`/marketplace/${slug}/edit`} />
        </section>
      </CommunityShell>
    );
  if (listing.error || categories.error || !listing.data)
    return (
      <CommunityShell>
        <ErrorPanel
          message={listing.error?.message ?? categories.error?.message ?? "Объявление не найдено"}
        />
      </CommunityShell>
    );
  if (listing.data.seller_id !== auth.user.id)
    return (
      <CommunityShell>
        <ErrorPanel message="Это объявление принадлежит другому пользователю" />
      </CommunityShell>
    );
  return (
    <CommunityShell>
      <section className="community-section">
        <Link to="/marketplace/$slug" params={{ slug }} className="back-link">
          <ChevronLeft />К объявлению
        </Link>
        <CommunityHero
          eyebrow="РЕДАКТИРОВАНИЕ"
          title={listing.data.title}
          description="Сохранение опубликованного объявления вернёт его в черновики."
        />
        <ListingImageManager listing={listing.data} />
        <ListingForm categories={categories.data ?? []} listing={listing.data} />
      </section>
    </CommunityShell>
  );
}
