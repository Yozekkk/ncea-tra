import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import {
  CommunityHero,
  CommunityShell,
  ErrorPanel,
  LoadingPanel,
} from "@/features/community/CommunityShell";
import { getMarketplaceCategories } from "@/features/marketplace/api";
import { ListingForm, marketplaceKeys } from "@/features/marketplace/components";

export const Route = createFileRoute("/marketplace/new")({
  head: () => ({ meta: [{ title: "Создать объявление — NCEA" }] }),
  component: NewListingPage,
});
function NewListingPage() {
  const categories = useQuery({
    queryKey: marketplaceKeys.categories,
    queryFn: getMarketplaceCategories,
  });
  return (
    <CommunityShell>
      <section className="community-section">
        <Link to="/marketplace" className="back-link">
          <ChevronLeft />
          Маркетплейс
        </Link>
        <CommunityHero
          eyebrow="НОВОЕ ПРЕДЛОЖЕНИЕ"
          title="Создать объявление"
          description="Сначала сохраните черновик. Администратор опубликует его после проверки."
        />
        {categories.isLoading ? (
          <LoadingPanel />
        ) : categories.error ? (
          <ErrorPanel message={categories.error.message} />
        ) : (
          <ListingForm categories={categories.data ?? []} />
        )}
      </section>
    </CommunityShell>
  );
}
