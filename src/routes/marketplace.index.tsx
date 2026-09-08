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
import { StreakCard } from "@/features/streak/components";

export const Route = createFileRoute("/marketplace/")({
  validateSearch: (search: Record<string, unknown>): { category?: string } =>
    typeof search.category === "string" ? { category: search.category } : {},
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
  const { category: categorySlug } = Route.useSearch();
  const categories = useQuery({
    queryKey: marketplaceKeys.categories,
    queryFn: getMarketplaceCategories,
  });
  const categoryId = categories.data?.find((item) => item.slug === categorySlug)?.id;
  const listings = useQuery({
    queryKey: marketplaceKeys.published(categoryId),
    queryFn: () => getPublishedListings(categoryId),
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
        <StreakCard compact />
        {categories.isLoading ? (
          <LoadingPanel />
        ) : categories.error ? (
          <ErrorPanel message={categories.error.message} />
        ) : (
          <div className="marketplace-filters">
            <span>Категории:</span>
            <Link
              to="/marketplace"
              search={{ category: undefined }}
              className={!categoryId ? "is-active" : ""}
            >
              Все
            </Link>
            {categories.data?.map((category) => (
              <Link
                to="/marketplace"
                search={{ category: category.slug }}
                className={categoryId === category.id ? "is-active" : ""}
                key={category.id}
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
        <div className="community-subheading">
          <div>
            <span>ВИТРИНА СООБЩЕСТВА</span>
            <h2>От пользователей</h2>
          </div>
          <p>Активные авторы с серией от трёх дней поднимаются выше в динамической выдаче.</p>
        </div>
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
