import { getSupabaseClient } from "@/lib/supabase";
import type {
  ListingImage,
  MarketplaceCategory,
  MarketplaceListing,
} from "@/features/community/types";
import { makeListingSlug, validateMarketplaceImage, type ListingValues } from "./schemas";

const listingSelect =
  "*, profiles(username, avatar_url), marketplace_categories(name, slug), marketplace_listing_images(*)";
const bucket = "marketplace-listings";

function fail(error: { message: string } | null, fallback: string): never {
  throw new Error(error?.message ?? fallback);
}

async function signImages(listings: MarketplaceListing[]) {
  const supabase = getSupabaseClient();
  return Promise.all(
    listings.map(async (listing) => {
      const images = await Promise.all(
        (listing.marketplace_listing_images ?? [])
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(async (image) => {
            const { data } = await supabase.storage
              .from(bucket)
              .createSignedUrl(image.storage_path, 3600);
            return { ...image, signed_url: data?.signedUrl };
          }),
      );
      return { ...listing, marketplace_listing_images: images };
    }),
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
    .from("marketplace_listings")
    .select(listingSelect)
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (categoryId) query = query.eq("category_id", categoryId);
  const { data, error } = await query;
  if (error) fail(error, "Не удалось загрузить объявления");
  return signImages(data as unknown as MarketplaceListing[]);
}

export async function getMyListings(userId: string) {
  const { data, error } = await getSupabaseClient()
    .from("marketplace_listings")
    .select(listingSelect)
    .eq("seller_id", userId)
    .order("created_at", { ascending: false });
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

export async function createListing(userId: string, values: ListingValues) {
  const slug = makeListingSlug(values.title);
  const { data, error } = await getSupabaseClient()
    .from("marketplace_listings")
    .insert({
      seller_id: userId,
      category_id: values.categoryId,
      title: values.title,
      slug,
      description: values.description,
      price_amount: typeof values.priceAmount === "number" ? values.priceAmount : null,
      currency_code: values.currencyCode,
      status: "draft",
    })
    .select("*")
    .single();
  if (error) fail(error, "Не удалось создать объявление");
  return data as MarketplaceListing;
}

export async function updateListing(id: string, values: ListingValues) {
  const { data, error } = await getSupabaseClient()
    .from("marketplace_listings")
    .update({
      category_id: values.categoryId,
      title: values.title,
      description: values.description,
      price_amount: typeof values.priceAmount === "number" ? values.priceAmount : null,
      currency_code: values.currencyCode,
      status: "draft",
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) fail(error, "Не удалось сохранить объявление");
  return data as MarketplaceListing;
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
  const supabase = getSupabaseClient();
  const uploaded: ListingImage[] = [];
  for (const [index, file] of files.entries()) {
    const validationError = validateMarketplaceImage(file);
    if (validationError) throw new Error(`${file.name}: ${validationError}`);
    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase()
        .replace(/[^a-z0-9]/g, "") ||
      file.type.split("/")[1] ||
      "bin";
    const path = `${userId}/${listingId}/${crypto.randomUUID()}.${extension}`;
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
