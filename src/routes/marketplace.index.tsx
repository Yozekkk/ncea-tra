import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Shop } from "iconoir-react";
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
import { BrandMarquee } from "@/components/site/BrandMarquee";
import "@/styles-ncea-redesign.css";

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
  const [search, setSearch] = useState("");
  const [currency, setCurrency] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
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
  const visibleListings = useMemo(
    () =>
      (listings.data ?? []).filter((listing) => {
        const term = search.trim().toLocaleLowerCase("ru");
        if (
          term &&
          !`${listing.title} ${listing.short_description}`.toLocaleLowerCase("ru").includes(term)
        )
          return false;
        if (currency && listing.currency_code !== currency) return false;
        if ((minPrice || maxPrice) && listing.price_amount === null) return false;
        if (minPrice && Number(listing.price_amount) < Number(minPrice)) return false;
        if (maxPrice && Number(listing.price_amount) > Number(maxPrice)) return false;
        return true;
      }),
    [listings.data, search, currency, minPrice, maxPrice],
  );
  const currencies = [...new Set((listings.data ?? []).map((listing) => listing.currency_code))];
  return (
    <CommunityShell>
      <section className="community-section marketplace-experience">
        <CommunityHero
          eyebrow="ПРЕДЛОЖЕНИЯ СООБЩЕСТВА"
          title="Маркетплейс NCEA"
          description="Каталог услуг и объявлений. Оплата и сделки проходят напрямую между участниками."
          actions={
            <div className="community-actions">
              <Link to="/marketplace/my" className="community-button-secondary">
                <Shop />
                Мои объявления
              </Link>
              <MarketplaceCreatePrompt />
            </div>
          }
        />
        <BrandMarquee text="ПЛАГИНЫ • СЕРВЕРЫ • ДИЗАЙН • СБОРКИ • РЕСУРСПАКИ • " compact />
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
        <div className="marketplace-layout">
          <aside className="marketplace-sidebar" aria-label="Фильтры каталога">
            <button
              type="button"
              className="marketplace-filter-toggle"
              aria-controls="marketplace-filter-content"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((open) => !open)}
            >
              Категории и цена <span aria-hidden="true">{filtersOpen ? "−" : "+"}</span>
            </button>
            <div
              id="marketplace-filter-content"
              className={`marketplace-filter-content${filtersOpen ? " is-open" : ""}`}
            >
              <h2>Категории</h2>
              {categories.isLoading ? (
                <LoadingPanel />
              ) : categories.error ? (
                <ErrorPanel message={categories.error.message} />
              ) : (
                <nav className="marketplace-filters" aria-label="Категории">
                  <Link
                    to="/marketplace"
                    search={{ category: undefined, source: sourceParam }}
                    className={!categoryId ? "is-active" : ""}
                  >
                    Все категории
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
                </nav>
              )}
              <div className="marketplace-price-filter">
                <h3>Цена</h3>
                <label>
                  Валюта
                  <select
                    value={currency}
                    onChange={(event) => {
                      setCurrency(event.target.value);
                      setMinPrice("");
                      setMaxPrice("");
                    }}
                  >
                    <option value="">Все валюты</option>
                    {currencies.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="marketplace-price-fields">
                  <label>
                    От
                    <input
                      type="number"
                      min="0"
                      inputMode="decimal"
                      disabled={!currency}
                      value={minPrice}
                      onChange={(event) => setMinPrice(event.target.value)}
                    />
                  </label>
                  <label>
                    До
                    <input
                      type="number"
                      min="0"
                      inputMode="decimal"
                      disabled={!currency}
                      value={maxPrice}
                      onChange={(event) => setMaxPrice(event.target.value)}
                    />
                  </label>
                </div>
                {!currency ? (
                  <p className="marketplace-price-hint">Выберите валюту для диапазона.</p>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setCurrency("");
                    setMinPrice("");
                    setMaxPrice("");
                    setSearch("");
                  }}
                >
                  Сбросить фильтры
                </button>
              </div>
            </div>
          </aside>
          <div className="marketplace-results">
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
            <label className="marketplace-search">
              <Search aria-hidden="true" />
              <span className="sr-only">Поиск объявлений</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Найти товар или услугу"
              />
            </label>
            {listings.isLoading ? (
              <div
                className="marketplace-skeleton-grid"
                role="status"
                aria-label="Загрузка предложений"
              >
                {Array.from({ length: 8 }, (_, index) => (
                  <span key={index} />
                ))}
              </div>
            ) : listings.error ? (
              <ErrorPanel message={listings.error.message} />
            ) : visibleListings.length ? (
              <ListingGrid listings={visibleListings} />
            ) : (
              <div className="community-state">
                <strong>Предложений не найдено</strong>
                <span>Попробуйте другой запрос или сбросьте фильтры.</span>
              </div>
            )}
          </div>
        </div>
      </section>
    </CommunityShell>
  );
}
