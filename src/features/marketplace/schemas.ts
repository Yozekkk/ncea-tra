import { z } from "zod";
import { makeSlug } from "../forum/schemas.ts";

export const MARKETPLACE_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;
export const MARKETPLACE_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

export const listingSchema = z.object({
  categoryId: z.coerce.number().int().positive("Выберите категорию"),
  title: z.string().trim().min(3, "Минимум 3 символа").max(180, "Не более 180 символов"),
  description: z
    .string()
    .trim()
    .min(1, "Добавьте описание")
    .max(20_000, "Не более 20 000 символов"),
  priceAmount: z.number().min(0, "Цена не может быть отрицательной").nullable(),
  currencyCode: z.enum(["EUR", "USD", "RUB"]),
});

export function validateMarketplaceImage(file: Pick<File, "size" | "type">) {
  if (!MARKETPLACE_IMAGE_TYPES.includes(file.type as (typeof MARKETPLACE_IMAGE_TYPES)[number])) {
    return "Поддерживаются JPEG, PNG, WebP и AVIF";
  }
  if (file.size > MARKETPLACE_IMAGE_MAX_BYTES) return "Изображение должно быть не больше 10 МБ";
  return null;
}

export function makeListingSlug(title: string) {
  return `${makeSlug(title)}-${crypto.randomUUID().slice(0, 8)}`;
}

export type ListingValues = z.infer<typeof listingSchema>;
