import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { I, LOGO_MARK } from "@/components/site/ui";
import { GROUPS, SERVICES } from "@/lib/services";

const DISCORD_URL = "https://discord.gg/u73vDgBMAn";
const TELEGRAM_URL = "https://t.me/lisiy_bob";

type NavKey = "home" | "about" | "services" | "portfolio" | "team" | "partner";

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
    <div className="mega-menu absolute left-1/2 top-full w-[min(94vw,980px)] -translate-x-1/2 pt-3" role="menu">
      <div className="mega-panel p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GROUPS.map((group) => (
            <div key={group.id}>
              <div className="px-2 text-caption text-white/40">{group.label}</div>
              <div className="mt-2 flex flex-col">
                {SERVICES.filter((service) => service.group === group.id).map((service) => {
                  const Icon = I[service.icon];
                  return (
                    <Link
                      key={service.id}
                      to={service.path}
                      role="menuitem"
                      onClick={onPick}
                      className="mega-item group flex items-start gap-3 rounded-xl px-2 py-2"
                    >
                      <span className="mega-item-icon inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-brand-orange">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-white/90 transition-colors group-hover:text-white">{service.title}</span>
                        <span className="block truncate text-[11px] text-white/45">{service.short}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
          <span className="text-xs text-white/45">12 направлений · онлайн-расчёт стоимости</span>
          <Link to="/services" onClick={onPick} className="gradient-btn magnetic inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium">
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
  const [active, setActive] = useState<NavKey>("home");
  const [indicator, setIndicator] = useState({ left: 4, width: 78, opacity: 0 });
  const megaRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<number | null>(null);
  const itemRefs = useRef<Partial<Record<NavKey, HTMLElement | null>>>({});
  const goHash = useHashNav();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const moveTo = useCallback((key: NavKey) => {
    setActive(key);
    const nav = navRef.current;
    const item = itemRefs.current[key];
    if (!nav || !item) return;
    const navRect = nav.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    setIndicator({ left: itemRect.left - navRect.left, width: itemRect.width, opacity: 1 });
  }, []);

  const openMega = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setMega(true);
  };
  const scheduleCloseMega = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMega(false), 140);
  };

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setScrolled(window.scrollY > 16);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
    setMega(false);
    setMobServices(false);
    if (pathname !== "/") moveTo("services");
    else window.setTimeout(() => moveTo("home"), 30);
  }, [pathname, moveTo]);

  useEffect(() => {
    if (pathname !== "/") return;
    const mapping: Array<[NavKey, string]> = [["home", "home"], ["about", "about"], ["portfolio", "portfolio"], ["team", "team"], ["partner", "partner"]];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const found = mapping.find(([, id]) => id === visible.target.id);
      if (found) moveTo(found[0]);
    }, { rootMargin: "-25% 0px -55% 0px", threshold: [0.05, 0.2, 0.5] });
    mapping.forEach(([, id]) => { const node = document.getElementById(id); if (node) observer.observe(node); });
    return () => observer.disconnect();
  }, [pathname, moveTo]);

  useEffect(() => {
    const update = () => moveTo(active);
    window.addEventListener("resize", update);
    const timer = window.setTimeout(update, 60);
    return () => { window.removeEventListener("resize", update); window.clearTimeout(timer); };
  }, [active, moveTo]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMega(false); setOpen(false); }
    };
    const onPointerDown = (event: Event) => {
      if (megaRef.current && !megaRef.current.contains(event.target as Node)) setMega(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  const hashClick = (key: NavKey, hash: string) => {
    setMega(false);
    moveTo(key);
    goHash(hash);
  };

  const linkClass = (key: NavKey) =>
    `nav-liquid-item relative z-10 inline-flex h-10 items-center rounded-full px-4 text-sm transition ${active === key ? "font-semibold text-white" : "text-white/66 hover:text-white"}`;

  return (
    <header data-scrolled={scrolled} className="site-header fixed inset-x-0 top-0 z-[60]">
      <div className="site-header-inner mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
        <Link to="/" aria-label="NCEA — на главную" className="group flex shrink-0 items-center gap-2.5 whitespace-nowrap" onClick={() => moveTo("home")}>
          <img src={LOGO_MARK} alt="" width={36} height={36} className="h-9 w-9 rounded-xl object-cover ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105" />
          <span className="font-display text-sm font-extrabold tracking-tight lg:text-base">NCEA <span className="gradient-text">Event Agency</span></span>
        </Link>

        <nav ref={navRef} aria-label="Основная навигация" className="liquid-nav relative hidden items-center gap-1 rounded-full p-1 lg:flex">
          <span className="liquid-nav-indicator pointer-events-none absolute bottom-1 top-1 rounded-full" style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width, opacity: indicator.opacity }} />
          <Link ref={(node) => { itemRefs.current.home = node; }} to="/" onClick={() => moveTo("home")} className={linkClass("home")}>Главная</Link>
          <button type="button" ref={(node) => { itemRefs.current.about = node; }} onClick={() => hashClick("about", "about")} className={linkClass("about")}>О нас</button>

          <div ref={megaRef} className="relative z-10" onMouseEnter={openMega} onMouseLeave={scheduleCloseMega}>
            <button
              ref={(node) => { itemRefs.current.services = node; }}
              type="button"
              aria-expanded={mega}
              aria-haspopup="menu"
              onClick={() => { moveTo("services"); setMega((value) => !value); }}
              className={`nav-liquid-item inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm transition ${active === "services" ? "font-semibold text-white" : "text-white/66 hover:text-white"}`}
            >
              Услуги <I.Chevron className={`h-4 w-4 transition-transform duration-300 ${mega ? "rotate-180" : ""}`} />
            </button>
            {mega && <MegaMenu onPick={() => setMega(false)} />}
          </div>

          <button type="button" ref={(node) => { itemRefs.current.portfolio = node; }} onClick={() => hashClick("portfolio", "portfolio")} className={linkClass("portfolio")}>Портфолио</button>
          <button type="button" ref={(node) => { itemRefs.current.team = node; }} onClick={() => hashClick("team", "team")} className={linkClass("team")}>Отзывы</button>
          <button type="button" ref={(node) => { itemRefs.current.partner = node; }} onClick={() => hashClick("partner", "partner")} className={linkClass("partner")}>Сотрудничество</button>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link to="/services" onClick={() => moveTo("services")} className="gradient-btn magnetic hidden h-10 items-center gap-2 rounded-full px-5 text-sm font-medium xl:inline-flex">Рассчитать стоимость</Link>
          <button type="button" aria-label="Открыть меню" aria-expanded={open} onClick={() => setOpen(true)} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/6 ring-1 ring-white/12 backdrop-blur-xl transition hover:bg-white/12 lg:hidden"><I.Menu className="h-5 w-5" /></button>
        </div>
      </div>

      {open && (
        <div className="mobile-menu fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-stone-950/95 backdrop-blur-2xl lg:hidden" role="dialog" aria-modal="true" aria-label="Мобильное меню">
          <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/7 bg-black/55 px-4 backdrop-blur-2xl">
            <Link to="/" onClick={() => setOpen(false)} className="flex min-w-0 items-center gap-2.5 font-display text-sm font-extrabold">
              <img src={LOGO_MARK} alt="" width={32} height={32} className="h-8 w-8 shrink-0 rounded-lg object-cover ring-1 ring-white/10" />
              <span className="truncate">NCEA <span className="gradient-text">Event Agency</span></span>
            </Link>
            <button type="button" aria-label="Закрыть меню" onClick={() => setOpen(false)} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1 ring-white/12"><I.Close className="h-5 w-5" /></button>
          </div>
          <div className="flex flex-col gap-2 px-4 py-5 pb-[calc(2.5rem+env(safe-area-inset-bottom))]">
            <Link to="/" onClick={() => setOpen(false)} className="mobile-row"><I.Home className="h-5 w-5 text-white/70" /><span className="font-medium">Главная</span></Link>
            <button type="button" onClick={() => { setOpen(false); window.setTimeout(() => hashClick("about", "about"), 50); }} className="mobile-row text-left"><I.Info className="h-5 w-5 text-white/70" /><span className="font-medium">О нас</span></button>
            <button type="button" aria-expanded={mobServices} onClick={() => setMobServices((value) => !value)} className="mobile-row justify-between">
              <span className="flex items-center gap-3"><I.Service className="h-5 w-5 text-white/70" /><span className="font-medium">Услуги</span></span>
              <I.Chevron className={`h-5 w-5 transition-transform duration-300 ${mobServices ? "rotate-180" : ""}`} />
            </button>
            {mobServices && (
              <div className="fade-up flex flex-col rounded-2xl border border-brand-orange/20 bg-white/[.03] p-2">
                {GROUPS.map((group) => (
                  <div key={group.id} className="py-1">
                    <div className="px-2 py-1 text-caption text-white/35">{group.label}</div>
                    {SERVICES.filter((service) => service.group === group.id).map((service) => {
                      const Icon = I[service.icon];
                      return (
                        <Link key={service.id} to={service.path} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-white/7">
                          <Icon className="h-4 w-4 shrink-0 text-brand-orange" /><span className="truncate text-sm">{service.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
                <Link to="/services" onClick={() => setOpen(false)} className="gradient-btn mt-1 inline-flex h-11 items-center justify-center rounded-xl text-sm font-medium">Все услуги</Link>
              </div>
            )}
            <button type="button" onClick={() => { setOpen(false); window.setTimeout(() => hashClick("portfolio", "portfolio"), 50); }} className="mobile-row text-left"><I.Paint className="h-5 w-5 text-white/70" /><span className="font-medium">Портфолио</span></button>
            <button type="button" onClick={() => { setOpen(false); window.setTimeout(() => hashClick("team", "team"), 50); }} className="mobile-row text-left"><I.Star className="h-5 w-5 text-white/70" /><span className="font-medium">Отзывы</span></button>
            <button type="button" onClick={() => { setOpen(false); window.setTimeout(() => hashClick("partner", "partner"), 50); }} className="mobile-row text-left"><I.Group className="h-5 w-5 text-white/70" /><span className="font-medium">Сотрудничество</span></button>
            <Link to="/services" onClick={() => setOpen(false)} className="gradient-btn mt-3 inline-flex h-12 items-center justify-center gap-2 rounded-2xl font-medium">Рассчитать стоимость <I.Arrow className="h-4 w-4" /></Link>
            <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl font-medium ring-1 ring-white/15"><I.Discord className="h-5 w-5" /> Перейти в Discord</a>
            <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl font-medium ring-1 ring-white/15"><I.Telegram className="h-5 w-5" /> Написать в Telegram</a>
          </div>
        </div>
      )}
    </header>
  );
}
