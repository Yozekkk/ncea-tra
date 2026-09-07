import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Publishable credentials are intentionally safe to ship to browsers. Environment
// variables can override them, while the NCEA defaults keep Git deployments usable.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://bualqaeinwifoopzflbt.supabase.co";
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_rPbG4EP0YEypHLKVMHEYpA_pGVFQX0M";
let client: SupabaseClient | undefined;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

export function getSupabaseClient() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabase is not configured. Set the VITE_SUPABASE_URL and publishable key.");
  }
  client ??= createClient(supabaseUrl, supabasePublishableKey, {
    auth: { autoRefreshToken: true, detectSessionInUrl: true, persistSession: true },
  });
  return client;
}
