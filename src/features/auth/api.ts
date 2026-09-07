import { getSupabaseClient } from "@/lib/supabase";
import type { Profile } from "@/features/community/types";
import type { LoginValues, ProfileValues, RegisterValues } from "./schemas";

export async function login(values: LoginValues) {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword(values);
  if (error) throw error;
  return data.session;
}

export async function registerAccount(values: RegisterValues) {
  const supabase = getSupabaseClient();
  const { data: existing, error: lookupError } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", values.username)
    .limit(1);
  if (lookupError) throw lookupError;
  if (existing?.length) throw new Error("Это имя пользователя уже занято");

  const { error } = await supabase.functions.invoke("register-account", { body: values });
  if (error) {
    let code = "";
    if ("context" in error && error.context instanceof Response) {
      const payload = (await error.context
        .clone()
        .json()
        .catch(() => null)) as {
        error?: string;
      } | null;
      code = payload?.error ?? "";
    }
    if (code === "username_taken") {
      throw new Error("Это имя пользователя уже занято");
    }
    if (code === "account_exists") throw new Error("Аккаунт с таким email уже существует");
    if (code === "invalid_password") throw new Error("Пароль не соответствует требованиям Auth");
    throw new Error("Не удалось создать аккаунт. Попробуйте ещё раз позже");
  }
  return login({ email: values.email, password: values.password });
}

export async function updateProfile(userId: string, values: ProfileValues) {
  const { data, error } = await getSupabaseClient()
    .from("profiles")
    .update({
      username: values.username,
      display_name: values.displayName || null,
      bio: values.bio || null,
    })
    .eq("id", userId)
    .select("*")
    .single();
  if (error) {
    if (/duplicate key|profiles_username/i.test(error.message))
      throw new Error("Это имя пользователя уже занято");
    throw error;
  }
  return data as Profile;
}
