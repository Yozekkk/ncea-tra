import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { I, LOGO_MARK } from "@/components/site/ui";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { useHashNav } from "./useHashNav";
import { CurrencySwitcher } from "./CurrencySwitcher";
import type { NavKey } from "./nav-items";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [active, setActive] = useState<NavKey>("home");
  const closeTimer = useRef<number | null>(null);
  const rootRef = useRef<HTMLElement>(null);
  const goHash = useHashNav();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const openMega = useCallback(() => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setMega(true);
  }, []);
  const closeMega = useCallback(() => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setMega(false);
  }, []);
  const closeMegaSoon = useCallback(() => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMega(false), 160);
  }, []);

  /* scroll state */
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setScrolled(window.scrollY > 12);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  /* reset on route change */
  useEffect(() => {
    setSheet(false);
    setMega(false);
    setActive(pathname === "/" ? "home" : "services");
  }, [pathname]);

  /* section spy on home */
  useEffect(() => {
    if (pathname !== "/") return;
    const ids: NavKey[] = ["home", "about", "portfolio", "team", "partner"];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const key = ids.find((id) => id === visible.target.id);
        if (key) setActive(key);
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: [0.05, 0.2, 0.5] },
    );
    ids.forEach((id) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, [pathname]);

  /* body scroll lock for the mobile sheet */
  useEffect(() => {
    document.body.style.overflow = sheet ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sheet]);

  /* esc + outside click */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMega(false);
      setSheet(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setMega(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  const handleHash = useCallback(
    (key: NavKey, hash: string) => {
      setMega(false);
      setActive(key);
      goHash(hash);
    },
    [goHash],
  );

  return (
    <header ref={rootRef} data-scrolled={scrolled} className="nv-header">
      <div className="nv-shell">
        <div className="nv-bar">
          <Link to="/" aria-label="NCEA — на главную" onClick={() => setActive("home")} className="nv-brand">
            <img src={LOGO_MARK} alt="" width={34} height={34} className="nv-brand-mark" />
            <span className="nv-brand-text">
              NCEA <span className="gradient-text">Event Agency</span>
            </span>
          </Link>

          <nav className="hidden lg:flex" aria-label="Основная навигация">
            <DesktopNav
              active={active}
              megaOpen={mega}
              onHash={handleHash}
              onHome={() => setActive("home")}
              onToggleMega={() => (mega ? closeMega() : openMega())}
              onOpenMega={openMega}
              onCloseMegaSoon={closeMegaSoon}
              onCloseMega={closeMega}
            />
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <CurrencySwitcher />
            <Link to="/services" onClick={() => setActive("services")} className="nv-cta hidden h-10 px-5 text-sm md:inline-flex">
              Рассчитать стоимость
            </Link>
            <button
              type="button"
              aria-label={sheet ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={sheet}
              onClick={() => setSheet((value) => !value)}
              className="nv-icon-btn lg:hidden"
            >
              {sheet ? <I.Close className="h-5 w-5" /> : <I.Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <MobileNav open={sheet} active={active} onClose={() => setSheet(false)} onHash={handleHash} />
    </header>
  );
}
