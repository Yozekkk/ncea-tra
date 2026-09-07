import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Store } from "lucide-react";
import {
  CommunityHero,
  CommunityShell,
  ErrorPanel,
  LoadingPanel,
} from "@/features/community/CommunityShell";
import { getMarketplaceCategories, getPublishedListings } from "@/features/marketplace/api";
import {
  ListingGrid,
  MarketplaceCreatePrompt,
  marketplaceKeys,
} from "@/features/marketplace/components";

export const Route = createFileRoute("/marketplace/")({
  head: () => ({
    meta: [
      { title: "Маркетплейс — NCEA" },
      {
        name: "description",
        content: "Объявления и услуги сообщества NCEA без встроенных платежей.",
      },
    ],
  }),
  component: MarketplacePage,
});

function MarketplacePage() {
  const categories = useQuery({
    queryKey: marketplaceKeys.categories,
    queryFn: getMarketplaceCategories,
  });
  const listings = useQuery({
    queryKey: marketplaceKeys.published(),
    queryFn: () => getPublishedListings(),
  });
  return (
    <CommunityShell>
      <section className="community-section">
        <CommunityHero
          eyebrow="ПРЕДЛОЖЕНИЯ СООБЩЕСТВА"
          title="Маркетплейс NCEA"
          description="Каталог услуг и объявлений. Оплата и сделки проходят напрямую между участниками."
          actions={
            <div className="community-actions">
              <Link to="/marketplace/my" className="community-button-secondary">
                <Store />
                Мои объявления
              </Link>
              <MarketplaceCreatePrompt />
            </div>
          }
        />
        {categories.isLoading ? (
          <LoadingPanel />
        ) : categories.error ? (
          <ErrorPanel message={categories.error.message} />
        ) : (
          <div className="marketplace-filters">
            <span>Категории:</span>
            {categories.data?.map((category) => (
              <span key={category.id}>{category.name}</span>
            ))}
          </div>
        )}
        {listings.isLoading ? (
          <LoadingPanel />
        ) : listings.error ? (
          <ErrorPanel message={listings.error.message} />
        ) : (
          <ListingGrid listings={listings.data ?? []} />
        )}
      </section>
    </CommunityShell>
  );
}
