import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { I, LOGO_ROUND } from "@/components/site/ui";
import { GROUPS, SERVICES } from "@/lib/services";

const DISCORD_URL = "https://discord.gg/u73vDgBMAn";
const TELEGRAM_URL = "https://t.me/lisiy_bob";

export const MAIN_NAV: { label: string; hash?: string; to?: string }[] = [
  { label: "Главная", to: "/" },
  { label: "О нас", hash: "about" },
  { label: "Портфолио", hash: "portfolio" },
  { label: "Отзывы", hash: "team" },
  { label: "Сотрудничество", hash: "partner" },
  { label: "Поддержка", to: "/support" },
];

export function useHashNav() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (hash: string) => {
    if (pathname === "/") {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `#${hash}`);
      return;
    }
    navigate({ to: "/", hash });
  };
}

function MegaMenu({ onPick }: { onPick: () => void }) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[min(92vw,940px)] z-50">
      <div className="origin-top rounded-3xl border border-brand-orange/25 bg-stone-950/95 backdrop-blur-2xl p-5 shadow-[0_40px_100px_-30px_rgba(255,77,77,.45)] fade-up">
        <div className="grid grid-cols-3 gap-4">
          {GROUPS.map((group) => (
            <div key={group.id}>
              <div className="text-[11px] tracking-[0.2em] uppercase text-white/40 px-2">{group.label}</div>
              <div className="mt-2 flex flex-col">
                {SERVICES.filter((service) => service.group === group.id).map((service) => {
                  const Icon = I[service.icon];
                  return (
                    <Link key={service.id} to={service.path} onClick={onPick} className="group flex items-start gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/5 focus-visible:bg-white/5 focus-visible:outline-none">
                      <span className="mt-0.5 inline-flex w-8 h-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-brand-red/20 to-brand-orange/20 ring-1 ring-white/10 text-brand-orange group-hover:ring-brand-orange/50 transition">
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-white/90 group-hover:text-white">{service.title}</span>
                        <span className="block text-[11px] text-white/45 truncate">{service.short}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-white/45">12 направлений · онлайн-расчёт стоимости</span>
          <Link to="/services" onClick={onPick} className="inline-flex items-center gap-2 h-9 px-4 rounded-full gradient-btn text-sm font-medium">
            Все услуги <I.Arrow className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const [mobServices, setMobServices] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);
  const goHash = useHashNav();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMega(false);
    setMobServices(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const closeMenus = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMega(false);
        setOpen(false);
      }
    };
    const closeMegaOutside = (event: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(event.target as Node)) setMega(false);
    };
    window.addEventListener("keydown", closeMenus);
    window.addEventListener("mousedown", closeMegaOutside);
    return () => {
      window.removeEventListener("keydown", closeMenus);
      window.removeEventListener("mousedown", closeMegaOutside);
    };
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "backdrop-blur-xl bg-stone-950/80 border-b border-white/5" : "bg-transparent"}`}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" aria-label="NCEA — на главную" className="flex items-center gap-2.5 shrink-0 whitespace-nowrap">
          <img src={LOGO_ROUND} alt="Логотип NCEA" className="w-9 h-9 rounded-full ring-1 ring-white/10 object-contain" />
          <span className="font-display font-bold text-base lg:text-lg tracking-tight">NCEA <span className="hidden sm:inline gradient-text">Event Agency</span></span>
        </Link>

        <nav aria-label="Основная навигация" className="hidden lg:flex items-center gap-1 rounded-full bg-white/3 ring-1 ring-white/10 p-1">
          <Link to="/" className="px-4 h-10 inline-flex items-center rounded-full text-sm text-white/70 hover:text-white transition" activeOptions={{ exact: true }} activeProps={{ className: "bg-white text-black hover:text-black" }}>Главная</Link>
          <button onClick={() => goHash("about")} className="px-4 h-10 inline-flex items-center rounded-full text-sm text-white/70 hover:text-white transition">О нас</button>

          <div ref={megaRef} className="relative" onMouseEnter={() => setMega(true)} onMouseLeave={() => setMega(false)}>
            <button type="button" aria-expanded={mega} aria-haspopup="menu" onClick={() => setMega((value) => !value)} className={`px-4 h-10 inline-flex items-center gap-1.5 rounded-full text-sm transition ${mega ? "bg-white text-black" : "text-white/70 hover:text-white"}`}>
              Услуги <I.Chevron className={`w-4 h-4 transition-transform ${mega ? "rotate-180" : ""}`} />
            </button>
            {mega && <MegaMenu onPick={() => setMega(false)} />}
          </div>

          <button onClick={() => goHash("portfolio")} className="px-4 h-10 inline-flex items-center rounded-full text-sm text-white/70 hover:text-white transition">Портфолио</button>
          <button onClick={() => goHash("team")} className="px-4 h-10 inline-flex items-center rounded-full text-sm text-white/70 hover:text-white transition">Отзывы</button>
          <button onClick={() => goHash("partner")} className="px-4 h-10 inline-flex items-center rounded-full text-sm text-white/70 hover:text-white transition">Сотрудничество</button>
          <Link to="/support" className="px-4 h-10 inline-flex items-center rounded-full text-sm text-white/70 hover:text-white transition" activeProps={{ className: "bg-white text-black hover:text-black" }}>Поддержка</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/services" className="hidden xl:inline-flex items-center gap-2 h-10 px-5 rounded-full gradient-btn text-sm font-medium">Рассчитать стоимость</Link>
          <button type="button" aria-label="Открыть меню" aria-expanded={open} onClick={() => setOpen(true)} className="lg:hidden w-10 h-10 inline-flex items-center justify-center rounded-full ring-1 ring-white/10 bg-white/3"><I.Menu className="w-5 h-5" /></button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 bg-stone-950/98 backdrop-blur-xl overflow-y-auto" role="dialog" aria-modal="true" aria-label="Мобильное меню">
          <div className="flex items-center justify-between h-16 px-4 sticky top-0 bg-stone-950/95 backdrop-blur-xl border-b border-white/5">
            <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
              <img src={LOGO_ROUND} alt="Логотип NCEA" className="w-8 h-8 rounded-full object-contain" />
              <span className="font-display font-bold">NCEA</span>
            </Link>
            <button type="button" aria-label="Закрыть меню" onClick={() => setOpen(false)} className="w-10 h-10 inline-flex items-center justify-center rounded-full ring-1 ring-white/10"><I.Close className="w-5 h-5" /></button>
          </div>

          <div className="px-4 py-5 pb-10 flex flex-col gap-2">
            <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-3 py-3.5 px-4 rounded-2xl bg-white/3 ring-1 ring-white/10"><I.Home className="w-5 h-5 text-white/70" /><span className="font-medium">Главная</span></Link>
            <button onClick={() => { setOpen(false); goHash("about"); }} className="flex items-center gap-3 py-3.5 px-4 rounded-2xl bg-white/3 ring-1 ring-white/10 text-left"><I.Info className="w-5 h-5 text-white/70" /><span className="font-medium">О нас</span></button>

            <button type="button" aria-expanded={mobServices} onClick={() => setMobServices((value) => !value)} className="flex items-center justify-between py-3.5 px-4 rounded-2xl bg-white/3 ring-1 ring-white/10">
              <span className="flex items-center gap-3"><I.Service className="w-5 h-5 text-white/70" /><span className="font-medium">Услуги</span></span>
              <I.Chevron className={`w-5 h-5 transition-transform ${mobServices ? "rotate-180" : ""}`} />
            </button>

            {mobServices && (
              <div className="rounded-2xl border border-brand-orange/20 bg-white/2 p-2 flex flex-col fade-up">
                {GROUPS.map((group) => (
                  <div key={group.id} className="py-1">
                    <div className="px-2 py-1 text-[10px] tracking-widest uppercase text-white/35">{group.label}</div>
                    {SERVICES.filter((service) => service.group === group.id).map((service) => {
                      const Icon = I[service.icon];
                      return <Link key={service.id} to={service.path} onClick={() => setOpen(false)} className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-white/5"><Icon className="w-4 h-4 text-brand-orange" /><span className="text-sm">{service.title}</span></Link>;
                    })}
                  </div>
                ))}
                <Link to="/services" onClick={() => setOpen(false)} className="mt-1 inline-flex items-center justify-center h-11 rounded-xl gradient-btn text-sm font-medium">Все услуги</Link>
              </div>
            )}

            <button onClick={() => { setOpen(false); goHash("portfolio"); }} className="flex items-center gap-3 py-3.5 px-4 rounded-2xl bg-white/3 ring-1 ring-white/10 text-left"><I.Paint className="w-5 h-5 text-white/70" /><span className="font-medium">Портфолио</span></button>
            <button onClick={() => { setOpen(false); goHash("team"); }} className="flex items-center gap-3 py-3.5 px-4 rounded-2xl bg-white/3 ring-1 ring-white/10 text-left"><I.Star className="w-5 h-5 text-white/70" /><span className="font-medium">Отзывы</span></button>
            <button onClick={() => { setOpen(false); goHash("partner"); }} className="flex items-center gap-3 py-3.5 px-4 rounded-2xl bg-white/3 ring-1 ring-white/10 text-left"><I.Group className="w-5 h-5 text-white/70" /><span className="font-medium">Сотрудничество</span></button>
            <Link to="/support" onClick={() => setOpen(false)} className="flex items-center gap-3 py-3.5 px-4 rounded-2xl bg-white/3 ring-1 ring-white/10"><I.Heart className="w-5 h-5 text-white/70" /><span className="font-medium">Поддержка</span></Link>
            <Link to="/services" onClick={() => setOpen(false)} className="mt-3 inline-flex items-center justify-center gap-2 h-12 rounded-2xl gradient-btn font-medium">Рассчитать стоимость <I.Arrow className="w-4 h-4" /></Link>
            <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 h-12 rounded-2xl ring-1 ring-white/15 font-medium"><I.Discord className="w-5 h-5" /> Перейти в Discord</a>
            <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 h-12 rounded-2xl ring-1 ring-white/15 font-medium"><I.Telegram className="w-5 h-5" /> Написать в Telegram</a>
          </div>
        </div>
      )}
    </header>
  );
}
