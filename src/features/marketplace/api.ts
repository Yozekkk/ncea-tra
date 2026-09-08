import { getSupabaseClient } from "@/lib/supabase";
import type {
  ListingImage,
  MarketplaceCategory,
  MarketplaceListing,
} from "@/features/community/types";
import { rankMarketplaceListings } from "@/features/streak/model";
import {
  makeListingSlug,
  MARKETPLACE_IMAGE_MAX_COUNT,
  validateMarketplaceImage,
  type ListingValues,
} from "./schemas";

const listingSelect =
  "*, profiles(username, avatar_url), marketplace_categories(name, slug), marketplace_listing_images(*)";
const bucket = "marketplace-listings";

type FeedRow = Omit<
  MarketplaceListing,
  "profiles" | "marketplace_categories" | "marketplace_listing_images"
> & {
  seller_username: string;
  seller_avatar_url: string | null;
  category_name: string;
  category_slug: string;
  effective_streak: number;
  promotion_eligible: boolean;
  last_bumped_at: string | null;
};

function fail(error: { message: string } | null, fallback: string): never {
  throw new Error(error?.message ?? fallback);
}

function normalizeValues(values: ListingValues) {
  return {
    _category_id: values.categoryId,
    _title: values.title,
    _short_description: values.shortDescription,
    _description: values.description,
    _price_amount: typeof values.priceAmount === "number" ? values.priceAmount : null,
    _currency_code: values.currencyCode,
    _minecraft_version: values.minecraftVersion ?? "",
    _platform: values.platform ?? "",
  };
}

async function signImages(listings: MarketplaceListing[]) {
  const paths = listings.flatMap((listing) =>
    (listing.marketplace_listing_images ?? []).map((image) => image.storage_path),
  );
  if (!paths.length) return listings;

  const { data, error } = await getSupabaseClient()
    .storage.from(bucket)
    .createSignedUrls(paths, 3600);
  if (error) fail(error, "Не удалось загрузить ссылки на изображения");
  const signedByPath = new Map(
    (data ?? []).map((item) => [item.path, item.signedUrl ?? undefined] as const),
  );

  return listings.map((listing) => ({
    ...listing,
    marketplace_listing_images: [...(listing.marketplace_listing_images ?? [])]
      .sort((left, right) => left.sort_order - right.sort_order)
      .map((image) => ({ ...image, signed_url: signedByPath.get(image.storage_path) })),
  }));
}

async function attachImages(listings: MarketplaceListing[]) {
  if (!listings.length) return listings;
  const { data, error } = await getSupabaseClient()
    .from("marketplace_listing_images")
    .select("*")
    .in(
      "listing_id",
      listings.map((listing) => listing.id),
    )
    .order("sort_order");
  if (error) fail(error, "Не удалось загрузить изображения объявлений");
  const imagesByListing = new Map<string, ListingImage[]>();
  for (const image of (data ?? []) as ListingImage[]) {
    const images = imagesByListing.get(image.listing_id) ?? [];
    images.push(image);
    imagesByListing.set(image.listing_id, images);
  }
  return signImages(
    listings.map((listing) => ({
      ...listing,
      marketplace_listing_images: imagesByListing.get(listing.id) ?? [],
    })),
  );
}

export async function getMarketplaceCategories() {
  const { data, error } = await getSupabaseClient()
    .from("marketplace_categories")
    .select("*")
    .order("sort_order")
    .order("name");
  if (error) fail(error, "Не удалось загрузить категории");
  return data as MarketplaceCategory[];
}

export async function getPublishedListings(categoryId?: number) {
  let query = getSupabaseClient()
    .from("marketplace_feed")
    .select("*")
    .order("promotion_eligible", { ascending: false })
    .order("effective_streak", { ascending: false })
    .order("last_bumped_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .limit(60);
  if (categoryId) query = query.eq("category_id", categoryId);
  const { data, error } = await query;
  if (error) fail(error, "Не удалось загрузить объявления");

  const listings = ((data ?? []) as FeedRow[]).map(
    ({ seller_username, seller_avatar_url, category_name, category_slug, ...listing }) => ({
      ...listing,
      profiles: { username: seller_username, avatar_url: seller_avatar_url },
      marketplace_categories: { name: category_name, slug: category_slug },
      marketplace_listing_images: [],
    }),
  );
  return attachImages(rankMarketplaceListings(listings));
}

export async function getMyListings(userId: string) {
  const { data, error } = await getSupabaseClient()
    .from("marketplace_listings")
    .select(listingSelect)
    .eq("seller_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) fail(error, "Не удалось загрузить ваши объявления");
  return signImages(data as unknown as MarketplaceListing[]);
}

export async function getListing(slug: string) {
  const { data, error } = await getSupabaseClient()
    .from("marketplace_listings")
    .select(listingSelect)
    .eq("slug", slug)
    .single();
  if (error) fail(error, "Объявление не найдено");
  return (await signImages([data as unknown as MarketplaceListing]))[0];
}

async function getListingById(id: string) {
  const { data, error } = await getSupabaseClient()
    .from("marketplace_listings")
    .select("*")
    .eq("id", id)
    .single();
  if (error) fail(error, "Не удалось получить сохранённое объявление");
  return data as MarketplaceListing;
}

export async function createListing(values: ListingValues, submit = false) {
  const slug = makeListingSlug(values.title);
  const { data: id, error } = await getSupabaseClient().rpc("create_marketplace_listing", {
    ...normalizeValues(values),
    _slug: slug,
    _submit: submit,
  });
  if (error) fail(error, "Не удалось создать объявление");
  return getListingById(id as string);
}

export async function updateListing(id: string, values: ListingValues, submit = false) {
  const { data, error } = await getSupabaseClient().rpc("update_marketplace_listing", {
    ...normalizeValues(values),
    _listing_id: id,
    _submit: submit,
  });
  if (error) fail(error, "Не удалось сохранить объявление");
  return getListingById(data as string);
}

export async function archiveListing(id: string) {
  const { error } = await getSupabaseClient()
    .from("marketplace_listings")
    .update({ status: "archived" })
    .eq("id", id);
  if (error) fail(error, "Не удалось архивировать объявление");
}

export async function deleteListing(listing: MarketplaceListing) {
  const supabase = getSupabaseClient();
  const paths = (listing.marketplace_listing_images ?? []).map((image) => image.storage_path);
  if (paths.length) {
    const { error: storageError } = await supabase.storage.from(bucket).remove(paths);
    if (storageError) fail(storageError, "Не удалось удалить изображения");
  }
  const { error } = await supabase.from("marketplace_listings").delete().eq("id", listing.id);
  if (error) fail(error, "Не удалось удалить объявление");
}

export async function uploadListingImages(
  userId: string,
  listingId: string,
  files: File[],
  startOrder = 0,
) {
  if (startOrder + files.length > MARKETPLACE_IMAGE_MAX_COUNT)
    throw new Error(`Можно загрузить не более ${MARKETPLACE_IMAGE_MAX_COUNT} изображений`);

  const supabase = getSupabaseClient();
  const uploaded: ListingImage[] = [];
  const extensionByType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
  };
  for (const [index, file] of files.entries()) {
    const validationError = validateMarketplaceImage(file);
    if (validationError) throw new Error(`${file.name}: ${validationError}`);
    const path = `${userId}/${listingId}/${crypto.randomUUID()}.${extensionByType[file.type]}`;
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) fail(uploadError, "Не удалось загрузить изображение");
    const { data, error } = await supabase
      .from("marketplace_listing_images")
      .insert({
        listing_id: listingId,
        storage_path: path,
        alt_text: file.name.slice(0, 180),
        sort_order: startOrder + index,
      })
      .select("*")
      .single();
    if (error) {
      await supabase.storage.from(bucket).remove([path]);
      fail(error, "Не удалось сохранить изображение");
    }
    uploaded.push(data as ListingImage);
  }
  return uploaded;
}

export async function deleteListingImage(image: ListingImage) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("marketplace_listing_images").delete().eq("id", image.id);
  if (error) fail(error, "Не удалось удалить изображение");
  const { error: storageError } = await supabase.storage.from(bucket).remove([image.storage_path]);
  if (storageError) fail(storageError, "Метаданные удалены, но не удалось удалить файл");
}
