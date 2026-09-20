export type EmployeeLevel = "Стажёр" | "Junior" | "Middle" | "Lead";

export type Employee = {
  id: string;
  name: string;
  timezone: string | null;
  telegram: string | null;
  discord: string | null;
  role: string;
  level: EmployeeLevel;
  github_url: string | null;
  image_url: string | null;
  bio: string | null;
  sort_order: number;
};

export async function getActiveEmployees(): Promise<Employee[]> {
  const { data, error } = await getSupabaseClient()
    .from("ncea_employees")
    .select("id,name,role,level,timezone,telegram,discord,github_url,image_url,bio,sort_order")
    .eq("is_active", true)
    .order("sort_order")
    .order("name")
    .order("id");
  if (error) throw new Error(error.message || "Не удалось загрузить сотрудников NCEA.");
  return (data ?? []) as Employee[];
}
import { getSupabaseClient } from "@/lib/supabase";
