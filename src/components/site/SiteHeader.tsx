import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { I, LOGO_ROUND, copy, DISCORD_TAG, TELEGRAM_TAG } from "@/components/site/ui";
import { GROUPS, SERVICES } from "@/lib/services";

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
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (hash: string) => {
    if (pathname === "/") {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate({ to: "/", hash });
    }
  };
}

function MegaMenu({ onPick }: { onPick: () => void }) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[min(92vw,940px)] z-50">
      <div className="origin-top rounded-3xl border border-brand-orange/25 bg-stone-950/90 backdrop-blur-2xl p-5 shadow-[0_40px_100px_-30px_rgba(255,77,77,.45)] fade-up">
        <div className="grid grid-cols-3 gap-4">
          {GROUPS.map((g) => (
            <div key={g.id}>
              <div className="text-[11px] tracking-[0.2em] uppercase text-white/40 px-2">{g.label}</div>
              <div className="mt-2 flex flex-col">
                {SERVICES.filter((s) => s.group === g.id).map((s) => {
                  const Icon = I[s.icon];
                  return (
                    <Link
                      key={s.id}
                      to={s.path}
                      onClick={onPick}
                      className="group flex items-start gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/5"
                    >
                      <span className="mt-0.5 inline-flex w-8 h-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-brand-red/20 to-brand-orange/20 ring-1 ring-white/10 text-brand-orange group-hover:ring-brand-orange/50 transition">
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-white/90 group-hover:text-white">{s.title}</span>
                        <span className="block text-[11px] text-white/45 truncate">{s.short}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-white/45">12 направлений · расчёт стоимости онлайн</span>
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
  const goHash = useHashNav();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMega(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "backdrop-blur-xl bg-stone-950/75 border-b border-white/5" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 shrink-0 whitespace-nowrap">
          <img src={LOGO_ROUND} alt="NCEA" className="w-9 h-9 rounded-full ring-1 ring-white/10 object-contain" />
          <span className="font-display font-bold text-base lg:text-lg tracking-tight">
            NCEA <span className="hidden sm:inline gradient-text">Event Agency</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 rounded-full bg-white/3 ring-1 ring-white/10 p-1">
          <Link
            to="/"
            className="px-4 h-10 inline-flex items-center rounded-full text-sm text-white/70 hover:text-white transition"
            activeOptions={{ exact: true }}
            activeProps={{ className: "bg-white text-black hover:text-black" }}
          >
            Главная
          </Link>
          {MAIN_NAV.filter((n) => n.hash).map((n) => (
            <button
              key={n.label}
              onClick={() => goHash(n.hash!)}
              className="px-4 h-10 inline-flex items-center rounded-full text-sm text-white/70 hover:text-white transition"
            >
              {n.label}
            </button>
          ))}
          <div className="relative" onMouseEnter={() => setMega(true)} onMouseLeave={() => setMega(false)}>
            <button
              onClick={() => setMega((v) => !v)}
              className={`px-4 h-10 inline-flex items-center gap-1.5 rounded-full text-sm transition ${
                mega ? "bg-white text-black" : "text-white/70 hover:text-white"
              }`}
            >
              Услуги <I.Chevron className={`w-4 h-4 transition-transform ${mega ? "rotate-180" : ""}`} />
            </button>
            {mega && <MegaMenu onPick={() => setMega(false)} />}
          </div>
          <Link
            to="/support"
            className="px-4 h-10 inline-flex items-center rounded-full text-sm text-white/70 hover:text-white transition"
            activeProps={{ className: "bg-white text-black hover:text-black" }}
          >
            Поддержка
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/services" className="hidden lg:inline-flex items-center gap-2 h-10 px-5 rounded-full gradient-btn text-sm font-medium">
            Рассчитать стоимость
          </Link>
          <button onClick={() => setOpen(true)} className="lg:hidden w-10 h-10 inline-flex items-center justify-center rounded-full ring-1 ring-white/10 bg-white/3">
            <I.Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 bg-stone-950/97 backdrop-blur-xl overflow-y-auto">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-2">
              <img src={LOGO_ROUND} alt="NCEA" className="w-8 h-8 rounded-full" />
              <span className="font-display font-bold">NCEA</span>
            </div>
            <button onClick={() => setOpen(false)} className="w-10 h-10 inline-flex items-center justify-center rounded-full ring-1 ring-white/10">
              <I.Close className="w-5 h-5" />
            </button>
          </div>
          <div className="px-4 pb-10 flex flex-col gap-2">
            <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-3 h-13 py-3.5 px-4 rounded-2xl bg-white/3 ring-1 ring-white/10">
              <I.Home className="w-5 h-5 text-white/70" /> <span className="font-medium">Главная</span>
            </Link>

            <button
              onClick={() => setMobServices((v) => !v)}
              className="flex items-center justify-between py-3.5 px-4 rounded-2xl bg-white/3 ring-1 ring-white/10"
            >
              <span className="flex items-center gap-3">
                <I.Service className="w-5 h-5 text-white/70" /> <span className="font-medium">Услуги</span>
              </span>
              <I.Chevron className={`w-5 h-5 transition-transform ${mobServices ? "rotate-180" : ""}`} />
            </button>
            {mobServices && (
              <div className="rounded-2xl border border-brand-orange/20 bg-white/2 p-2 flex flex-col fade-up">
                {GROUPS.map((g) => (
                  <div key={g.id} className="py-1">
                    <div className="px-2 py-1 text-[10px] tracking-widest uppercase text-white/35">{g.label}</div>
                    {SERVICES.filter((s) => s.group === g.id).map((s) => {
                      const Icon = I[s.icon];
                      return (
                        <Link key={s.id} to={s.path} onClick={() => setOpen(false)} className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-white/5">
                          <Icon className="w-4 h-4 text-brand-orange" />
                          <span className="text-sm">{s.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
                <Link to="/services" onClick={() => setOpen(false)} className="mt-1 inline-flex items-center justify-center h-11 rounded-xl gradient-btn text-sm font-medium">
                  Все услуги
                </Link>
              </div>
            )}

            {MAIN_NAV.filter((n) => n.hash).map((n) => (
              <button
                key={n.label}
                onClick={() => {
                  setOpen(false);
                  goHash(n.hash!);
                }}
                className="flex items-center gap-3 py-3.5 px-4 rounded-2xl bg-white/3 ring-1 ring-white/10 text-left"
              >
                <I.Star className="w-5 h-5 text-white/70" /> <span className="font-medium">{n.label}</span>
              </button>
            ))}
            <Link to="/support" onClick={() => setOpen(false)} className="flex items-center gap-3 py-3.5 px-4 rounded-2xl bg-white/3 ring-1 ring-white/10">
              <I.Heart className="w-5 h-5 text-white/70" /> <span className="font-medium">Поддержка</span>
            </Link>

            <button onClick={() => copy(DISCORD_TAG, `Discord-тег ${DISCORD_TAG} скопирован`)} className="mt-4 inline-flex items-center justify-center gap-2 h-12 rounded-2xl gradient-btn font-medium">
              <I.Discord className="w-5 h-5" /> Discord {DISCORD_TAG}
            </button>
            <button onClick={() => copy(TELEGRAM_TAG, `Telegram ${TELEGRAM_TAG} скопирован`)} className="inline-flex items-center justify-center gap-2 h-12 rounded-2xl ring-1 ring-white/15 font-medium">
              <I.Telegram className="w-5 h-5" /> Telegram {TELEGRAM_TAG}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
