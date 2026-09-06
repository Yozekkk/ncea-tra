import {
  FileText,
  MessageSquare,
  PackageCheck,
  ShoppingBag,
  Users,
  type LucideIcon,
} from "lucide-react";
import { getDashboard } from "../lib/data";
import { formatDate } from "../lib/format";
import { useAsync } from "../lib/useAsync";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "../components/ui";

export function Dashboard() {
  const state = useAsync(getDashboard);
  const metrics: Array<[string, number, LucideIcon]> = state.data
    ? [
        ["Users", state.data.counts.users, Users],
        ["Forum topics", state.data.counts.topics, MessageSquare],
        ["Forum posts", state.data.counts.posts, FileText],
        ["Listings", state.data.counts.listings, ShoppingBag],
        ["Published", state.data.counts.published, PackageCheck],
      ]
    : [];
  return (
    <>
      <PageHeader title="Dashboard" description="Live platform activity from the NCEA database." />
      {state.loading && <LoadingState />}
      {state.error && <ErrorState message={state.error} retry={state.reload} />}
      {state.data && (
        <>
          <section className="metric-grid">
            {metrics.map(([label, value, Icon]) => (
              <article className="metric-card" key={String(label)}>
                <Icon size={19} />
                <span>{label}</span>
                <strong>{String(value).padStart(2, "0")}</strong>
              </article>
            ))}
          </section>
          <section className="dashboard-grid">
            <DashboardList title="Latest users" empty="No users yet">
              {state.data.users.map((user) => (
                <div className="list-row" key={user.id}>
                  <div>
                    <strong>@{user.username}</strong>
                    <span>{user.display_name || "No display name"}</span>
                  </div>
                  <time>{formatDate(user.created_at)}</time>
                </div>
              ))}
            </DashboardList>
            <DashboardList title="Latest topics" empty="No forum topics yet">
              {state.data.topics.map((topic) => (
                <div className="list-row" key={topic.id}>
                  <div>
                    <strong>{topic.title}</strong>
                    <span>
                      {topic.category} · @{topic.author}
                    </span>
                  </div>
                  <time>{formatDate(topic.created_at)}</time>
                </div>
              ))}
            </DashboardList>
            <DashboardList title="Latest listings" empty="No marketplace listings yet">
              {state.data.listings.map((listing) => (
                <div className="list-row" key={listing.id}>
                  <div>
                    <strong>{listing.title}</strong>
                    <span>
                      {listing.category} · {listing.status}
                    </span>
                  </div>
                  <time>{formatDate(listing.created_at)}</time>
                </div>
              ))}
            </DashboardList>
          </section>
        </>
      )}
    </>
  );
}

function DashboardList({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode;
}) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <article className="panel">
      <div className="panel-title">
        <h2>{title}</h2>
        <span>RECENT 5</span>
      </div>
      {hasChildren ? (
        <div className="compact-list">{children}</div>
      ) : (
        <EmptyState title={empty} detail="New activity will appear here." />
      )}
    </article>
  );
}
