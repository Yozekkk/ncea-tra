import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Archive, ArrowRight, ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth/AuthProvider";
import type { MarketplaceCategory, MarketplaceListing } from "@/features/community/types";
import { LoginPrompt, formatCommunityDate } from "@/features/forum/components";
import {
  archiveListing,
  createListing,
  deleteListing,
  deleteListingImage,
  updateListing,
  uploadListingImages,
} from "./api";
import { listingSchema, validateMarketplaceImage, type ListingValues } from "./schemas";

export const marketplaceKeys = {
  all: ["marketplace"] as const,
  categories: ["marketplace", "categories"] as const,
  published: (category?: number) => ["marketplace", "published", category ?? "all"] as const,
  mine: (userId: string) => ["marketplace", "mine", userId] as const,
  listing: (slug: string) => ["marketplace", "listing", slug] as const,
};

export function formatListingPrice(amount: number | null, currency: string) {
  if (amount === null) return "Цена по запросу";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function StatusBadge({ status }: { status: MarketplaceListing["status"] }) {
  const labels = { draft: "Черновик", published: "Опубликовано", archived: "В архиве" };
  return <span className={`listing-status listing-status-${status}`}>{labels[status]}</span>;
}

export function ListingCard({
  listing,
  ownerView = false,
}: {
  listing: MarketplaceListing;
  ownerView?: boolean;
}) {
  const cover = listing.marketplace_listing_images?.[0];
  return (
    <Link to="/marketplace/$slug" params={{ slug: listing.slug }} className="listing-card">
      {cover?.signed_url ? (
        <img src={cover.signed_url} alt={cover.alt_text ?? ""} loading="lazy" />
      ) : (
        <div className="listing-placeholder">
          <ImagePlus aria-hidden="true" />
        </div>
      )}
      <div className="listing-card-body">
        <div className="listing-card-kicker">
          <span>{listing.marketplace_categories?.name}</span>
          {ownerView ? <StatusBadge status={listing.status} /> : null}
        </div>
        <h2>{listing.title}</h2>
        <p>{listing.description}</p>
        <div className="listing-card-footer">
          <strong>{formatListingPrice(listing.price_amount, listing.currency_code)}</strong>
          <span>
            {listing.profiles?.username ?? "Продавец NCEA"} ·{" "}
            {formatCommunityDate(listing.created_at)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ListingGrid({
  listings,
  ownerView = false,
}: {
  listings: MarketplaceListing[];
  ownerView?: boolean;
}) {
  if (!listings.length)
    return (
      <div className="community-state">
        <strong>Объявлений пока нет</strong>
        <span>
          {ownerView ? "Создайте первый черновик." : "Здесь появятся предложения после публикации."}
        </span>
      </div>
    );
  return (
    <div className="listing-grid">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} ownerView={ownerView} />
      ))}
    </div>
  );
}

export function MarketplaceCreatePrompt() {
  const auth = useAuth();
  return auth.user ? (
    <Link to="/marketplace/new" className="community-button">
      <Plus />
      Создать объявление
    </Link>
  ) : (
    <LoginPrompt action="создать объявление" redirect="/marketplace/new" />
  );
}

function ImagePicker({ onFiles }: { onFiles: (files: File[]) => void }) {
  const [error, setError] = useState("");
  return (
    <div className="form-field">
      <Label htmlFor="listing-images">Изображения</Label>
      <label className="image-picker" htmlFor="listing-images">
        <ImagePlus />
        <span>JPEG, PNG, WebP или AVIF · до 10 МБ</span>
      </label>
      <Input
        id="listing-images"
        className="sr-only"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          const issue = files.map(validateMarketplaceImage).find(Boolean);
          setError(issue ?? "");
          if (!issue) onFiles(files);
        }}
      />
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

export function ListingForm({
  categories,
  listing,
}: {
  categories: MarketplaceCategory[];
  listing?: MarketplaceListing;
}) {
  const auth = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);
  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files],
  );
  useEffect(
    () => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)),
    [previews],
  );
  const form = useForm<ListingValues>({
    resolver: zodResolver(listingSchema),
    mode: "onBlur",
    defaultValues: {
      categoryId: listing?.category_id ?? categories[0]?.id,
      title: listing?.title ?? "",
      description: listing?.description ?? "",
      priceAmount: listing?.price_amount ?? null,
      currencyCode: (listing?.currency_code as "EUR" | "USD" | "RUB") ?? "EUR",
    },
  });
  const mutation = useMutation({
    mutationFn: async (values: ListingValues) => {
      const saved = listing
        ? await updateListing(listing.id, values)
        : await createListing(auth.user!.id, values);
      if (files.length)
        await uploadListingImages(
          auth.user!.id,
          saved.id,
          files,
          listing?.marketplace_listing_images?.length ?? 0,
        );
      return saved;
    },
    onSuccess: async (saved) => {
      await queryClient.invalidateQueries({ queryKey: marketplaceKeys.all });
      await navigate({ to: "/marketplace/$slug", params: { slug: saved.slug } });
    },
  });
  if (!auth.user)
    return (
      <LoginPrompt
        action={listing ? "изменить объявление" : "создать объявление"}
        redirect={listing ? `/marketplace/${listing.slug}/edit` : "/marketplace/new"}
      />
    );
  return (
    <form
      className="listing-form"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      <div className="form-field">
        <Label>Категория</Label>
        <Select
          value={String(form.watch("categoryId") ?? "")}
          onValueChange={(value) =>
            form.setValue("categoryId", Number(value), { shouldValidate: true })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="form-field">
        <Label htmlFor="listing-title">Название</Label>
        <Input id="listing-title" maxLength={180} {...form.register("title")} />
        {form.formState.errors.title ? (
          <p className="field-error">{form.formState.errors.title.message}</p>
        ) : null}
      </div>
      <div className="form-field">
        <Label htmlFor="listing-description">Описание</Label>
        <Textarea
          id="listing-description"
          rows={9}
          maxLength={20000}
          {...form.register("description")}
        />
        {form.formState.errors.description ? (
          <p className="field-error">{form.formState.errors.description.message}</p>
        ) : null}
      </div>
      <div className="price-fields">
        <div className="form-field">
          <Label htmlFor="listing-price">Цена</Label>
          <Input
            id="listing-price"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder="По запросу"
            {...form.register("priceAmount", {
              setValueAs: (value) => (value === "" ? null : Number(value)),
            })}
          />
        </div>
        <div className="form-field">
          <Label>Валюта</Label>
          <Select
            value={form.watch("currencyCode")}
            onValueChange={(value) =>
              form.setValue("currencyCode", value as ListingValues["currencyCode"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["EUR", "USD", "RUB"].map((currency) => (
                <SelectItem value={currency} key={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <ImagePicker onFiles={setFiles} />
      {previews.length ? (
        <div className="image-preview-grid">
          {previews.map(({ file, url }) => (
            <img key={url} src={url} alt={`Предпросмотр ${file.name}`} />
          ))}
        </div>
      ) : null}
      {mutation.error ? (
        <p className="form-error-summary" role="alert">
          {mutation.error.message}
        </p>
      ) : null}
      <div className="community-actions">
        <Button className="rounded-full" disabled={mutation.isPending}>
          {mutation.isPending
            ? "Сохранение…"
            : listing
              ? "Сохранить как черновик"
              : "Создать черновик"}
        </Button>
        <Link
          to={listing ? "/marketplace/$slug" : "/marketplace/my"}
          params={listing ? { slug: listing.slug } : (undefined as never)}
          className="community-button-secondary"
        >
          Отмена
        </Link>
      </div>
      {listing?.status === "published" ? (
        <p className="field-help">
          После изменения объявление вернётся в черновики для повторной проверки.
        </p>
      ) : null}
    </form>
  );
}

export function ListingOwnerActions({ listing }: { listing: MarketplaceListing }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const archive = useMutation({
    mutationFn: () => archiveListing(listing.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: marketplaceKeys.all }),
  });
  const remove = useMutation({
    mutationFn: () => deleteListing(listing),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: marketplaceKeys.all });
      await navigate({ to: "/marketplace/my" });
    },
  });
  if (auth.user?.id !== listing.seller_id) return null;
  return (
    <div className="owner-panel">
      <div>
        <strong>Управление объявлением</strong>
        <p>
          {listing.status === "published"
            ? "Изменение вернёт объявление в черновики."
            : "Черновики видны только вам и администраторам."}
        </p>
      </div>
      <div className="community-actions">
        <Link
          to="/marketplace/$slug/edit"
          params={{ slug: listing.slug }}
          className="community-button-secondary"
        >
          <Pencil />
          Изменить
        </Link>
        {listing.status !== "archived" ? (
          <Button variant="outline" onClick={() => archive.mutate()}>
            <Archive />В архив
          </Button>
        ) : null}
        {listing.status !== "published" ? (
          <Button
            variant="destructive"
            onClick={() => window.confirm("Удалить объявление и изображения?") && remove.mutate()}
          >
            <Trash2 />
            Удалить
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function ListingImageManager({ listing }: { listing: MarketplaceListing }) {
  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: deleteListingImage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: marketplaceKeys.all }),
  });
  if (!listing.marketplace_listing_images?.length || listing.status === "published") return null;
  return (
    <div className="listing-image-manager">
      {listing.marketplace_listing_images.map((image) => (
        <div key={image.id}>
          {image.signed_url ? <img src={image.signed_url} alt={image.alt_text ?? ""} /> : null}
          <Button
            variant="destructive"
            size="icon"
            aria-label="Удалить изображение"
            onClick={() => remove.mutate(image)}
          >
            <Trash2 />
          </Button>
        </div>
      ))}
    </div>
  );
}
