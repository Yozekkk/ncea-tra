export const DISCORD_URL = "https://discord.gg/u73vDgBMAn";
export const TELEGRAM_URL = "https://t.me/lisiy_bob";

export type NavKey = "home" | "services" | "portfolio" | "team" | "about" | "partner";

export type NavItem =
  | { key: NavKey; label: string; kind: "route"; to: "/" }
  | { key: NavKey; label: string; kind: "hash"; hash: string }
  | { key: NavKey; label: string; kind: "mega" };

/** Порядок пунктов навигации. Маршруты и якоря сохранены из прежней версии. */
export const NAV_ITEMS: NavItem[] = [
  { key: "home", label: "Главная", kind: "route", to: "/" },
  { key: "services", label: "Услуги", kind: "mega" },
  { key: "portfolio", label: "Портфолио", kind: "hash", hash: "portfolio" },
  { key: "team", label: "Отзывы", kind: "hash", hash: "team" },
  { key: "about", label: "О нас", kind: "hash", hash: "about" },
  { key: "partner", label: "Сотрудничество", kind: "hash", hash: "partner" },
];
