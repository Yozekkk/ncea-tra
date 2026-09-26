import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase";

export function PublicAnnouncement() {
  const state = useQuery({
    queryKey: ["ncea", "site-settings"],
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await getSupabaseClient()
        .from("ncea_site_settings")
        .select("announcement,announcement_enabled")
        .eq("site_id", "ncea")
        .single();
      if (error) throw error;
      return data;
    },
  });
  return state.data?.announcement_enabled && state.data.announcement ? (
    <aside className="site-announcement" aria-label="Объявление NCEA">
      {state.data.announcement}
    </aside>
  ) : null;
}
