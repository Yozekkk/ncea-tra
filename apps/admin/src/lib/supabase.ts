import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
let client: SupabaseClient<Database> | undefined;

export const supabaseConfig = {
  configured: Boolean(url && publishableKey),
  projectHost: url ? new URL(url).host : "Not configured",
};

export function getSupabase(): SupabaseClient<Database> {
  if (!url || !publishableKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  client ??= createClient<Database>(url, publishableKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  });
  return client;
}
