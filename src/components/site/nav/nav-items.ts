import { Home, LayoutGrid, Sparkles, Users, Handshake, type LucideIcon } from "lucide-react";

export const DISCORD_URL = "https://discord.gg/u73vDgBMAn";
export const TELEGRAM_URL = "https://t.me/lisiy_bob";

export type NavKey = "home" | "services" | "portfolio" | "team" | "partner";

export type NavItem =
  | { key: NavKey; label: string; icon: LucideIcon; kind: "route"; to: "/" }
  | { key: NavKey; label: string; icon: LucideIcon; kind: "hash"; hash: string }
  | { key: NavKey; label: string; icon: LucideIcon; kind: "mega" };

/** Порядок пунктов навигации. Маршруты и якоря сохранены из прежней версии. */
export const NAV_ITEMS: NavItem[] = [
  { key: "home", label: "Главная", icon: Home, kind: "route", to: "/" },
  { key: "services", label: "Услуги", icon: LayoutGrid, kind: "mega" },
  { key: "portfolio", label: "Портфолио", icon: Sparkles, kind: "hash", hash: "portfolio" },
  { key: "team", label: "Отзывы", icon: Users, kind: "hash", hash: "team" },
  { key: "partner", label: "Сотрудничество", icon: Handshake, kind: "hash", hash: "partner" },
];
