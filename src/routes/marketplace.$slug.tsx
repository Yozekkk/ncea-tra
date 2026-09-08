import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { CommunityShell, ErrorPanel, LoadingPanel } from "@/features/community/CommunityShell";
import { getListing } from "@/features/marketplace/api";
import {
  formatListingPrice,
  ListingOwnerActions,
  marketplaceKeys,
  StatusBadge,
} from "@/features/marketplace/components";
import { formatCommunityDate } from "@/features/forum/components";

export const Route = createFileRoute("/marketplace/$slug")({
  head: () => ({ meta: [{ title: "Объявление — NCEA Marketplace" }] }),
  component: ListingPage,
});

function ListingPage() {
  const { slug } = Route.useParams();
  const listing = useQuery({
    queryKey: marketplaceKeys.listing(slug),
    queryFn: () => getListing(slug),
  });
  if (listing.isLoading)
    return (
      <CommunityShell>
        <LoadingPanel />
      </CommunityShell>
    );
  if (listing.error || !listing.data)
    return (
      <CommunityShell>
        <ErrorPanel message={listing.error?.message ?? "Объявление не найдено"} />
      </CommunityShell>
    );
  const item = listing.data;
  return (
    <CommunityShell>
      <section className="community-section">
        <Link to="/marketplace" className="back-link">
          <ChevronLeft />
          Маркетплейс
        </Link>
        <article className="listing-detail">
          <div className="listing-gallery">
            {item.marketplace_listing_images?.length ? (
              item.marketplace_listing_images.map((image) =>
                image.signed_url ? (
                  <img
                    key={image.id}
                    src={image.signed_url}
                    alt={image.alt_text ?? item.title}
                    width={1200}
                    height={800}
                  />
                ) : null,
              )
            ) : (
              <div className="listing-placeholder">Изображений пока нет</div>
            )}
          </div>
          <div className="listing-copy">
            <div className="listing-card-kicker">
              <span>{item.marketplace_categories?.name}</span>
              <StatusBadge status={item.status} />
            </div>
            <h1>{item.title}</h1>
            <strong className="listing-price">
              {formatListingPrice(item.price_amount, item.currency_code)}
            </strong>
            <p className="listing-lead">{item.short_description}</p>
            <p className="user-content">{item.description}</p>
            <dl>
              <div>
                <dt>Продавец</dt>
                <dd>{item.profiles?.username ?? "Участник NCEA"}</dd>
              </div>
              <div>
                <dt>Создано</dt>
                <dd>{formatCommunityDate(item.created_at)}</dd>
              </div>
              {item.minecraft_version ? (
                <div>
                  <dt>Версия Minecraft</dt>
                  <dd>{item.minecraft_version}</dd>
                </div>
              ) : null}
              {item.platform ? (
                <div>
                  <dt>Платформа</dt>
                  <dd>{item.platform}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </article>
        <ListingOwnerActions listing={item} />
      </section>
    </CommunityShell>
  );
}
