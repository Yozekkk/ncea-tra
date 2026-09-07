import { z } from "zod";

export const USERNAME_PATTERN = /^[A-Za-z0-9_.-]+$/;

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Имя пользователя должно содержать минимум 3 символа")
  .max(32, "Имя пользователя не должно быть длиннее 32 символов")
  .regex(USERNAME_PATTERN, "Используйте латинские буквы, цифры, точку, дефис или подчёркивание");

export const loginSchema = z.object({
  email: z.string().trim().email("Введите корректный email"),
  password: z.string().min(1, "Введите пароль"),
});

export const registerSchema = loginSchema.extend({
  username: usernameSchema,
  password: z.string().min(8, "Пароль должен содержать минимум 8 символов"),
});

export const profileSchema = z.object({
  username: usernameSchema,
  displayName: z.string().trim().max(80, "Не более 80 символов").optional(),
  bio: z.string().trim().max(500, "Не более 500 символов").optional(),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
