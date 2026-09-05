import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
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
