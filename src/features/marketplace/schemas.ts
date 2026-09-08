import { z } from "zod";
import { makeSlug } from "../forum/schemas.ts";

export const MARKETPLACE_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;
export const MARKETPLACE_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const MARKETPLACE_IMAGE_MAX_COUNT = 6;

export const listingSchema = z.object({
  categoryId: z.coerce.number().int().positive("Выберите категорию"),
  title: z.string().trim().min(3, "Минимум 3 символа").max(180, "Не более 180 символов"),
  shortDescription: z
    .string()
    .trim()
    .min(10, "Минимум 10 символов")
    .max(280, "Не более 280 символов"),
  description: z
    .string()
    .trim()
    .min(20, "Полное описание должно содержать минимум 20 символов")
    .max(20_000, "Не более 20 000 символов"),
  priceAmount: z.number().min(0, "Цена не может быть отрицательной").nullable(),
  currencyCode: z.enum(["EUR", "USD", "RUB"]),
  minecraftVersion: z.string().trim().max(40, "Не более 40 символов").optional(),
  platform: z.string().trim().max(40, "Не более 40 символов").optional(),
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
