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
  { id: "team", label: "Команда", Icon: I.Group },
  { id: "contact", label: "Контакты", Icon: I.Chat },
];

const TYPES = [
  { id: "tournaments", label: "Турниры", desc: "Соревновательные форматы" },
  { id: "contests", label: "Конкурсы", desc: "Креативные форматы" },
] as const;

const CATEGORIES = {
  tournaments: [
    { id: "pvp", label: "PvP-турниры", Icon: I.Sword, unit: "уч.", min: 4, max: 64, step: 2, def: 16, pricePerUnit: 80 },
    { id: "quests", label: "Квесты", Icon: I.Compass, unit: "глав", min: 1, max: 10, step: 1, def: 3, pricePerUnit: 1500 },
  ],
  contests: [
    { id: "build", label: "Строительные конкурсы", Icon: I.Hammer, unit: "блоков×100", min: 1, max: 50, step: 1, def: 12, pricePerUnit: 120 },
    { id: "season", label: "Сезонные ивенты", Icon: I.Gift, unit: "дней", min: 1, max: 14, step: 1, def: 5, pricePerUnit: 900 },
  ],
} as const;

// 100 Аргентов = 1 $
const ARG_PER_USD = 100;
const DDOS_EXTENDED_PRICE = 2500; // Аргенты

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
            квестов и сезонных ивентов на собственном Minecraft-сервере. Губерния Нова-Люминис.
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

  const summary = cats.map((c) => `${c.label}: ${values[c.id]} ${c.unit}`).join(" • ");

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
              {total.toLocaleString("ru-RU")} <span className="gradient-text">Ɐ</span>
            </div>
            <div className="text-white/55 text-sm mt-2">
              ≈ {usd} $ <span className="text-white/35">· 100 Ɐ = 1 $</span>
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
                    <span className="font-display font-semibold text-white/85">{(values[c.id] * c.pricePerUnit).toLocaleString("ru-RU")} Ɐ</span>
                  </li>
                ))}
                <li className="flex items-center justify-between gap-3 pt-2 mt-1 border-t border-white/5">
                  <span>Защита · {ddos === "basic" ? "Базовая" : "Расширенная"}</span>
                  <span className="font-display font-semibold text-white/85">{ddosTotal.toLocaleString("ru-RU")} Ɐ</span>
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
        <Reviews />
        <Contact />
      </main>
      <Footer onNav={nav} />
    </div>
  );
}
