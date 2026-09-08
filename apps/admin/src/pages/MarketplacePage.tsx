import { useState, type FormEvent } from "react";
import { Edit3, Plus } from "lucide-react";
import {
  deleteListing,
  getListings,
  getMarketplaceCategories,
  saveMarketplaceCategory,
  setListingStatus,
} from "../lib/data";
import type { ListingStatus, MarketplaceCategory } from "../lib/types";
import { formatDate, formatPrice } from "../lib/format";
import { useAsync } from "../lib/useAsync";
import {
  Badge,
  Button,
  ConfirmButton,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  Modal,
  PageHeader,
} from "../components/ui";

type Tab = "categories" | "listings";

export function MarketplacePage() {
  const [tab, setTab] = useState<Tab>("categories");
  const categories = useAsync(getMarketplaceCategories);
  const listings = useAsync(getListings);
  const [editing, setEditing] = useState<MarketplaceCategory | "new" | null>(null);
  const [actionError, setActionError] = useState("");

  const perform = async (action: () => Promise<void>, reload: () => Promise<void>) => {
    setActionError("");
    try {
      await action();
      await reload();
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Action failed.");
    }
  };

  const submitCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const current = editing === "new" ? null : editing;
    await perform(
      () =>
        saveMarketplaceCategory(current?.id ?? null, {
          name: String(form.get("name")),
          slug: String(form.get("slug")),
          description: String(form.get("description")) || null,
          sort_order: Number(form.get("sort_order")),
          is_active: form.get("is_active") === "on",
        }),
      categories.reload,
    );
    setEditing(null);
  };

  const current = tab === "categories" ? categories : listings;
  return (
    <>
      <PageHeader
        title="Marketplace"
        description="Moderate categories and listing publication state."
        action={
          tab === "categories" ? (
            <Button onClick={() => setEditing("new")}>
              <Plus size={17} /> New category
            </Button>
          ) : undefined
        }
      />
      <div className="tabs" role="tablist">
        {(["categories", "listings"] as Tab[]).map((item) => (
          <button
            role="tab"
            aria-selected={tab === item}
            className={tab === item ? "active" : ""}
            onClick={() => setTab(item)}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>
      {actionError && <ErrorState message={actionError} />}
      {current.loading && <LoadingState />}
      {current.error && <ErrorState message={current.error} retry={current.reload} />}
      {tab === "categories" &&
        categories.data &&
        (categories.data.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Slug</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.data.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                      <small>{item.description || "No description"}</small>
                    </td>
                    <td className="mono">{item.slug}</td>
                    <td>{item.sort_order}</td>
                    <td>
                      <Badge tone={item.is_active ? "live" : "muted"}>
                        {item.is_active ? "active" : "inactive"}
                      </Badge>
                    </td>
                    <td>
                      <IconButton aria-label={`Edit ${item.name}`} onClick={() => setEditing(item)}>
                        <Edit3 size={17} />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No marketplace categories"
            detail="Create the first category to prepare listings."
          />
        ))}
      {tab === "listings" &&
        listings.data &&
        (listings.data.length ? (
          <div className="table-wrap wide-table">
            <table>
              <thead>
                <tr>
                  <th>Listing</th>
                  <th>Seller</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.data.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.title}</strong>
                    </td>
                    <td>@{item.seller}</td>
                    <td>{item.category}</td>
                    <td>{formatPrice(item.price_amount, item.currency_code)}</td>
                    <td>
                      <Badge
                        tone={
                          item.status === "published"
                            ? "live"
                            : item.status === "archived"
                              ? "muted"
                              : "warning"
                        }
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td>{formatDate(item.created_at)}</td>
                    <td>
                      <div className="action-row">
                        <select
                          aria-label={`Status for ${item.title}`}
                          value={item.status}
                          onChange={(e) =>
                            void perform(
                              () => setListingStatus(item.id, e.target.value as ListingStatus),
                              listings.reload,
                            )
                          }
                        >
                          <option value="draft">Draft</option>
                          <option value="pending_review">Pending review</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                        <ConfirmButton
                          confirmLabel={`Delete listing “${item.title}”?`}
                          onConfirm={() => perform(() => deleteListing(item.id), listings.reload)}
                        >
                          Delete
                        </ConfirmButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No marketplace listings"
            detail="Listings submitted by members will appear here."
          />
        ))}
      {editing && (
        <Modal
          title={editing === "new" ? "New marketplace category" : "Edit marketplace category"}
          onClose={() => setEditing(null)}
        >
          <CategoryForm item={editing === "new" ? null : editing} onSubmit={submitCategory} />
        </Modal>
      )}
    </>
  );
}

function CategoryForm({
  item,
  onSubmit,
}: {
  item: MarketplaceCategory | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="dialog-form" onSubmit={onSubmit}>
      <label>
        Name
        <input name="name" defaultValue={item?.name} required minLength={1} maxLength={80} />
      </label>
      <label>
        Slug
        <input name="slug" defaultValue={item?.slug} required pattern="[a-z0-9-]+" />
      </label>
      <label>
        Description
        <textarea
          name="description"
          defaultValue={item?.description ?? ""}
          maxLength={280}
          rows={3}
        />
      </label>
      <label>
        Sort order
        <input name="sort_order" type="number" defaultValue={item?.sort_order ?? 0} required />
      </label>
      <label className="check-label">
        <input name="is_active" type="checkbox" defaultChecked={item?.is_active ?? true} /> Active
      </label>
      <Button type="submit">Save category</Button>
    </form>
  );
}
