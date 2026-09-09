import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Store } from "lucide-react";
import {
  CommunityHero,
  CommunityShell,
  ErrorPanel,
  LoadingPanel,
} from "@/features/community/CommunityShell";
import {
  getMarketplaceCategories,
  getPublishedListings,
  type MarketplaceSourceFilter,
} from "@/features/marketplace/api";
import {
  ListingGrid,
  MarketplaceCreatePrompt,
  marketplaceKeys,
} from "@/features/marketplace/components";
import { StreakCard } from "@/features/streak/components";

export const Route = createFileRoute("/marketplace/")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { category?: string; source?: Exclude<MarketplaceSourceFilter, "all"> } => ({
    ...(typeof search.category === "string" ? { category: search.category } : {}),
    ...(search.source === "agency" || search.source === "user" ? { source: search.source } : {}),
  }),
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
  const { category: categorySlug, source: sourceParam } = Route.useSearch();
  const source: MarketplaceSourceFilter = sourceParam ?? "all";
  const categories = useQuery({
    queryKey: marketplaceKeys.categories,
    queryFn: getMarketplaceCategories,
  });
  const categoryId = categories.data?.find((item) => item.slug === categorySlug)?.id;
  const listings = useQuery({
    queryKey: marketplaceKeys.published(categoryId, source),
    queryFn: () => getPublishedListings(categoryId, source),
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
        <nav className="marketplace-source-filters" aria-label="Источник предложений">
          {(
            [
              ["all", "Все"],
              ["agency", "От агентства"],
              ["user", "От пользователей"],
            ] as const
          ).map(([value, label]) => (
            <Link
              key={value}
              to="/marketplace"
              search={{
                category: categorySlug,
                source: value === "all" ? undefined : value,
              }}
              className={source === value ? "is-active" : ""}
              aria-current={source === value ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        {categories.isLoading ? (
          <LoadingPanel />
        ) : categories.error ? (
          <ErrorPanel message={categories.error.message} />
        ) : (
          <div className="marketplace-filters">
            <span>Категории:</span>
            <Link
              to="/marketplace"
              search={{ category: undefined, source: sourceParam }}
              className={!categoryId ? "is-active" : ""}
            >
              Все
            </Link>
            {categories.data?.map((category) => (
              <Link
                to="/marketplace"
                search={{ category: category.slug, source: sourceParam }}
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
            <h2>
              {source === "agency"
                ? "Официальные предложения"
                : source === "user"
                  ? "От пользователей"
                  : "Все предложения"}
            </h2>
          </div>
          <p>
            Сначала решения NCEA, затем товары активных авторов с серией от 3 дней и остальные
            предложения сообщества.
          </p>
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
