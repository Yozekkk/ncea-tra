import { useEffect, useState, type FormEvent } from "react";
import { Edit3, ImageOff, Plus } from "lucide-react";
import {
  deleteListing,
  getListings,
  getMarketplaceCategories,
  saveMarketplaceListing,
  saveMarketplaceCategory,
  setListingStatus,
} from "../lib/data";
import type { ListingStatus, ListingView, MarketplaceCategory } from "../lib/types";
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
import { useAdminAccess } from "../components/AdminAccess";

type Tab = "categories" | "listings";

export function MarketplacePage() {
  const { role } = useAdminAccess();
  const isAdmin = role === "admin" || role === "owner";
  const isOwner = role === "owner";
  const [tab, setTab] = useState<Tab>(isAdmin ? "categories" : "listings");
  const categories = useAsync(getMarketplaceCategories);
  const listings = useAsync(getListings);
  const [editing, setEditing] = useState<MarketplaceCategory | "new" | null>(null);
  const [editingListing, setEditingListing] = useState<ListingView | "new" | null>(null);
  const [actionError, setActionError] = useState("");

  const perform = async (action: () => Promise<void>, reload: () => Promise<void>) => {
    setActionError("");
    try {
      await action();
      await reload();
      return true;
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Action failed.");
      return false;
    }
  };

  const submitCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const current = editing === "new" ? null : editing;
    const saved = await perform(
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
    if (saved) setEditing(null);
  };

  const submitListing = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const current = editingListing === "new" ? null : editingListing;
    const intent = String(form.get("intent") || "save");
    const imageUrl = String(form.get("image_url") || "").trim();
    if (imageUrl && !isSafeImageUrl(imageUrl)) {
      setActionError("Image URL must be a valid http/https URL without markup or credentials.");
      return;
    }
    const saved = await perform(
      () =>
        saveMarketplaceListing(current?.id ?? null, {
          category_id: Number(form.get("category_id")),
          title: String(form.get("title")),
          short_description: String(form.get("short_description")),
          description: String(form.get("description")),
          listing_source: String(form.get("listing_source")) as "agency" | "user",
          image_url: imageUrl || null,
          price_amount: form.get("price_amount") ? Number(form.get("price_amount")) : null,
          price_text: String(form.get("price_text") || "").trim() || null,
          currency_code: String(form.get("currency_code") || "RUB"),
          minecraft_version: String(form.get("minecraft_version")) || null,
          platform: String(form.get("platform")) || null,
          sort_order:
            String(form.get("listing_source")) === "agency"
              ? Number(form.get("sort_order") || 0)
              : null,
          status: (intent === "publish"
            ? "published"
            : String(form.get("status"))) as ListingStatus,
        }),
      listings.reload,
    );
    if (saved) setEditingListing(null);
  };

  const current = tab === "categories" ? categories : listings;
  return (
    <>
      <PageHeader
        title="Marketplace"
        description="Moderate categories and listing publication state."
        action={
          tab === "categories" && isAdmin ? (
            <Button onClick={() => setEditing("new")}>
              <Plus size={17} /> New category
            </Button>
          ) : tab === "listings" && isAdmin ? (
            <Button onClick={() => setEditingListing("new")}>
              <Plus size={17} /> New official listing
            </Button>
          ) : undefined
        }
      />
      <div className="tabs" role="tablist">
        {(isAdmin ? (["categories", "listings"] as Tab[]) : (["listings"] as Tab[])).map((item) => (
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
                  <th>Source</th>
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
                    <td>
                      <Badge tone={item.listing_source === "agency" ? "live" : "muted"}>
                        {item.listing_source}
                      </Badge>
                    </td>
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
                      {item.listing_source === "agency" && !isAdmin ? (
                        <Badge tone="muted">protected</Badge>
                      ) : (
                        <div className="action-row">
                          {isAdmin ? (
                            <IconButton
                              aria-label={`Edit ${item.title}`}
                              onClick={() => setEditingListing(item)}
                            >
                              <Edit3 size={17} />
                            </IconButton>
                          ) : null}
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
                          {item.listing_source === "user" || isOwner ? (
                            <ConfirmButton
                              confirmLabel={`Move listing “${item.title}” to trash?`}
                              onConfirm={() =>
                                perform(() => deleteListing(item.id), listings.reload)
                              }
                            >
                              Delete
                            </ConfirmButton>
                          ) : (
                            <Badge tone="muted">owner delete only</Badge>
                          )}
                        </div>
                      )}
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
      {editingListing && (
        <Modal
          title={editingListing === "new" ? "New Marketplace listing" : "Edit Marketplace listing"}
          onClose={() => setEditingListing(null)}
          wide
        >
          <ListingEditorForm
            item={editingListing === "new" ? null : editingListing}
            categories={categories.data ?? []}
            onSubmit={submitListing}
          />
        </Modal>
      )}
    </>
  );
}

function ListingEditorForm({
  item,
  categories,
  onSubmit,
}: {
  item: ListingView | null;
  categories: MarketplaceCategory[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const [source, setSource] = useState<"agency" | "user">(item?.listing_source ?? "agency");
  const [imageUrl, setImageUrl] = useState(item?.image_url ?? "");
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => setImageFailed(false), [imageUrl]);
  const showPreview = isSafeImageUrl(imageUrl) && !imageFailed;
  return (
    <form className="dialog-form" onSubmit={onSubmit} autoComplete="off">
      <label>
        Название
        <input name="title" defaultValue={item?.title} required minLength={3} maxLength={180} />
      </label>
      <label>
        Короткий подзаголовок
        <textarea
          name="short_description"
          defaultValue={item?.short_description}
          required
          minLength={10}
          maxLength={280}
          rows={2}
        />
      </label>
      <label>
        Полное описание
        <textarea
          name="description"
          defaultValue={item?.description}
          required
          minLength={20}
          maxLength={20000}
          rows={5}
        />
      </label>
      <div className="dialog-grid">
        <label>
          Категория
          <select name="category_id" defaultValue={item?.category_id ?? categories[0]?.id} required>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Источник
          <select
            name="listing_source"
            value={source}
            onChange={(event) => setSource(event.target.value as typeof source)}
          >
            <option value="agency">От агентства</option>
            <option value="user">От пользователя</option>
          </select>
        </label>
        <label>
          Статус
          <select name="status" defaultValue={item?.status ?? "draft"}>
            <option value="draft">Черновик</option>
            <option value="pending_review">На проверке</option>
            <option value="published">Опубликовано</option>
            <option value="archived">В архиве</option>
          </select>
        </label>
        <label>
          Порядок официальных карточек
          <input
            name="sort_order"
            type="number"
            min={0}
            defaultValue={item?.sort_order ?? 100}
            required={source === "agency"}
            disabled={source !== "agency"}
          />
        </label>
        <label>
          Цена (необязательно)
          <input
            name="price_amount"
            type="number"
            min={0}
            step="0.01"
            defaultValue={item?.price_amount ?? ""}
          />
        </label>
        <label>
          Валюта
          <select name="currency_code" defaultValue={item?.currency_code ?? "RUB"}>
            <option value="RUB">RUB</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </label>
        <label>
          Minecraft version
          <input
            name="minecraft_version"
            defaultValue={item?.minecraft_version ?? ""}
            maxLength={40}
          />
        </label>
        <label>
          Platform / Core
          <input name="platform" defaultValue={item?.platform ?? ""} maxLength={40} />
        </label>
      </div>
      <label>
        Текст вместо цены
        <input
          name="price_text"
          defaultValue={item?.price_text ?? "Цена скоро будет добавлена"}
          maxLength={120}
        />
      </label>
      <label>
        URL изображения
        <input
          name="image_url"
          type="url"
          inputMode="url"
          placeholder="https://example.com/image.webp…"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          maxLength={2048}
        />
        {imageUrl && !isSafeImageUrl(imageUrl) ? (
          <span className="field-error" role="alert">
            Допустим только безопасный прямой http/https URL.
          </span>
        ) : null}
      </label>
      <div className="image-url-preview" aria-live="polite">
        {showPreview ? (
          <img
            src={imageUrl}
            alt="Предпросмотр изображения товара"
            width={960}
            height={540}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span>
            <ImageOff size={22} />
            Скоро будет добавлена картинка
          </span>
        )}
      </div>
      <div className="dialog-actions">
        <Button
          type="submit"
          name="intent"
          value="save"
          disabled={Boolean(imageUrl && !isSafeImageUrl(imageUrl))}
        >
          Сохранить
        </Button>
        <Button
          type="submit"
          name="intent"
          value="publish"
          className="button-secondary"
          disabled={Boolean(imageUrl && !isSafeImageUrl(imageUrl))}
        >
          Опубликовать
        </Button>
      </div>
    </form>
  );
}

function isSafeImageUrl(value: string) {
  if (!value) return false;
  if (value.length > 2048 || /[\s<>"'`]/.test(value)) return false;
  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") && !url.username && !url.password
    );
  } catch {
    return false;
  }
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
