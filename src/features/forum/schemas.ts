import { z } from "zod";

export const topicSchema = z.object({
  categoryId: z.coerce.number().int().positive("Выберите категорию"),
  title: z.string().trim().min(3, "Минимум 3 символа").max(180, "Не более 180 символов"),
  body: z
    .string()
    .trim()
    .min(1, "Напишите первое сообщение")
    .max(20_000, "Не более 20 000 символов"),
});

export const postSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Сообщение не может быть пустым")
    .max(20_000, "Не более 20 000 символов"),
});

export function makeSlug(value: string) {
  const normalized = value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return normalized || "topic";
}

export type TopicValues = z.infer<typeof topicSchema>;
export type PostValues = z.infer<typeof postSchema>;
