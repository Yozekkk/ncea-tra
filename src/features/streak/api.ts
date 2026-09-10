import { getSupabaseClient } from "@/lib/supabase";
import type { ActivityStreak, StreakRenewalResult } from "@/features/community/types";

export async function getStrikeModeStatus(): Promise<ActivityStreak | null> {
  const { data, error } = await getSupabaseClient().rpc("get_strike_mode_status");
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return (row as ActivityStreak | null | undefined) ?? null;
}

export async function renewStrikeMode(): Promise<StreakRenewalResult> {
  const { data, error } = await getSupabaseClient().rpc("renew_strike_mode");
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Ударный режим временно недоступен. Попробуйте ещё раз.");
  return row as StreakRenewalResult;
}
