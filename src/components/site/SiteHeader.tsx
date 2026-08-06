import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { I } from "@/components/site/ui";
import { GROUPS, SERVICES } from "@/lib/services";

const DISCORD_URL = "https://discord.gg/u73vDgBMAn";
const TELEGRAM_URL = "https://t.me/lisiy_bob";

export const MAIN_NAV: { label: string; hash?: string; to?: string }[] = [
  { label: "Главная", to: "/" },
  { label: "О нас", hash: "about" },
  { label: "Портфолио", hash: "portfolio" },
  { label: "Отзывы", hash: "team" },
  { label: "Сотрудничество", hash: "partner" },
];

export function useHashNav() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (hash: string) => {
    const scrollToSection = () => {
      const section = document.getElementById(hash);
      if (!section) return false;
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `/#${hash}`);
      return true;
    };

    if (pathname === "/") {
      scrollToSection();
      return;
    }

    navigate({ to: "/", hash });
    window.setTimeout(scrollToSection, 120);
    window.setTimeout(scrollToSection, 420);
  };
}

function MegaMenu({ onPick }: { onPick: () => void }) {
  return (
    <div className="absolute left-1/2 top-full z-50 w-[min(92vw,940px)] -translate-x-1/2 pt-3">
      <div className="fade-up origin-top rounded-3xl border border-brand-orange/25 bg-stone-950/95 p-5 shadow-[0_40px_100px_-30px_rgba(255,77,77,.45)] backdrop-blur-2xl">
        <div className="grid grid-cols-3 gap-4">
          {GROUPS.map((group) => (
            <div key={group.id}>
              <div className="px-2 text-[11px] uppercase tracking-[0.2em] text-white/40">{group.label}</div>
              <div className="mt-2 flex flex-col">
                {SERVICES.filter((service) => service.group === group.id).map((service) => {
                  const Icon = I[service.icon];
                  return (
                    <Link key={service.id} to={service.path} onClick={onPick} className="group flex items-start gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/5 focus-visible:bg-white/5 focus-visible:outline-none">
                      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-brand-red/20 to-brand-orange/20 text-brand-orange ring-1 ring-white/10 transition group-hover:ring-brand-orange/50">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-white/90 group-hover:text-white">{service.title}</span>
                        <span className="block truncate text-[11px] text-white/45">{service.short}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
          <span className="text-xs text-white/45">12 направлений · онлайн-расчёт стоимости</span>
          <Link to="/services" onClick={onPick} className="gradient-btn inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium">
            Все услуги <I.Arrow className="h-4 w-4" />
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
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-white/5 bg-stone-950/80 backdrop-blur-xl" : "bg-transparent"}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
        <Link to="/" aria-label="NCEA — на главную" className="shrink-0 whitespace-nowrap">
          <span className="font-display text-base font-bold tracking-tight lg:text-lg">NCEA <span className="gradient-text">Event Agency</span></span>
        </Link>

        <nav aria-label="Основная навигация" className="hidden items-center gap-1 rounded-full bg-white/3 p-1 ring-1 ring-white/10 lg:flex">
          <Link to="/" className="inline-flex h-10 items-center rounded-full px-4 text-sm text-white/70 transition hover:text-white" activeOptions={{ exact: true }} activeProps={{ className: "bg-white text-black hover:text-black" }}>Главная</Link>
          <button onClick={() => goHash("about")} className="inline-flex h-10 items-center rounded-full px-4 text-sm text-white/70 transition hover:text-white">О нас</button>

          <div ref={megaRef} className="relative" onMouseEnter={() => setMega(true)} onMouseLeave={() => setMega(false)}>
            <button type="button" aria-expanded={mega} aria-haspopup="menu" onClick={() => setMega((value) => !value)} className={`inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm transition ${mega ? "bg-white text-black" : "text-white/70 hover:text-white"}`}>
              Услуги <I.Chevron className={`h-4 w-4 transition-transform ${mega ? "rotate-180" : ""}`} />
            </button>
            {mega && <MegaMenu onPick={() => setMega(false)} />}
          </div>

          <button onClick={() => goHash("portfolio")} className="inline-flex h-10 items-center rounded-full px-4 text-sm text-white/70 transition hover:text-white">Портфолио</button>
          <button onClick={() => goHash("team")} className="inline-flex h-10 items-center rounded-full px-4 text-sm text-white/70 transition hover:text-white">Отзывы</button>
          <button onClick={() => goHash("partner")} className="inline-flex h-10 items-center rounded-full px-4 text-sm text-white/70 transition hover:text-white">Сотрудничество</button>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/services" className="gradient-btn hidden h-10 items-center gap-2 rounded-full px-5 text-sm font-medium xl:inline-flex">Рассчитать стоимость</Link>
          <button type="button" aria-label="Открыть меню" aria-expanded={open} onClick={() => setOpen(true)} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/3 ring-1 ring-white/10 lg:hidden"><I.Menu className="h-5 w-5" /></button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/98 backdrop-blur-xl lg:hidden" role="dialog" aria-modal="true" aria-label="Мобильное меню">
          <div className="sticky top-0 flex h-16 items-center justify-between border-b border-white/5 bg-stone-950/95 px-4 backdrop-blur-xl">
            <Link to="/" onClick={() => setOpen(false)} className="font-display font-bold">NCEA <span className="gradient-text">Event Agency</span></Link>
            <button type="button" aria-label="Закрыть меню" onClick={() => setOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-white/10"><I.Close className="h-5 w-5" /></button>
          </div>

          <div className="flex flex-col gap-2 px-4 py-5 pb-10">
            <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-2xl bg-white/3 px-4 py-3.5 ring-1 ring-white/10"><I.Home className="h-5 w-5 text-white/70" /><span className="font-medium">Главная</span></Link>
            <button onClick={() => { setOpen(false); window.setTimeout(() => goHash("about"), 50); }} className="flex items-center gap-3 rounded-2xl bg-white/3 px-4 py-3.5 text-left ring-1 ring-white/10"><I.Info className="h-5 w-5 text-white/70" /><span className="font-medium">О нас</span></button>

            <button type="button" aria-expanded={mobServices} onClick={() => setMobServices((value) => !value)} className="flex items-center justify-between rounded-2xl bg-white/3 px-4 py-3.5 ring-1 ring-white/10">
              <span className="flex items-center gap-3"><I.Service className="h-5 w-5 text-white/70" /><span className="font-medium">Услуги</span></span>
              <I.Chevron className={`h-5 w-5 transition-transform ${mobServices ? "rotate-180" : ""}`} />
            </button>

            {mobServices && (
              <div className="fade-up flex flex-col rounded-2xl border border-brand-orange/20 bg-white/2 p-2">
                {GROUPS.map((group) => (
                  <div key={group.id} className="py-1">
                    <div className="px-2 py-1 text-[10px] uppercase tracking-widest text-white/35">{group.label}</div>
                    {SERVICES.filter((service) => service.group === group.id).map((service) => {
                      const Icon = I[service.icon];
                      return <Link key={service.id} to={service.path} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-white/5"><Icon className="h-4 w-4 text-brand-orange" /><span className="text-sm">{service.title}</span></Link>;
                    })}
                  </div>
                ))}
                <Link to="/services" onClick={() => setOpen(false)} className="gradient-btn mt-1 inline-flex h-11 items-center justify-center rounded-xl text-sm font-medium">Все услуги</Link>
              </div>
            )}

            <button onClick={() => { setOpen(false); window.setTimeout(() => goHash("portfolio"), 50); }} className="flex items-center gap-3 rounded-2xl bg-white/3 px-4 py-3.5 text-left ring-1 ring-white/10"><I.Paint className="h-5 w-5 text-white/70" /><span className="font-medium">Портфолио</span></button>
            <button onClick={() => { setOpen(false); window.setTimeout(() => goHash("team"), 50); }} className="flex items-center gap-3 rounded-2xl bg-white/3 px-4 py-3.5 text-left ring-1 ring-white/10"><I.Star className="h-5 w-5 text-white/70" /><span className="font-medium">Отзывы</span></button>
            <button onClick={() => { setOpen(false); window.setTimeout(() => goHash("partner"), 50); }} className="flex items-center gap-3 rounded-2xl bg-white/3 px-4 py-3.5 text-left ring-1 ring-white/10"><I.Group className="h-5 w-5 text-white/70" /><span className="font-medium">Сотрудничество</span></button>
            <Link to="/services" onClick={() => setOpen(false)} className="gradient-btn mt-3 inline-flex h-12 items-center justify-center gap-2 rounded-2xl font-medium">Рассчитать стоимость <I.Arrow className="h-4 w-4" /></Link>
            <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl font-medium ring-1 ring-white/15"><I.Discord className="h-5 w-5" /> Перейти в Discord</a>
            <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl font-medium ring-1 ring-white/15"><I.Telegram className="h-5 w-5" /> Написать в Telegram</a>
          </div>
        </div>
      )}
    </header>
  );
}
