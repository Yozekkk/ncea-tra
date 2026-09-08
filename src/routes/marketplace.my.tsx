import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useAuth } from "@/features/auth/AuthProvider";
import {
  CommunityHero,
  CommunityShell,
  ErrorPanel,
  LoadingPanel,
} from "@/features/community/CommunityShell";
import { LoginPrompt } from "@/features/forum/components";
import { getMyListings } from "@/features/marketplace/api";
import { ListingGrid, marketplaceKeys } from "@/features/marketplace/components";
import { StreakCard } from "@/features/streak/components";

export const Route = createFileRoute("/marketplace/my")({
  head: () => ({
    meta: [{ title: "Мои объявления — NCEA" }, { name: "robots", content: "noindex" }],
  }),
  component: MyListingsPage,
});
function MyListingsPage() {
  const auth = useAuth();
  const listings = useQuery({
    queryKey: marketplaceKeys.mine(auth.user?.id ?? "guest"),
    queryFn: () => getMyListings(auth.user!.id),
    enabled: Boolean(auth.user),
  });
  if (!auth.ready)
    return (
      <CommunityShell>
        <LoadingPanel />
      </CommunityShell>
    );
  if (!auth.user)
    return (
      <CommunityShell>
        <section className="community-section">
          <LoginPrompt action="управлять объявлениями" redirect="/marketplace/my" />
        </section>
      </CommunityShell>
    );
  return (
    <CommunityShell>
      <section className="community-section">
        <CommunityHero
          eyebrow="ЛИЧНЫЙ КАБИНЕТ"
          title="Мои объявления"
          description="Черновики, опубликованные предложения и архив."
          actions={
            <Link to="/marketplace/new" className="community-button">
              <Plus />
              Создать
            </Link>
          }
        />
        <StreakCard compact />
        {listings.isLoading ? (
          <LoadingPanel />
        ) : listings.error ? (
          <ErrorPanel message={listings.error.message} />
        ) : (
          <ListingGrid listings={listings.data ?? []} ownerView />
        )}
      </section>
    </CommunityShell>
  );
}
