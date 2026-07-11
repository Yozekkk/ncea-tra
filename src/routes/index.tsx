import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const DISCORD_TAG = "@yozekkk";
const TELEGRAM_TAG = "@lisiy_bob";
const DESIGNER = "@yozekkk";

/* ---------- tiny inline icons (stroke = currentColor) ---------- */
type IconProps = { className?: string };
const I = {
  Home: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={p.className}>
      <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" strokeLinejoin="round" />
    </svg>
  ),
  Star: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={p.className}>
      <path d="m12 3 2.6 5.6 6 .6-4.5 4.1 1.3 6L12 16.8 6.6 19.3l1.3-6L3.4 9.2l6-.6z" strokeLinejoin="round" />
    </svg>
  ),
  Cube: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={p.className}>
      <path d="M12 3 3 7.5v9L12 21l9-4.5v-9zM3 7.5 12 12m0 0 9-4.5M12 12v9" strokeLinejoin="round" />
    </svg>
  ),
  Group: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={p.className}>
      <circle cx="9" cy="9" r="3.2" /><circle cx="17" cy="11" r="2.4" />
      <path d="M3 19c.7-3 3.2-4.6 6-4.6S14.3 16 15 19M14.5 19c.4-1.8 1.8-3 3.5-3s3.1 1.2 3.5 3" />
    </svg>
  ),
  Chat: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={p.className}>
      <path d="M4 5h16v11H8l-4 4z" strokeLinejoin="round" />
    </svg>
  ),
  Shield: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={p.className}>
      <path d="M12 3 4 6v6c0 4.5 3.3 8.3 8 9 4.7-.7 8-4.5 8-9V6z" strokeLinejoin="round" />
    </svg>
  ),
  Scale: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={p.className}>
      <path d="M12 4v16M5 20h14M6 8h12l-3 7H9zM6 8l-3 5h6zM18 8l3 5h-6z" strokeLinejoin="round" />
    </svg>
  ),
  Heart: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={p.className}>
      <path d="M3 10h3l2-3 3 8 2-5 2 3h6" />
    </svg>
  ),
  Service: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={p.className}>
      <rect x="3" y="5" width="18" height="6" rx="1.5" /><rect x="3" y="13" width="18" height="6" rx="1.5" />
      <circle cx="7" cy="8" r="1" fill="currentColor" /><circle cx="7" cy="16" r="1" fill="currentColor" />
    </svg>
  ),
  Arrow: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={p.className}>
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  ),
  ArrowDown: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={p.className}>
      <path d="M12 5v14M6 13l6 6 6-6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  ),
  Telegram: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={p.className}>
      <path d="M9.04 15.47 8.9 19.4c.4 0 .58-.17.8-.38l1.92-1.84 3.98 2.91c.73.4 1.25.19 1.45-.67l2.63-12.3c.27-1.07-.39-1.5-1.1-1.24L3.4 10.41c-1.05.4-1.04.99-.18 1.25l4.07 1.27 9.45-5.96c.45-.28.86-.13.52.16z" />
    </svg>
  ),
  Discord: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={p.className}>
      <path d="M19.3 5.3A17 17 0 0 0 15.3 4l-.2.4a13 13 0 0 0-6.2 0L8.7 4a17 17 0 0 0-4 1.3C2.2 9 1.5 12.5 1.8 16a17 17 0 0 0 5.2 2.6l.4-.6c-.9-.3-1.7-.7-2.4-1.2l.2-.1a12 12 0 0 0 10.6 0l.2.1c-.7.5-1.5.9-2.4 1.2l.4.6a17 17 0 0 0 5.2-2.6c.3-4.1-.6-7.6-2.9-10.7zM8.8 14c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm6.4 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z" />
    </svg>
  ),
  Menu: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={p.className}>
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  ),
  Close: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={p.className}>
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  ),
  Sword: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={p.className}>
      <path d="M14 4h6v6L9 21l-3-3zM5 19l2 2" strokeLinejoin="round" />
    </svg>
  ),
  Hammer: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={p.className}>
      <path d="m3 21 7-7M9 13l4-4M8 6l4-4 7 7-4 4z" strokeLinejoin="round" />
    </svg>
  ),
  Compass: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={p.className}>
      <circle cx="12" cy="12" r="9" /><path d="m15 9-4 2-2 4 4-2z" strokeLinejoin="round" />
    </svg>
  ),
  Gift: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={p.className}>
      <path d="M3 9h18v4H3zM5 13v8h14v-8M12 9V5m0 4c-2 0-4-1-4-3a2 2 0 0 1 4 0m0 4c2 0 4-1 4-3a2 2 0 0 0-4 0" strokeLinejoin="round" />
    </svg>
  ),
  Info: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={p.className}>
      <circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" strokeLinecap="round" />
    </svg>
  ),
};

/* ---------- data ---------- */

const NAV = [
  { id: "home", label: "Главная", Icon: I.Home },
  { id: "whywe", label: "Почему мы", Icon: I.Star },
  { id: "events", label: "Ивенты", Icon: I.Cube },
  { id: "plugins", label: "Плагины", Icon: I.Service },
  { id: "custom", label: "Разработка", Icon: I.Hammer },
  { id: "team", label: "Команда", Icon: I.Group },
  { id: "contact", label: "Контакты", Icon: I.Chat },
];

const TYPES = [
  { id: "tournaments", label: "Турниры", desc: "Соревновательные форматы" },
  { id: "contests", label: "Конкурсы", desc: "Креативные форматы" },
] as const;

const CATEGORIES = {
  tournaments: [
    { id: "pvp", label: "PvP-турниры", Icon: I.Sword, unit: "уч.", min: 4, max: 64, step: 2, def: 16, pricePerUnit: 45 },
    { id: "quests", label: "Квесты", Icon: I.Compass, unit: "глав", min: 1, max: 10, step: 1, def: 3, pricePerUnit: 850 },
  ],
  contests: [
    { id: "build", label: "Строительные конкурсы", Icon: I.Hammer, unit: "блоков×100", min: 1, max: 50, step: 1, def: 12, pricePerUnit: 70 },
    { id: "season", label: "Сезонные ивенты", Icon: I.Gift, unit: "дней", min: 1, max: 14, step: 1, def: 5, pricePerUnit: 520 },
  ],
} as const;

// 100 Аргентов = 1 $
const ARG_PER_USD = 100;
const DDOS_EXTENDED_PRICE = 1875; // Аргенты

/* ---------- plugin build config data ---------- */

// База за один плагин
const PLUGIN_BASE_PRICE = 50; // ₳ (1 плагин = 0.5 $)
const PLUGIN_MAX = 72;

// Версии сервера (актуальные стабильные + LTS)
const SERVER_VERSIONS: { id: string; label: string; mult: number; note?: string }[] = [
  { id: "1.7.10", label: "1.7.10", mult: 1.3, note: "legacy" },
  { id: "1.8.9", label: "1.8.9", mult: 1.15, note: "PvP legacy" },
  { id: "1.12.2", label: "1.12.2", mult: 1.2, note: "modded LTS" },
  { id: "1.16.5", label: "1.16.5", mult: 1.05 },
  { id: "1.18.2", label: "1.18.2", mult: 1.0 },
  { id: "1.19.4", label: "1.19.4", mult: 1.0 },
  { id: "1.20.1", label: "1.20.1", mult: 1.0, note: "популярная" },
  { id: "1.20.4", label: "1.20.4", mult: 1.0 },
  { id: "1.20.6", label: "1.20.6", mult: 1.05 },
  { id: "1.21", label: "1.21", mult: 1.1 },
  { id: "1.21.4", label: "1.21.4", mult: 1.15, note: "latest" },
];

// Ядра / платформы
type CoreKind = "vanilla" | "bukkit" | "modded" | "hybrid" | "proxy";
const SERVER_CORES: { id: string; label: string; kind: CoreKind; mult: number; note?: string }[] = [
  { id: "vanilla", label: "Vanilla", kind: "vanilla", mult: 1.4, note: "без API" },
  { id: "craftbukkit", label: "CraftBukkit", kind: "bukkit", mult: 1.05 },
  { id: "spigot", label: "Spigot", kind: "bukkit", mult: 1.0 },
  { id: "paper", label: "Paper", kind: "bukkit", mult: 1.0, note: "рекомендуем" },
  { id: "purpur", label: "Purpur", kind: "bukkit", mult: 1.0 },
  { id: "pufferfish", label: "Pufferfish", kind: "bukkit", mult: 1.05 },
  { id: "folia", label: "Folia", kind: "bukkit", mult: 1.6, note: "регионы потоков" },
  { id: "leaf", label: "Leaf", kind: "bukkit", mult: 1.1 },
  { id: "leaves", label: "Leaves", kind: "bukkit", mult: 1.1 },
  { id: "sponge", label: "Sponge", kind: "bukkit", mult: 1.3 },
  { id: "forge", label: "Forge", kind: "modded", mult: 1.4 },
  { id: "neoforge", label: "NeoForge", kind: "modded", mult: 1.4 },
  { id: "fabric", label: "Fabric", kind: "modded", mult: 1.35 },
  { id: "quilt", label: "Quilt", kind: "modded", mult: 1.4 },
  { id: "mohist", label: "Mohist", kind: "hybrid", mult: 1.55, note: "Forge + Bukkit" },
  { id: "arclight", label: "Arclight", kind: "hybrid", mult: 1.55, note: "Forge + Bukkit" },
  { id: "magma", label: "Magma", kind: "hybrid", mult: 1.6 },
  { id: "catserver", label: "CatServer", kind: "hybrid", mult: 1.6 },
  { id: "velocity", label: "Velocity", kind: "proxy", mult: 1.25, note: "прокси" },
  { id: "bungeecord", label: "BungeeCord", kind: "proxy", mult: 1.2, note: "прокси" },
  { id: "waterfall", label: "Waterfall", kind: "proxy", mult: 1.2, note: "прокси" },
];

// Жанры серверов
const SERVER_GENRES = [
  { id: "survival", label: "Survival", mult: 1.0 },
  { id: "vanilla_plus", label: "Vanilla+", mult: 1.0 },
  { id: "hub", label: "Lobby / Hub", mult: 0.85 },
  { id: "creative", label: "Creative", mult: 0.9 },
  { id: "skyblock", label: "SkyBlock", mult: 1.2 },
  { id: "anarchy", label: "Anarchy", mult: 1.05 },
  { id: "faction", label: "Faction", mult: 1.3 },
  { id: "towny", label: "Towny", mult: 1.35 },
  { id: "prison", label: "Prison", mult: 1.4 },
  { id: "economy", label: "Economy", mult: 1.4 },
  { id: "minigames", label: "Minigames", mult: 1.5 },
  { id: "bedwars", label: "BedWars", mult: 1.5 },
  { id: "skywars", label: "SkyWars", mult: 1.45 },
  { id: "hungergames", label: "HungerGames", mult: 1.5 },
  { id: "pvp", label: "PvP-арена", mult: 1.3 },
  { id: "rpg", label: "RPG", mult: 1.8 },
  { id: "mmo", label: "MMO", mult: 2.0 },
  { id: "roleplay", label: "Roleplay / RP", mult: 1.75 },
  { id: "hardcore", label: "Hardcore", mult: 1.15 },
  { id: "techmodded", label: "Tech / Modded", mult: 1.6 },
];

const REVIEWS_ROW1 = [
  { name: "_Luminis_", avatar: "L", text: "Турнир был организован безупречно — задержек ноль, судейство справедливое." },
  { name: "PixelDuke", avatar: "P", text: "Строительный конкурс прошёл на одном дыхании. Атмосфера — топ." },
  { name: "kotik_999", avatar: "K", text: "Поддержка отвечает мгновенно. Помогли с регистрацией за 2 минуты." },
  { name: "NovaSlash", avatar: "N", text: "PvP-арена сбалансирована, лагов нет. Уважение команде NCEA." },
  { name: "redstone_q", avatar: "R", text: "Квест с сюжетом — это новый уровень. Хочу ещё." },
  { name: "biome_", avatar: "B", text: "Подключение быстрое, сервер стабилен даже на 100+ игроках." },
];
const REVIEWS_ROW2 = [
  { name: "void_walker", avatar: "V", text: "Сезонный ивент на Хэллоуин был сказочным. Призы реальные." },
  { name: "ametist", avatar: "A", text: "Договорились о приватном турнире для гильдии — всё сделали под ключ." },
  { name: "ferrum_", avatar: "F", text: "Чёткие правила, никаких читеров. За это +100." },
  { name: "minty", avatar: "M", text: "Дизайн карт и интро — будто в полноценную игру играешь." },
  { name: "axolot", avatar: "X", text: "Спасибо за тёплую атмосферу. Чувствуется, что делают с душой." },
  { name: "obsidian", avatar: "O", text: "Лучший Minecraft-ивент в ТРА. Подписываюсь под каждым словом." },
];

/* ---------- helpers ---------- */
function copy(text: string, msg = "Скопировано") {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => toast.success(msg));
  } else {
    toast(msg);
  }
}

/* ---------- components ---------- */

function Header({ active, onNav }: { active: string; onNav: (id: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-xl bg-stone-950/70 border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8 h-16 flex items-center justify-between">
        <a href="#home" onClick={(e) => { e.preventDefault(); onNav("home"); }} className="flex items-center gap-2">
          <span className="relative inline-flex w-8 h-8 items-center justify-center rounded-lg bg-linear-to-br from-brand-red to-brand-orange text-white font-display font-bold text-sm shadow-[0_8px_24px_-6px_rgba(255,77,77,.6)]">N</span>
          <span className="font-display font-bold text-lg tracking-tight">
            NovaCraft <span className="gradient-text">Event Agency</span>
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-1 rounded-full bg-white/3 ring-1 ring-white/10 p-1">
          {NAV.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => onNav(id)}
              className={`group inline-flex items-center gap-2 px-4 h-10 rounded-full text-sm transition-all duration-300 ${
                active === id ? "bg-white text-black" : "text-white/70 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={() => copy(DISCORD_TAG, `Discord-тег ${DISCORD_TAG} скопирован`)}
            className="hidden sm:inline-flex items-center gap-2 h-10 px-4 rounded-full gradient-btn text-sm font-medium">
            <I.Discord className="w-4 h-4" /> Discord
          </button>
          <button onClick={() => copy(TELEGRAM_TAG, `Telegram ${TELEGRAM_TAG} скопирован`)}
            className="hidden sm:inline-flex items-center gap-2 h-10 px-4 rounded-full ring-1 ring-white/15 text-sm text-white/80 hover:bg-white hover:text-black transition-all duration-300">
            <I.Telegram className="w-4 h-4" /> Telegram
          </button>
          <button onClick={() => setOpen(true)} className="lg:hidden w-10 h-10 inline-flex items-center justify-center rounded-full ring-1 ring-white/10 bg-white/3">
            <I.Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* mobile menu */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-xl">
          <div className="flex items-center justify-between h-16 px-4">
            <span className="font-display font-bold">NCEA</span>
            <button onClick={() => setOpen(false)} className="w-10 h-10 inline-flex items-center justify-center rounded-full ring-1 ring-white/10">
              <I.Close className="w-5 h-5" />
            </button>
          </div>
          <div className="px-4 flex flex-col gap-2">
            {NAV.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => { setOpen(false); onNav(id); }}
                className="flex items-center gap-3 h-14 px-4 rounded-2xl bg-white/3 ring-1 ring-white/10 text-left">
                <Icon className="w-5 h-5 text-white/70" /> <span className="font-medium">{label}</span>
              </button>
            ))}
            <button onClick={() => { copy(DISCORD_TAG, `Discord-тег ${DISCORD_TAG} скопирован`); }} className="mt-4 inline-flex items-center justify-center gap-2 h-12 rounded-2xl gradient-btn font-medium">
              <I.Discord className="w-5 h-5" /> Discord {DISCORD_TAG}
            </button>
            <button onClick={() => { copy(TELEGRAM_TAG, `Telegram ${TELEGRAM_TAG} скопирован`); }} className="inline-flex items-center justify-center gap-2 h-12 rounded-2xl ring-1 ring-white/15 font-medium">
              <I.Telegram className="w-5 h-5" /> Telegram {TELEGRAM_TAG}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

function Blob({ className }: { className?: string }) {
  return <div className={`pointer-events-none absolute rounded-full blur-[180px] saturate-50 ${className}`} />;
}

function StatusPill() {
  return (
    <span className="inline-flex items-center gap-2 h-8 pl-2 pr-3 rounded-full bg-white/3 ring-1 ring-white/10 text-xs text-white/70">
      <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
      Внесено в ЕРФ
    </span>
  );
}

function Hero({ onNav }: { onNav: (id: string) => void }) {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-28 pb-24 overflow-hidden">
      <Blob className="bg-brand-red/40 w-[520px] h-[520px] -top-32 -left-32" />
      <Blob className="bg-brand-orange/30 w-[600px] h-[600px] -bottom-40 right-[-160px]" />

      {/* pixel illustrations */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] grayscale select-none">
        <div className="absolute top-32 right-10 text-[180px] leading-none">⛏</div>
        <div className="absolute bottom-20 left-10 text-[160px] leading-none">🟧</div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8 w-full">
        <div className="max-w-3xl fade-up">
          <StatusPill />
          <h1 className="mt-6 font-display font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-[56px] leading-[0.95]">
            Мы создаём <span className="gradient-text">события</span>,<br />
            которые делают игру интереснее
          </h1>
          <p className="mt-6 text-white/60 text-base lg:text-lg max-w-2xl">
            NovaCraft Event Agency — организация и проведение PvP-турниров, строительных конкурсов,
            квестов и сезонных ивентов. Также настройка Minecraft-серверов. Прописка Губерния Нова-Люминис.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => onNav("whywe")} className="inline-flex items-center gap-2 h-12 px-6 rounded-full gradient-btn font-medium">
              Узнать подробнее <I.Arrow className="w-4 h-4" />
            </button>
            <button onClick={() => onNav("events")} className="inline-flex items-center gap-2 h-12 px-6 rounded-full ring-1 ring-white/15 text-white/80 hover:bg-white hover:text-black transition-all duration-300">
              К ивентам <I.ArrowDown className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
            {[
              { k: "1+", v: "проведённых ивентов" },
              { k: "5+", v: "уникальных игроков" },
              { k: "24/7", v: "поддержка сервера" },
              { k: "99.9%", v: "аптайм" },
            ].map((s) => (
              <div key={s.v} className="glass-card px-4 py-4">
                <div className="font-display font-bold text-2xl gradient-text">{s.k}</div>
                <div className="text-[12px] text-white/55 mt-1">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHead({ kicker, title, accent }: { kicker: string; title: string; accent?: string }) {
  return (
    <div className="max-w-2xl">
      <div className="text-[11px] tracking-[0.3em] uppercase text-white/45">{kicker}</div>
      <h2 className="mt-4 font-display font-extrabold text-3xl lg:text-5xl leading-[1.05]">
        {title} {accent && <span className="text-brand-red">{accent}</span>}
      </h2>
    </div>
  );
}

function WhyWe() {
  const cards = [
    { Icon: I.Shield, title: "Администрирование сервера 24/7", desc: "Дежурная смена модераторов, мониторинг производительности и мгновенный отклик на инциденты.", span: "lg:col-span-2", emoji: "🛡️" },
    { Icon: I.Scale, title: "Честные правила и рейтинги", desc: "Прозрачное судейство и анти-чит.", span: "", emoji: "⚖️" },
    { Icon: I.Heart, title: "Живая поддержка", desc: "Отвечаем в Discord за минуты.", span: "", emoji: "❤️" },
    { Icon: I.Service, title: "Регулярные ивенты и турниры", desc: "Календарь событий обновляется каждую неделю — от мини-турниров до больших сезонных мероприятий.", span: "lg:col-span-2", emoji: "🎮" },
  ];
  return (
    <section id="whywe" className="relative py-24 lg:py-32">
      <Blob className="bg-brand-red/20 w-[420px] h-[420px] top-20 right-[-120px]" />
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHead kicker="Почему мы" title="Не самые быстрые." accent="Самые надёжные." />
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <div key={c.title} className={`relative overflow-hidden glass-card p-8 ${c.span}`}>
              <div className="absolute -right-6 -bottom-6 text-[140px] opacity-[0.07] select-none">{c.emoji}</div>
              <div className="inline-flex w-11 h-11 items-center justify-center rounded-xl bg-linear-to-br from-brand-red/20 to-brand-orange/20 ring-1 ring-white/10 text-brand-orange">
                <c.Icon className="w-6 h-6" />
              </div>
              <h3 className="mt-5 font-display font-bold text-xl lg:text-2xl">{c.title}</h3>
              <p className="mt-2 text-white/55 text-sm leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PromoBanner() {
  return (
    <section className="relative py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-[40px] lg:rounded-[60px] bg-white/3 ring-1 ring-white/10 p-8 lg:p-16">
          <Blob className="bg-brand-red/30 w-[500px] h-[500px] top-[-160px] left-[-100px]" />
          <Blob className="bg-brand-orange/30 w-[500px] h-[500px] bottom-[-200px] right-[-100px]" />
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex w-10 h-10 items-center justify-center rounded-xl bg-linear-to-br from-brand-red to-brand-orange font-display font-bold">N</span>
              <span className="inline-flex items-center h-7 px-3 rounded-full bg-white/5 ring-1 ring-white/10 text-[11px] tracking-widest uppercase text-white/60">NCEA</span>
            </div>
            <h2 className="font-display font-black text-4xl sm:text-6xl lg:text-[9rem] leading-[0.85] tracking-tight">
              Nova<span className="gradient-text">Craft</span>
            </h2>
            <p className="text-white/55 max-w-xl text-base lg:text-lg">
              Не просто агентство, а команда, которая делает вашу игру ярче.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Events() {
  const [type, setType] = useState<"tournaments" | "contests">("tournaments");
  const cats = CATEGORIES[type];
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries([...CATEGORIES.tournaments, ...CATEGORIES.contests].map((c) => [c.id, c.def])),
  );
  const [ddos, setDdos] = useState<"basic" | "extended">("basic");

  const itemsTotal = cats.reduce((sum, c) => sum + (values[c.id] || 0) * c.pricePerUnit, 0);
  const ddosTotal = ddos === "extended" ? DDOS_EXTENDED_PRICE : 0;
  const total = itemsTotal + ddosTotal;
  const usd = (total / ARG_PER_USD).toFixed(2);

  

  return (
    <section id="events" className="relative py-24 lg:py-32">
      <Blob className="bg-brand-orange/20 w-[500px] h-[500px] -top-10 -left-32" />
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <SectionHead kicker="Ивенты" title="Выберите свой" accent="ивент" />
          <p className="text-white/45 max-w-sm text-sm">Соберите формат под себя — мы оформим и проведём.</p>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
          {/* left config */}
          <div className="flex flex-col gap-4">
            {/* step 1 */}
            <div className="glass-card p-6 lg:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] tracking-widest uppercase text-white/40">Шаг 1</div>
                  <h3 className="font-display font-bold text-xl mt-1">Тип мероприятия</h3>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {TYPES.map((t) => {
                  const active = type === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setType(t.id)}
                      className={`rounded-2xl p-5 text-left transition-all duration-300 ring-1 ${
                        active ? "ring-brand-red bg-white/5" : "ring-white/10 bg-white/3 hover:ring-white/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-display font-semibold">{t.label}</div>
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${active ? "bg-brand-red" : "bg-white/15"}`} />
                      </div>
                      <div className="text-white/45 text-xs mt-1">{t.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* step 2 */}
            <div className="glass-card p-6 lg:p-8">
              <div className="text-[11px] tracking-widest uppercase text-white/40">Шаг 2</div>
              <h3 className="font-display font-bold text-xl mt-1">Категория</h3>
              <div className="mt-5 flex flex-col gap-4">
                {cats.map((c) => (
                  <div key={c.id} className="rounded-2xl bg-white/3 ring-1 ring-white/10 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex w-10 h-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 text-brand-orange">
                          <c.Icon className="w-5 h-5" />
                        </span>
                        <div>
                          <div className="font-display font-semibold">{c.label}</div>
                          <div className="text-white/45 text-xs">диапазон масштаба</div>
                        </div>
                      </div>
                      <div className="font-display font-bold text-lg">
                        {values[c.id]} <span className="text-white/45 text-xs font-normal">{c.unit}</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      className="brand-range w-full mt-4"
                      min={c.min}
                      max={c.max}
                      step={c.step}
                      value={values[c.id]}
                      onChange={(e) => setValues((v) => ({ ...v, [c.id]: +e.target.value }))}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* step 3 */}
            <div className="glass-card p-6 lg:p-8">
              <div className="text-[11px] tracking-widest uppercase text-white/40">Шаг 3</div>
              <h3 className="font-display font-bold text-xl mt-1">DDoS-защита сервера</h3>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  { id: "basic", title: "Базовая", desc: "бесплатно" },
                  { id: "extended", title: "Расширенная", desc: "L3–L7" },
                ].map((o) => {
                  const active = ddos === o.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() => setDdos(o.id as "basic" | "extended")}
                      className={`rounded-2xl p-5 text-left transition-all duration-300 ring-1 ${
                        active ? "ring-brand-red bg-white/5" : "ring-white/10 bg-white/3 hover:ring-white/30"
                      }`}
                    >
                      <div className="font-display font-semibold">{o.title}</div>
                      <div className="text-white/45 text-xs mt-1">{o.desc}</div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex items-start gap-3 rounded-2xl bg-white/3 ring-1 ring-white/10 p-4 text-sm text-white/55">
                <I.Info className="w-4 h-4 mt-0.5 text-brand-orange shrink-0" />
                Базовая защита включена для всех ивентов. Расширенная — для крупных публичных событий с трансляцией.
              </div>
            </div>
          </div>

          {/* right totals */}
          <aside className="glass-card p-6 lg:p-8 h-fit lg:sticky lg:top-24">
            <div className="text-[11px] tracking-widest uppercase text-white/40">Итого</div>
            <div className="mt-2 font-display font-extrabold text-5xl">
              {total.toLocaleString("ru-RU")} <span className="gradient-text">₳</span>
            </div>
            <div className="text-white/55 text-sm mt-2">
              ≈ {usd} $
            </div>
            <div className="text-white/45 text-xs mt-1">
              Расчёт в Аргентах — внутриигровой валюте Нова-Люминис.
            </div>

            <div className="mt-6 rounded-2xl bg-white/3 ring-1 ring-white/10 p-4 text-sm text-white/65 leading-relaxed">
              <div className="text-[11px] tracking-widest uppercase text-white/40 mb-2">Конфигурация</div>
              <ul className="flex flex-col gap-1.5">
                {cats.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-3">
                    <span>{c.label} · {values[c.id]} {c.unit}</span>
                    <span className="font-display font-semibold text-white/85">{(values[c.id] * c.pricePerUnit).toLocaleString("ru-RU")} ₳</span>
                  </li>
                ))}
                <li className="flex items-center justify-between gap-3 pt-2 mt-1 border-t border-white/5">
                  <span>Защита · {ddos === "basic" ? "Базовая" : "Расширенная"}</span>
                  <span className="font-display font-semibold text-white/85">{ddosTotal.toLocaleString("ru-RU")} ₳</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button onClick={() => copy(TELEGRAM_TAG, `Telegram ${TELEGRAM_TAG} скопирован`)} className="inline-flex items-center justify-center gap-2 h-12 rounded-full gradient-btn font-medium">
                <I.Telegram className="w-5 h-5" /> Telegram {TELEGRAM_TAG}
              </button>
              <button onClick={() => copy(DISCORD_TAG, `Discord-тег ${DISCORD_TAG} скопирован`)} className="inline-flex items-center justify-center gap-2 h-12 rounded-full ring-1 ring-white/15 hover:bg-white hover:text-black transition-all duration-300">
                <I.Discord className="w-5 h-5" /> Discord {DISCORD_TAG}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ---------- custom plugin development ---------- */

type Complexity = "simple" | "medium" | "hard" | "very_hard";
const COMPLEXITY: Record<Complexity, { label: string; price: number; desc: string; tone: string }> = {
  simple:    { label: "Простая",       price: 300,  desc: "1–2 команды, лёгкая логика",           tone: "text-emerald-300" },
  medium:    { label: "Средняя",       price: 700,  desc: "GUI, конфиг, события",                 tone: "text-sky-300" },
  hard:      { label: "Сложная",       price: 1500, desc: "Многомодульная система, интеграции",   tone: "text-brand-orange" },
  very_hard: { label: "Очень сложная", price: 3000, desc: "Крупная механика, кастомная логика",   tone: "text-brand-red" },
};

const CUSTOM_EXTRAS: { id: string; label: string; add: number; desc: string }[] = [
  { id: "api",          label: "Открытое API",          add: 0.08, desc: "точки расширения для сторонних плагинов" },
  { id: "web",          label: "Веб-панель",            add: 0.15, desc: "React/HTMX панель управления" },
  { id: "db",           label: "Интеграция с БД",       add: 0.10, desc: "MySQL / PostgreSQL / MongoDB" },
  { id: "placeholders", label: "PlaceholderAPI",        add: 0.05, desc: "плейсхолдеры для скорборда/чата" },
  { id: "i18n",         label: "Мультиязычность",       add: 0.08, desc: "RU / EN / другие языки" },
  { id: "metrics",      label: "Метрики / аналитика",   add: 0.07, desc: "bStats + собственный трекинг" },
  { id: "discord",      label: "Discord-бот",           add: 0.12, desc: "двусторонняя связь через JDA" },
  { id: "tests",        label: "Юнит-тесты",            add: 0.10, desc: "покрытие ключевой логики" },
];

const URGENCY_OPTS = [
  { id: "normal", label: "Обычно", note: "2–3 недели",  mult: 1.0 },
  { id: "fast",   label: "Быстро", note: "7 дней",      mult: 1.25 },
  { id: "rush",   label: "Срочно", note: "72 часа",     mult: 1.6 },
];

const FIXES_OPTS = [
  { id: "none", label: "Без поддержки", add: 0.0 },
  { id: "m1",   label: "1 месяц",       add: 0.05 },
  { id: "m3",   label: "3 месяца",      add: 0.12 },
  { id: "m6",   label: "6 месяцев",     add: 0.25 },
];

type CustomPlugin = { id: string; name: string; complexity: Complexity };
type CustomState = {
  plugins: CustomPlugin[];
  versionIds: string[];
  coreId: string;
  multiVersion: boolean;
  sourceCode: boolean;
  documentation: boolean;
  fixes: string;
  urgency: string;
  extras: string[];
};

function makeCustomState(overrides?: Partial<CustomState>): CustomState {
  return {
    plugins: [{ id: "p1", name: "Плагин #1", complexity: "medium" }],
    versionIds: ["1.20.1"],
    coreId: "paper",
    multiVersion: false,
    sourceCode: false,
    documentation: true,
    fixes: "m1",
    urgency: "normal",
    extras: [],
    ...overrides,
  };
}

function computeCustom(s: CustomState) {
  const core = SERVER_CORES.find((c) => c.id === s.coreId) ?? SERVER_CORES[3];
  const versions = s.versionIds
    .map((id) => SERVER_VERSIONS.find((v) => v.id === id))
    .filter((v): v is (typeof SERVER_VERSIONS)[number] => Boolean(v));
  const vMult = versions.length ? Math.max(...versions.map((v) => v.mult)) : 1;
  const baseSum = s.plugins.reduce((sum, p) => sum + COMPLEXITY[p.complexity].price, 0);

  let extraAdd = 0;
  if (s.sourceCode) extraAdd += 0.2;
  if (s.documentation) extraAdd += 0.15;
  extraAdd += FIXES_OPTS.find((f) => f.id === s.fixes)?.add ?? 0;
  for (const eid of s.extras) {
    const e = CUSTOM_EXTRAS.find((x) => x.id === eid);
    if (e) extraAdd += e.add;
  }

  const extraVersions = Math.max(0, s.versionIds.length - 1);
  const multiVerMult = 1 + extraVersions * 0.12 + (s.multiVersion ? 0.2 : 0);

  const urg = URGENCY_OPTS.find((u) => u.id === s.urgency) ?? URGENCY_OPTS[0];
  const subtotal = baseSum * core.mult * vMult * multiVerMult * (1 + extraAdd);
  const total = Math.round(subtotal * urg.mult);
  return { total, baseSum, core, versions, vMult, multiVerMult, extraAdd, urg };
}

const CORE_GROUPS_ALL: { kind: CoreKind; label: string }[] = [
  { kind: "bukkit", label: "Bukkit / Spigot / Paper" },
  { kind: "modded", label: "Modded" },
  { kind: "hybrid", label: "Hybrid (Forge + Bukkit)" },
  { kind: "proxy",  label: "Proxy" },
  { kind: "vanilla",label: "Vanilla" },
];

/* ---------- reusable custom-plugins form ---------- */
function CustomPluginForm({
  state,
  setState,
  compact = false,
}: {
  state: CustomState;
  setState: (updater: (s: CustomState) => CustomState) => void;
  compact?: boolean;
}) {
  const addPlugin = () =>
    setState((s) => ({
      ...s,
      plugins: [
        ...s.plugins,
        { id: `p${Date.now()}`, name: `Плагин #${s.plugins.length + 1}`, complexity: "medium" },
      ],
    }));
  const removePlugin = (id: string) =>
    setState((s) => ({ ...s, plugins: s.plugins.filter((p) => p.id !== id) }));
  const setPlugin = (id: string, patch: Partial<CustomPlugin>) =>
    setState((s) => ({ ...s, plugins: s.plugins.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  const toggleVersion = (id: string) =>
    setState((s) => ({
      ...s,
      versionIds: s.versionIds.includes(id)
        ? s.versionIds.filter((v) => v !== id)
        : [...s.versionIds, id],
    }));
  const toggleExtra = (id: string) =>
    setState((s) => ({
      ...s,
      extras: s.extras.includes(id) ? s.extras.filter((e) => e !== id) : [...s.extras, id],
    }));

  return (
    <div className="flex flex-col gap-4">
      {/* plugins list */}
      <div className="glass-card p-6 lg:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] tracking-widest uppercase text-white/40">Плагины</div>
            <h3 className="font-display font-bold text-xl mt-1">Список и сложность</h3>
            <div className="text-white/45 text-xs mt-1">Добавьте плагины — для каждого выберите сложность.</div>
          </div>
          <button
            onClick={addPlugin}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-full gradient-btn text-sm font-medium"
          >
            + плагин
          </button>
        </div>
        <div className="mt-5 flex flex-col gap-3">
          {state.plugins.map((p, idx) => (
            <div key={p.id} className="rounded-2xl bg-white/3 ring-1 ring-white/10 p-4 fade-up">
              <div className="flex items-center gap-3">
                <span className="inline-flex w-8 h-8 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10 text-white/50 text-xs font-display font-bold">
                  {idx + 1}
                </span>
                <input
                  value={p.name}
                  onChange={(e) => setPlugin(p.id, { name: e.target.value })}
                  className="flex-1 bg-transparent outline-none text-sm font-display font-semibold placeholder:text-white/25"
                  placeholder={`Плагин #${idx + 1}`}
                />
                {state.plugins.length > 1 && (
                  <button
                    onClick={() => removePlugin(p.id)}
                    className="w-8 h-8 inline-flex items-center justify-center rounded-full ring-1 ring-white/10 text-white/50 hover:text-brand-red hover:ring-brand-red transition"
                    aria-label="Удалить"
                  >
                    <I.Close className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(COMPLEXITY) as Complexity[]).map((k) => {
                  const opt = COMPLEXITY[k];
                  const active = p.complexity === k;
                  return (
                    <button
                      key={k}
                      onClick={() => setPlugin(p.id, { complexity: k })}
                      className={`rounded-xl p-3 text-left ring-1 transition-all duration-300 ${
                        active ? "ring-brand-red bg-white/5" : "ring-white/10 bg-white/3 hover:ring-white/30"
                      }`}
                    >
                      <div className={`text-xs font-display font-semibold ${opt.tone}`}>{opt.label}</div>
                      <div className="text-white/40 text-[10px] mt-0.5">{opt.price} ₳</div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* versions */}
      <div className="glass-card p-6 lg:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] tracking-widest uppercase text-white/40">Версии</div>
            <h3 className="font-display font-bold text-xl mt-1">Версии Minecraft</h3>
            <div className="text-white/45 text-xs mt-1">
              Можно выбрать несколько — цена вырастет за счёт поддержки.
            </div>
          </div>
          <label className="inline-flex items-center gap-3 text-sm text-white/70">
            <span>Мультиверсия</span>
            <button
              onClick={() => setState((s) => ({ ...s, multiVersion: !s.multiVersion }))}
              className={`relative w-12 h-7 rounded-full ring-1 transition-all ${
                state.multiVersion ? "bg-brand-red/30 ring-brand-red" : "bg-white/5 ring-white/15"
              }`}
              aria-pressed={state.multiVersion}
            >
              <span
                className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
                  state.multiVersion ? "left-6" : "left-1"
                }`}
              />
            </button>
          </label>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {SERVER_VERSIONS.map((v) => {
            const active = state.versionIds.includes(v.id);
            return (
              <button
                key={v.id}
                onClick={() => toggleVersion(v.id)}
                className={`inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm transition-all duration-300 ring-1 ${
                  active
                    ? "ring-brand-red bg-white/5 text-white"
                    : "ring-white/10 bg-white/3 text-white/70 hover:ring-white/30"
                }`}
              >
                <span className="font-display font-semibold">{v.label}</span>
                {v.note && <span className="text-[10px] uppercase tracking-widest text-white/40">{v.note}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* core */}
      <div className="glass-card p-6 lg:p-8">
        <div className="text-[11px] tracking-widest uppercase text-white/40">Ядро</div>
        <h3 className="font-display font-bold text-xl mt-1">Целевая платформа</h3>
        <div className="mt-5 flex flex-col gap-4">
          {CORE_GROUPS_ALL.map((g) => {
            const items = SERVER_CORES.filter((c) => c.kind === g.kind);
            if (!items.length) return null;
            return (
              <div key={g.kind}>
                <div className="text-[11px] tracking-widest uppercase text-white/35 mb-2">{g.label}</div>
                <div className="flex flex-wrap gap-2">
                  {items.map((c) => {
                    const active = state.coreId === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setState((s) => ({ ...s, coreId: c.id }))}
                        className={`inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm transition-all duration-300 ring-1 ${
                          active
                            ? "ring-brand-red bg-white/5 text-white"
                            : "ring-white/10 bg-white/3 text-white/70 hover:ring-white/30"
                        }`}
                      >
                        <span className="font-display font-semibold">{c.label}</span>
                        {c.note && (
                          <span className="text-[10px] uppercase tracking-widest text-white/40">{c.note}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* deliverables */}
      <div className="glass-card p-6 lg:p-8">
        <div className="text-[11px] tracking-widest uppercase text-white/40">Поставка</div>
        <h3 className="font-display font-bold text-xl mt-1">Что войдёт в сдачу</h3>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { id: "sourceCode",    title: "Исходный код",  desc: "полные исходники + git-репозиторий", key: "sourceCode" as const },
            { id: "documentation", title: "Документация",  desc: "README, API, конфиги",              key: "documentation" as const },
          ].map((o) => {
            const active = state[o.key];
            return (
              <button
                key={o.id}
                onClick={() => setState((s) => ({ ...s, [o.key]: !s[o.key] }))}
                className={`rounded-2xl p-5 text-left transition-all duration-300 ring-1 ${
                  active ? "ring-brand-red bg-white/5" : "ring-white/10 bg-white/3 hover:ring-white/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-display font-semibold">{o.title}</div>
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${active ? "bg-brand-red" : "bg-white/15"}`}
                  />
                </div>
                <div className="text-white/45 text-xs mt-1">{o.desc}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-5">
          <div className="text-[11px] tracking-widest uppercase text-white/35 mb-2">Бесплатные исправления</div>
          <div className="flex flex-wrap gap-2">
            {FIXES_OPTS.map((f) => {
              const active = state.fixes === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setState((s) => ({ ...s, fixes: f.id }))}
                  className={`inline-flex items-center h-10 px-4 rounded-full text-sm transition-all duration-300 ring-1 ${
                    active
                      ? "ring-brand-red bg-white/5 text-white"
                      : "ring-white/10 bg-white/3 text-white/70 hover:ring-white/30"
                  }`}
                >
                  <span className="font-display font-semibold">{f.label}</span>
                  {f.add > 0 && (
                    <span className="ml-2 text-[10px] uppercase tracking-widest text-white/40">
                      +{Math.round(f.add * 100)}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* urgency */}
      <div className="glass-card p-6 lg:p-8">
        <div className="text-[11px] tracking-widest uppercase text-white/40">Срочность</div>
        <h3 className="font-display font-bold text-xl mt-1">Сроки выполнения</h3>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {URGENCY_OPTS.map((u) => {
            const active = state.urgency === u.id;
            return (
              <button
                key={u.id}
                onClick={() => setState((s) => ({ ...s, urgency: u.id }))}
                className={`rounded-2xl p-5 text-left transition-all duration-300 ring-1 ${
                  active ? "ring-brand-red bg-white/5" : "ring-white/10 bg-white/3 hover:ring-white/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-display font-semibold">{u.label}</div>
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${active ? "bg-brand-red" : "bg-white/15"}`}
                  />
                </div>
                <div className="text-white/45 text-xs mt-1">{u.note}</div>
                <div className="text-brand-orange text-[11px] mt-2 font-display font-semibold">
                  ×{u.mult.toFixed(2)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* extras */}
      {!compact && (
        <div className="glass-card p-6 lg:p-8">
          <div className="text-[11px] tracking-widest uppercase text-white/40">Дополнительно</div>
          <h3 className="font-display font-bold text-xl mt-1">Расширенные функции</h3>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CUSTOM_EXTRAS.map((e) => {
              const active = state.extras.includes(e.id);
              return (
                <button
                  key={e.id}
                  onClick={() => toggleExtra(e.id)}
                  className={`rounded-2xl p-4 text-left transition-all duration-300 ring-1 ${
                    active ? "ring-brand-red bg-white/5" : "ring-white/10 bg-white/3 hover:ring-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-display font-semibold text-sm">{e.label}</div>
                    <span className="text-white/50 text-[11px]">+{Math.round(e.add * 100)}%</span>
                  </div>
                  <div className="text-white/45 text-xs mt-1">{e.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {compact && (
        <div className="glass-card p-6 lg:p-8">
          <div className="text-[11px] tracking-widest uppercase text-white/40">Дополнительно</div>
          <h3 className="font-display font-bold text-xl mt-1">Быстрые опции</h3>
          <div className="mt-5 flex flex-wrap gap-2">
            {CUSTOM_EXTRAS.map((e) => {
              const active = state.extras.includes(e.id);
              return (
                <button
                  key={e.id}
                  onClick={() => toggleExtra(e.id)}
                  className={`inline-flex items-center gap-2 h-9 px-3 rounded-full text-xs transition-all duration-300 ring-1 ${
                    active
                      ? "ring-brand-red bg-white/5 text-white"
                      : "ring-white/10 bg-white/3 text-white/70 hover:ring-white/30"
                  }`}
                >
                  <span className="font-display font-semibold">{e.label}</span>
                  <span className="text-white/40">+{Math.round(e.add * 100)}%</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CustomTotalsCard({ state, title = "Кастомная разработка" }: { state: CustomState; title?: string }) {
  const r = computeCustom(state);
  const usd = (r.total / ARG_PER_USD).toFixed(2);
  return (
    <div className="rounded-2xl bg-white/3 ring-1 ring-white/10 p-5">
      <div className="text-[11px] tracking-widest uppercase text-white/40">{title}</div>
      <div className="mt-2 font-display font-extrabold text-3xl">
        {r.total.toLocaleString("ru-RU")} <span className="gradient-text">₳</span>
      </div>
      <div className="text-white/55 text-xs mt-1">≈ {usd} $</div>
      <ul className="mt-4 flex flex-col gap-1.5 text-xs text-white/65">
        <li className="flex justify-between gap-3">
          <span>База · {state.plugins.length} шт.</span>
          <span className="font-display font-semibold text-white/85">{r.baseSum.toLocaleString("ru-RU")} ₳</span>
        </li>
        <li className="flex justify-between gap-3">
          <span>Ядро · {r.core.label}</span>
          <span className="text-white/60">×{r.core.mult}</span>
        </li>
        <li className="flex justify-between gap-3">
          <span>Версии · {state.versionIds.length || "—"}</span>
          <span className="text-white/60">×{(r.vMult * r.multiVerMult).toFixed(2)}</span>
        </li>
        <li className="flex justify-between gap-3">
          <span>Опции</span>
          <span className="text-white/60">+{Math.round(r.extraAdd * 100)}%</span>
        </li>
        <li className="flex justify-between gap-3 pt-2 mt-1 border-t border-white/5">
          <span>Срочность · {r.urg.label}</span>
          <span className="text-white/60">×{r.urg.mult}</span>
        </li>
      </ul>
    </div>
  );
}

function Plugins() {
  const [tab, setTab] = useState<"stack" | "custom">("stack");
  const [useCustom, setUseCustom] = useState(false);
  const [customState, setCustomState] = useState<CustomState>(() => makeCustomState());

  // stack (готовая сборка)
  const [count, setCount] = useState(3);
  const [versionId, setVersionId] = useState<string>("1.20.1");
  const [coreId, setCoreId] = useState<string>("paper");
  const [genreId, setGenreId] = useState<string>("survival");
  const [rush, setRush] = useState(false);

  const version = SERVER_VERSIONS.find((v) => v.id === versionId)!;
  const core = SERVER_CORES.find((c) => c.id === coreId)!;
  const genre = SERVER_GENRES.find((g) => g.id === genreId)!;

  const bulk = count >= 40 ? 0.6 : count >= 20 ? 0.7 : count >= 10 ? 0.8 : count >= 5 ? 0.9 : 1.0;
  const bulkLabel =
    count >= 40 ? "−40% объёмная скидка"
    : count >= 20 ? "−30% объёмная скидка"
    : count >= 10 ? "−20% объёмная скидка"
    : count >= 5 ? "−10% объёмная скидка"
    : `от 1 до ${PLUGIN_MAX} шт.`;
  const base = Math.round(count * PLUGIN_BASE_PRICE * bulk);
  const subtotal = Math.round(base * core.mult * genre.mult * version.mult);
  const rushFee = rush ? Math.round(subtotal * 0.3) : 0;
  const stackTotal = subtotal + rushFee;

  const customTotal = useCustom ? computeCustom(customState).total : 0;
  const total = stackTotal + customTotal;
  const usd = (total / ARG_PER_USD).toFixed(2);

  return (
    <section id="plugins" className="relative py-24 lg:py-32">
      <Blob className="bg-brand-red/20 w-[500px] h-[500px] -top-10 right-[-160px]" />
      <Blob className="bg-brand-orange/15 w-[420px] h-[420px] bottom-[-80px] left-[-120px]" />
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <SectionHead kicker="Конфигуратор" title="Сборка плагинов" accent="под ваш сервер" />
          <p className="text-white/45 max-w-sm text-sm">
            Готовый стек плагинов или собственная кастомная разработка — комбинируйте под задачу.
          </p>
        </div>

        {/* Tab bar */}
        <div className="mt-8 inline-flex items-center gap-1 rounded-full bg-white/3 ring-1 ring-white/10 p-1">
          {([
            { id: "stack" as const, label: "Стек плагинов" },
            { id: "custom" as const, label: "Кастомные плагины" },
          ]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 h-10 px-5 rounded-full text-sm transition-all duration-300 ${
                tab === t.id ? "bg-white text-black" : "text-white/70 hover:text-white"
              }`}
            >
              {t.label}
              {t.id === "custom" && useCustom && (
                <span className="inline-flex w-2 h-2 rounded-full bg-brand-red" />
              )}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
          {/* left config */}
          <div className="flex flex-col gap-4">
            {tab === "stack" && (
              <>
                <div className="glass-card p-6 lg:p-8 fade-up">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[11px] tracking-widest uppercase text-white/40">Шаг 1</div>
                      <h3 className="font-display font-bold text-xl mt-1">Количество плагинов</h3>
                      <div className="text-white/45 text-xs mt-1">{bulkLabel}</div>
                    </div>
                    <div className="font-display font-bold text-3xl">
                      {count} <span className="text-white/45 text-sm font-normal">шт.</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    className="brand-range w-full mt-5"
                    min={1}
                    max={PLUGIN_MAX}
                    step={1}
                    value={count}
                    onChange={(e) => setCount(+e.target.value)}
                  />
                </div>

                <div className="glass-card p-6 lg:p-8 fade-up">
                  <div className="text-[11px] tracking-widest uppercase text-white/40">Шаг 2</div>
                  <h3 className="font-display font-bold text-xl mt-1">Версия сервера</h3>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {SERVER_VERSIONS.map((v) => {
                      const active = versionId === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setVersionId(v.id)}
                          className={`inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm transition-all duration-300 ring-1 ${
                            active ? "ring-brand-red bg-white/5 text-white" : "ring-white/10 bg-white/3 text-white/70 hover:ring-white/30"
                          }`}
                        >
                          <span className="font-display font-semibold">{v.label}</span>
                          {v.note && <span className="text-[10px] uppercase tracking-widest text-white/40">{v.note}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="glass-card p-6 lg:p-8 fade-up">
                  <div className="text-[11px] tracking-widest uppercase text-white/40">Шаг 3</div>
                  <h3 className="font-display font-bold text-xl mt-1">Ядро сервера</h3>
                  <div className="mt-5 flex flex-col gap-4">
                    {CORE_GROUPS_ALL.map((g) => {
                      const items = SERVER_CORES.filter((c) => c.kind === g.kind);
                      if (!items.length) return null;
                      return (
                        <div key={g.kind}>
                          <div className="text-[11px] tracking-widest uppercase text-white/35 mb-2">{g.label}</div>
                          <div className="flex flex-wrap gap-2">
                            {items.map((c) => {
                              const active = coreId === c.id;
                              return (
                                <button
                                  key={c.id}
                                  onClick={() => setCoreId(c.id)}
                                  className={`inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm transition-all duration-300 ring-1 ${
                                    active ? "ring-brand-red bg-white/5 text-white" : "ring-white/10 bg-white/3 text-white/70 hover:ring-white/30"
                                  }`}
                                >
                                  <span className="font-display font-semibold">{c.label}</span>
                                  {c.note && <span className="text-[10px] uppercase tracking-widest text-white/40">{c.note}</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="glass-card p-6 lg:p-8 fade-up">
                  <div className="text-[11px] tracking-widest uppercase text-white/40">Шаг 4</div>
                  <h3 className="font-display font-bold text-xl mt-1">Жанр сервера</h3>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {SERVER_GENRES.map((g) => {
                      const active = genreId === g.id;
                      return (
                        <button
                          key={g.id}
                          onClick={() => setGenreId(g.id)}
                          className={`inline-flex items-center h-10 px-4 rounded-full text-sm transition-all duration-300 ring-1 ${
                            active ? "ring-brand-red bg-white/5 text-white" : "ring-white/10 bg-white/3 text-white/70 hover:ring-white/30"
                          }`}
                        >
                          <span className="font-display font-semibold">{g.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="glass-card p-6 lg:p-8 fade-up">
                  <div className="flex items-start gap-4 justify-between">
                    <div>
                      <div className="text-[11px] tracking-widest uppercase text-white/40">Шаг 5</div>
                      <h3 className="font-display font-bold text-xl mt-1">Срочная сборка</h3>
                      <div className="text-white/55 text-sm mt-1">До 48 часов вместо 5–7 дней. +30% к стоимости.</div>
                    </div>
                    <button
                      onClick={() => setRush((r) => !r)}
                      className={`relative w-14 h-8 rounded-full ring-1 transition-all ${rush ? "bg-brand-red/30 ring-brand-red" : "bg-white/5 ring-white/15"}`}
                    >
                      <span className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${rush ? "left-7" : "left-1"}`} />
                    </button>
                  </div>
                </div>
              </>
            )}

            {tab === "custom" && (
              <>
                <div className="glass-card p-6 lg:p-8 fade-up">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[11px] tracking-widest uppercase text-white/40">Кастомная разработка</div>
                      <h3 className="font-display font-bold text-xl mt-1">Использовать кастомные плагины</h3>
                      <div className="text-white/55 text-sm mt-1">
                        Стоимость подключится к общей сумме сборки сервера.
                      </div>
                    </div>
                    <button
                      onClick={() => setUseCustom((u) => !u)}
                      className={`relative w-16 h-9 shrink-0 rounded-full ring-1 transition-all duration-300 ${
                        useCustom ? "bg-brand-red/30 ring-brand-red" : "bg-white/5 ring-white/15"
                      }`}
                      aria-pressed={useCustom}
                    >
                      <span
                        className={`absolute top-1 w-7 h-7 rounded-full bg-white shadow-lg transition-all duration-300 ${
                          useCustom ? "left-8" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {useCustom && (
                  <div className="fade-up">
                    <CustomPluginForm state={customState} setState={setCustomState} compact />
                  </div>
                )}

                {!useCustom && (
                  <div className="glass-card p-8 text-center fade-up">
                    <div className="text-white/45 text-sm">
                      Включите переключатель выше — откроются параметры кастомной разработки.
                    </div>
                    <div className="mt-3 text-white/35 text-xs">
                      Нужен отдельный крупный проект? Загляните в раздел «Разработка» ниже.
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* right totals */}
          <aside className="glass-card p-6 lg:p-8 h-fit lg:sticky lg:top-24">
            <div className="text-[11px] tracking-widest uppercase text-white/40">Итого</div>
            <div className="mt-2 font-display font-extrabold text-5xl">
              {total.toLocaleString("ru-RU")} <span className="gradient-text">₳</span>
            </div>
            <div className="text-white/55 text-sm mt-2">≈ {usd} $</div>
            <div className="text-white/45 text-xs mt-1">Цена в Аргентах — валюте Нова-Люминис.</div>

            <div className="mt-6 rounded-2xl bg-white/3 ring-1 ring-white/10 p-4 text-sm text-white/65 leading-relaxed">
              <div className="text-[11px] tracking-widest uppercase text-white/40 mb-2">Стек плагинов</div>
              <ul className="flex flex-col gap-1.5">
                <li className="flex items-center justify-between gap-3">
                  <span>Плагины · {count} шт. {bulk < 1 && <span className="text-brand-orange">(×{bulk})</span>}</span>
                  <span className="font-display font-semibold text-white/85">{base.toLocaleString("ru-RU")} ₳</span>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span>Ядро · {core.label}</span>
                  <span className="text-white/60">×{core.mult}</span>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span>Жанр · {genre.label}</span>
                  <span className="text-white/60">×{genre.mult}</span>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span>Версия · {version.label}</span>
                  <span className="text-white/60">×{version.mult}</span>
                </li>
                <li className="flex items-center justify-between gap-3 pt-2 mt-1 border-t border-white/5">
                  <span>Срочность</span>
                  <span className="font-display font-semibold text-white/85">{rushFee.toLocaleString("ru-RU")} ₳</span>
                </li>
                <li className="flex items-center justify-between gap-3 pt-2 mt-1 border-t border-white/5 font-display">
                  <span>Подытог стека</span>
                  <span className="font-semibold text-white/90">{stackTotal.toLocaleString("ru-RU")} ₳</span>
                </li>
              </ul>
            </div>

            {useCustom && (
              <div className="mt-4 fade-up">
                <CustomTotalsCard state={customState} title="Кастомные плагины" />
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3">
              <button onClick={() => copy(TELEGRAM_TAG, `Telegram ${TELEGRAM_TAG} скопирован`)} className="inline-flex items-center justify-center gap-2 h-12 rounded-full gradient-btn font-medium">
                <I.Telegram className="w-5 h-5" /> Telegram {TELEGRAM_TAG}
              </button>
              <button onClick={() => copy(DISCORD_TAG, `Discord-тег ${DISCORD_TAG} скопирован`)} className="inline-flex items-center justify-center gap-2 h-12 rounded-full ring-1 ring-white/15 hover:bg-white hover:text-black transition-all duration-300">
                <I.Discord className="w-5 h-5" /> Discord {DISCORD_TAG}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ---------- standalone custom plugins section ---------- */

function CustomPlugins() {
  const [state, setState] = useState<CustomState>(() =>
    makeCustomState({
      plugins: [
        { id: "p1", name: "Экономика сервера", complexity: "hard" },
        { id: "p2", name: "Кастомные предметы", complexity: "medium" },
      ],
      extras: ["api", "placeholders"],
    }),
  );
  const r = computeCustom(state);
  const usd = (r.total / ARG_PER_USD).toFixed(2);

  return (
    <section id="custom" className="relative py-24 lg:py-32">
      <Blob className="bg-brand-orange/20 w-[500px] h-[500px] -top-20 left-[-140px]" />
      <Blob className="bg-brand-red/15 w-[420px] h-[420px] bottom-[-80px] right-[-140px]" />
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <SectionHead kicker="Разработка" title="Кастомные плагины" accent="под ключ" />
          <p className="text-white/45 max-w-sm text-sm">
            Собственная разработка Minecraft-плагинов любой сложности — от утилит до полноценных механик.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
          <CustomPluginForm state={state} setState={setState} />

          <aside className="glass-card p-6 lg:p-8 h-fit lg:sticky lg:top-24">
            <div className="text-[11px] tracking-widest uppercase text-white/40">Итого разработки</div>
            <div className="mt-2 font-display font-extrabold text-5xl">
              {r.total.toLocaleString("ru-RU")} <span className="gradient-text">₳</span>
            </div>
            <div className="text-white/55 text-sm mt-2">≈ {usd} $</div>
            <div className="text-white/45 text-xs mt-1">
              Расчёт в реальном времени. Цена в Аргентах — валюте Нова-Люминис.
            </div>

            <div className="mt-6 rounded-2xl bg-white/3 ring-1 ring-white/10 p-4 text-sm text-white/65 leading-relaxed">
              <div className="text-[11px] tracking-widest uppercase text-white/40 mb-2">Конфигурация</div>
              <ul className="flex flex-col gap-1.5">
                <li className="flex justify-between gap-3">
                  <span>База · {state.plugins.length} плагин(ов)</span>
                  <span className="font-display font-semibold text-white/85">{r.baseSum.toLocaleString("ru-RU")} ₳</span>
                </li>
                <li className="flex justify-between gap-3">
                  <span>Ядро · {r.core.label}</span>
                  <span className="text-white/60">×{r.core.mult}</span>
                </li>
                <li className="flex justify-between gap-3">
                  <span>Версии · {state.versionIds.length || "—"}</span>
                  <span className="text-white/60">×{r.vMult.toFixed(2)}</span>
                </li>
                {(state.multiVersion || state.versionIds.length > 1) && (
                  <li className="flex justify-between gap-3">
                    <span>Мультиверсия</span>
                    <span className="text-white/60">×{r.multiVerMult.toFixed(2)}</span>
                  </li>
                )}
                <li className="flex justify-between gap-3">
                  <span>Исходники / доки / поддержка / опции</span>
                  <span className="text-white/60">+{Math.round(r.extraAdd * 100)}%</span>
                </li>
                <li className="flex justify-between gap-3 pt-2 mt-1 border-t border-white/5">
                  <span>Срочность · {r.urg.label}</span>
                  <span className="text-white/60">×{r.urg.mult}</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button onClick={() => copy(TELEGRAM_TAG, `Telegram ${TELEGRAM_TAG} скопирован`)} className="inline-flex items-center justify-center gap-2 h-12 rounded-full gradient-btn font-medium">
                <I.Telegram className="w-5 h-5" /> Telegram {TELEGRAM_TAG}
              </button>
              <button onClick={() => copy(DISCORD_TAG, `Discord-тег ${DISCORD_TAG} скопирован`)} className="inline-flex items-center justify-center gap-2 h-12 rounded-full ring-1 ring-white/15 hover:bg-white hover:text-black transition-all duration-300">
                <I.Discord className="w-5 h-5" /> Discord {DISCORD_TAG}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}




function ReviewCard({ name, avatar, text }: { name: string; avatar: string; text: string }) {
  return (
    <div className="shrink-0 w-[320px] glass-card p-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full ring-2 ring-white/10 bg-linear-to-br from-brand-red to-brand-orange inline-flex items-center justify-center font-display font-bold text-sm">
          {avatar}
        </div>
        <div>
          <div className="font-display font-semibold text-sm">{name}</div>
          <div className="text-white/45 text-[11px]">участник</div>
        </div>
      </div>
      <p className="mt-3 text-white/55 text-[13px] leading-relaxed">{text}</p>
    </div>
  );
}

function Reviews() {
  return (
    <section id="team" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHead kicker="Сообщество" title="Что говорят" accent="участники" />
      </div>
      <div className="mt-12 space-y-4 mask-fade-x">
        {[REVIEWS_ROW1, REVIEWS_ROW2].map((row, i) => (
          <div key={i} className="flex gap-4 w-max marquee" style={i === 1 ? { animationName: "marquee-rev", animationDuration: "55s" } : { animationDuration: i === 0 ? "45s" : "55s" }}>
            {[...row, ...row].map((r, idx) => (
              <ReviewCard key={idx} {...r} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-[40px] lg:rounded-[60px] bg-white/3 ring-1 ring-white/10 p-8 lg:p-16">
          <Blob className="bg-brand-red/30 w-[500px] h-[500px] -top-40 -right-20" />
          <Blob className="bg-brand-orange/20 w-[400px] h-[400px] -bottom-40 -left-20" />
          <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-[11px] tracking-[0.3em] uppercase text-white/45">Контакты</div>
              <h2 className="mt-4 font-display font-extrabold text-3xl lg:text-5xl leading-[1.05]">
                Остались <span className="text-brand-red">вопросы?</span>
              </h2>
              <p className="mt-4 text-white/60 max-w-md">
                Напишите нам в Discord или Telegram — поможем с регистрацией, подберём ивент, ответим за считанные минуты.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={() => copy(TELEGRAM_TAG, `Telegram ${TELEGRAM_TAG} скопирован`)} className="inline-flex items-center gap-2 h-12 px-6 rounded-full gradient-btn font-medium">
                  <I.Telegram className="w-4 h-4" /> Telegram {TELEGRAM_TAG}
                </button>
                <button onClick={() => copy(DISCORD_TAG, `Discord-тег ${DISCORD_TAG} скопирован`)} className="inline-flex items-center gap-2 h-12 px-6 rounded-full ring-1 ring-white/15 hover:bg-white hover:text-black transition-all duration-300">
                  <I.Discord className="w-4 h-4" /> Discord {DISCORD_TAG}
                </button>
              </div>
              <div className="mt-4 text-sm text-white/50">
                Клик по кнопке копирует тег.
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { k: "<5 мин", v: "среднее время ответа" },
                { k: "24/7", v: "поддержка" },
                { k: "120+", v: "проведено ивентов" },
                { k: "0 ₽", v: "участие в турнирах" },
              ].map((s) => (
                <div key={s.v} className="glass-card p-5">
                  <div className="font-display font-bold text-2xl gradient-text">{s.k}</div>
                  <div className="text-white/55 text-xs mt-1">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({ onNav }: { onNav: (id: string) => void }) {
  return (
    <footer className="relative pt-16 pb-10 border-t border-white/5">
      <div className="noise absolute inset-0 opacity-30 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr] gap-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex w-9 h-9 items-center justify-center rounded-lg bg-linear-to-br from-brand-red to-brand-orange font-display font-bold">N</span>
              <span className="font-display font-bold">NovaCraft <span className="gradient-text">Event Agency</span></span>
            </div>
            <p className="mt-4 text-white/50 text-sm max-w-sm">
              Ивент-агентство и оператор Minecraft-сервера. Губерния Нова-Люминис, ТРА.
            </p>
            <div className="mt-4 text-white/40 text-xs">
              Внесено в ЕРФ
            </div>
          </div>
          <FooterCol title="Главное" items={NAV.map((n) => ({ label: n.label, onClick: () => onNav(n.id) }))} />
          <FooterCol title="Соц. сети" items={[
            { label: `Telegram ${TELEGRAM_TAG}`, onClick: () => copy(TELEGRAM_TAG, `Telegram ${TELEGRAM_TAG} скопирован`) },
            { label: `Discord ${DISCORD_TAG}`, onClick: () => copy(DISCORD_TAG, `Discord-тег ${DISCORD_TAG} скопирован`) },
          ]} />
          <FooterCol title="Документы" items={[
            { label: "Устав", href: "#" },
            { label: "Правила", href: "#" },
            { label: "Политика", href: "#" },
          ]} />
          <FooterCol title="Статус" items={[
            { label: "Сервер: онлайн", href: "#" },
            { label: "Аптайм 99.9%", href: "#" },
          ]} />
        </div>
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-white/40">
          <div>© {new Date().getFullYear()} NovaCraft Event Agency. Все права защищены.</div>
          <button onClick={() => copy(DESIGNER, "Скопировано")} className="hover:text-white transition">
            Дизайн и разработка от <span className="text-brand-orange">{DESIGNER}</span>
          </button>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; href?: string; onClick?: () => void }[] }) {
  return (
    <div>
      <div className="text-[11px] tracking-widest uppercase text-white/40">{title}</div>
      <ul className="mt-4 flex flex-col gap-2 text-sm">
        {items.map((it) =>
          it.href ? (
            <li key={it.label}><a href={it.href} className="text-white/65 hover:text-white transition">{it.label}</a></li>
          ) : (
            <li key={it.label}><button onClick={it.onClick} className="text-white/65 hover:text-white transition text-left">{it.label}</button></li>
          ),
        )}
      </ul>
    </div>
  );
}

/* ---------- page ---------- */

function HomePage() {
  const [active, setActive] = useState("home");
  const ids = useRef(NAV.map((n) => n.id));

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );
    ids.current.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const nav = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative min-h-screen bg-stone-950 text-white overflow-x-hidden">
      <div className="noise fixed inset-0 opacity-40 pointer-events-none z-0" />
      <Header active={active} onNav={nav} />
      <main className="relative z-10">
        <Hero onNav={nav} />
        <WhyWe />
        <PromoBanner />
        <Events />
        <Plugins />
        <Reviews />
        <Contact />
      </main>
      <Footer onNav={nav} />
    </div>
  );
}
