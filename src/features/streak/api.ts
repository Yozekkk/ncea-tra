import { getSupabaseClient } from "@/lib/supabase";
import type { ActivityStreak } from "@/features/community/types";

export async function recordDailyActivity(): Promise<ActivityStreak | null> {
  const { data, error } = await getSupabaseClient().rpc("record_daily_activity");
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return (row as ActivityStreak | null | undefined) ?? null;
}
