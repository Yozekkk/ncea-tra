import { bulkListings, getListingFiles } from "../lib/operations";
import { getSupabase } from "../lib/supabase";
import { CollectionTools } from "../components/CollectionTools";
import { useMutation } from "../lib/useMutation";
import { submittedForm } from "../lib/forms";
import { useState, type FormEvent } from "react";
import { Edit3, Plus } from "lucide-react";
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
import { UrlImagePreview } from "../components/UrlImagePreview";
import { isSafeHttpUrl, normalizeOptionalText } from "../lib/validation";

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
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sellerFilter, setSellerFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<ListingView | null>(null);
  const filteredListings = (listings.data ?? []).filter(
    (item) =>
      (statusFilter === "all" || item.status === statusFilter) &&
      (categoryFilter === "all" || String(item.category_id) === categoryFilter) &&
      (sellerFilter === "all" || item.seller_id === sellerFilter),
  );
  const bulk = async (status: "published" | "archived" | "draft") => {
    const ids = filteredListings
      .filter((item) => selected.has(item.id) && (isAdmin || item.listing_source === "user"))
      .map((item) => item.id);
    if (await perform(() => bulkListings(ids, status), listings.reload)) setSelected(new Set());
  };

  const mutation = useMutation();
  const perform = mutation.perform;

  const submitCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = submittedForm(event.currentTarget, event.nativeEvent);
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
    const form = submittedForm(event.currentTarget, event.nativeEvent);
    const current = editingListing === "new" ? null : editingListing;
    const intent = String(form.get("intent") || "save");
    const imageUrl = String(form.get("image_url") || "").trim();
    if (imageUrl && !isSafeHttpUrl(imageUrl)) {
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
          price_text: normalizeOptionalText(form.get("price_text")),
          currency_code: String(form.get("currency_code") || "RUB"),
          minecraft_version: String(form.get("minecraft_version")) || null,
          platform: String(form.get("platform")) || null,
          sort_order:
            String(form.get("listing_source")) === "agency"
              ? Number(form.get("sort_order") || 0)
              : null,
          status: (intent === "publish"
            ? "published"
            : intent === "draft"
              ? "draft"
              : intent === "archive"
                ? "archived"
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
      {mutation.error && <ErrorState message={mutation.error} />}
      {mutation.message && (
        <div className="success-state" role="status">
          {mutation.message}
        </div>
      )}
      {tab === "listings" && (
        <div className="toolbar">
          <select
            aria-label="Фильтр статуса"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setSelected(new Set());
            }}
          >
            <option value="all">Все статусы</option>
            {["draft", "pending_review", "published", "archived"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            aria-label="Фильтр категории"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setSelected(new Set());
            }}
          >
            <option value="all">Все категории</option>
            {categories.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Фильтр автора"
            value={sellerFilter}
            onChange={(e) => {
              setSellerFilter(e.target.value);
              setSelected(new Set());
            }}
          >
            <option value="all">Все авторы</option>
            {[...new Map((listings.data ?? []).map((l) => [l.seller_id, l.seller])).entries()].map(
              ([id, name]) => (
                <option key={id} value={id}>
                  @{name}
                </option>
              ),
            )}
          </select>
          <Button disabled={mutation.busy || !selected.size} onClick={() => void bulk("published")}>
            Одобрить выбранные
          </Button>
          <ConfirmButton
            disabled={mutation.busy || !selected.size}
            confirmLabel="Архивировать выбранные объявления?"
            onConfirm={() => bulk("archived")}
          >
            В архив выбранные
          </ConfirmButton>
        </div>
      )}
      <fieldset className="collection-actions" disabled={mutation.busy}>
        {current.loading && <LoadingState />}
        {current.error && <ErrorState message={current.error} retry={current.reload} />}
        {tab === "categories" &&
          categories.data &&
          (categories.data.length ? (
            <CollectionTools rows={categories.data} text={(item) => `${item.name} ${item.slug}`}>
              {(visible) => (
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
                      {visible.map((item) => (
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
                            <IconButton
                              aria-label={`Edit ${item.name}`}
                              onClick={() => setEditing(item)}
                            >
                              <Edit3 size={17} />
                            </IconButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CollectionTools>
          ) : (
            <EmptyState
              title="No marketplace categories"
              detail="Create the first category to prepare listings."
            />
          ))}
        {tab === "listings" &&
          listings.data &&
          (listings.data.length ? (
            <CollectionTools
              rows={filteredListings}
              text={(item) => `${item.title} ${item.seller} ${item.seller_id} ${item.category}`}
            >
              {(visible) => (
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
                      {visible.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <strong>{item.title}</strong>
                            <Button
                              className="button-secondary button-small"
                              onClick={() => setPreview(item)}
                            >
                              Preview
                            </Button>
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
                                <input
                                  type="checkbox"
                                  aria-label={`Выбрать ${item.title}`}
                                  checked={selected.has(item.id)}
                                  onChange={(e) =>
                                    setSelected((old) => {
                                      const next = new Set(old);
                                      if (e.target.checked) next.add(item.id);
                                      else next.delete(item.id);
                                      return next;
                                    })
                                  }
                                />
                                {item.status === "pending_review" && (
                                  <>
                                    <Button
                                      disabled={mutation.busy}
                                      onClick={() =>
                                        void perform(
                                          () => setListingStatus(item.id, "published"),
                                          listings.reload,
                                        )
                                      }
                                    >
                                      Одобрить
                                    </Button>
                                    <ConfirmButton
                                      disabled={mutation.busy}
                                      confirmLabel="Вернуть объявление автору в черновик?"
                                      onConfirm={() =>
                                        perform(
                                          () => setListingStatus(item.id, "draft"),
                                          listings.reload,
                                        )
                                      }
                                    >
                                      Отклонить
                                    </ConfirmButton>
                                  </>
                                )}
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
                                      () =>
                                        setListingStatus(item.id, e.target.value as ListingStatus),
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
                                    disabled={mutation.busy}
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
              )}
            </CollectionTools>
          ) : (
            <EmptyState
              title="No marketplace listings"
              detail="Listings submitted by members will appear here."
            />
          ))}
      </fieldset>
      {preview && (
        <Modal title={preview.title} onClose={() => setPreview(null)} wide>
          <ListingPreview item={preview} />
        </Modal>
      )}
      {editing && (
        <Modal
          title={editing === "new" ? "New marketplace category" : "Edit marketplace category"}
          onClose={() => !mutation.busy && setEditing(null)}
        >
          <CategoryForm item={editing === "new" ? null : editing} onSubmit={submitCategory} />
        </Modal>
      )}
      {editingListing && (
        <Modal
          title={editingListing === "new" ? "New Marketplace listing" : "Edit Marketplace listing"}
          onClose={() => !mutation.busy && setEditingListing(null)}
          wide
        >
          <fieldset disabled={mutation.busy}>
            <ListingEditorForm
              item={editingListing === "new" ? null : editingListing}
              categories={categories.data ?? []}
              onSubmit={submitListing}
            />
          </fieldset>
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
  const invalidImage = Boolean(imageUrl && !isSafeHttpUrl(imageUrl));
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
        {invalidImage ? (
          <span className="field-error" role="alert">
            Допустим только безопасный прямой http/https URL.
          </span>
        ) : null}
      </label>
      <UrlImagePreview url={imageUrl} alt="Предпросмотр изображения товара" />
      <div className="dialog-actions">
        <Button type="submit" name="intent" value="draft" disabled={invalidImage}>
          Сохранить черновик
        </Button>
        <Button type="submit" name="intent" value="save" disabled={invalidImage}>
          Сохранить
        </Button>
        <Button
          type="submit"
          name="intent"
          value="publish"
          className="button-secondary"
          disabled={invalidImage}
        >
          Опубликовать
        </Button>
        {item ? (
          <Button
            type="submit"
            name="intent"
            value="archive"
            className="button-secondary"
            disabled={invalidImage}
          >
            Архивировать
          </Button>
        ) : null}
      </div>
    </form>
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

function ListingPreview({ item }: { item: ListingView }) {
  const files = useAsync(() => getListingFiles(item.id), [item.id]);
  return (
    <div className="dialog-form">
      <Badge>{item.status}</Badge>
      <p>
        Автор: @{item.seller} · <span className="mono">{item.seller_id}</span>
      </p>
      <p>
        {item.category} · {formatPrice(item.price_amount, item.currency_code)}
      </p>
      <UrlImagePreview url={item.image_url ?? ""} alt={item.title} />
      <p className="content-preview">{item.description}</p>
      <a
        href={`https://ncea-studio.com/marketplace/${encodeURIComponent(item.slug)}`}
        target="_blank"
        rel="noreferrer"
      >
        Публичная карточка ↗
      </a>
      {files.loading && <LoadingState />}
      {files.error && <ErrorState message={files.error} retry={files.reload} />}
      {files.data && (
        <>
          <strong>Связанные файлы: {files.data.length}</strong>
          {files.data.map((f) => (
            <div key={f.id}>
              <code>{f.storage_path}</code>
              <UrlImagePreview
                url={
                  getSupabase().storage.from("marketplace-listings").getPublicUrl(f.storage_path)
                    .data.publicUrl
                }
                alt={f.alt_text ?? "Изображение объявления"}
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
}
