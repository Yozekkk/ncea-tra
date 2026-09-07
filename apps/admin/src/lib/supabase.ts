import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Publishable credentials are intentionally safe to ship to browsers. Environment
// variables can override them, while the NCEA defaults keep Git deployments usable.
const url = import.meta.env.VITE_SUPABASE_URL || "https://bualqaeinwifoopzflbt.supabase.co";
const publishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_rPbG4EP0YEypHLKVMHEYpA_pGVFQX0M";
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
