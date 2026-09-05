import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import { BriefcaseBusiness, Home, MessageSquareQuote, Send, UsersRound } from "lucide-react";
import { LOGO_MARK } from "@/components/site/ui";
import { CHROME_MOTION_DURATION, CHROME_MOTION_EASE, CHROME_MOTION_SPRING } from "@/lib/motion";

const links = [
  { label: "Главная", href: "/", icon: Home },
  { label: "Услуги", href: "/services", icon: BriefcaseBusiness },
  { label: "Сотрудники", href: "/workers", icon: UsersRound },
  { label: "Отзывы", href: "/#reviews", icon: MessageSquareQuote },
  { label: "Контакты", href: "/#contacts", icon: Send },
] as const;

export function Navbar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [hash, setHash] = useState("");

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  const currentLocation = `${pathname}${hash}`;
  const isActive = (href: (typeof links)[number]["href"]) => {
    if (href === "/") return currentLocation === "/";
    if (href.startsWith("/#")) return currentLocation === href;
    return pathname === href;
  };

  return (
    <>
      <motion.header
        className="ref-header"
        initial={{
          opacity: 0,
          transform: "translate3d(0, -16px, 0)",
        }}
        animate={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
        transition={{ duration: CHROME_MOTION_DURATION.reveal, ease: CHROME_MOTION_EASE }}
      >
        <div className="ref-navbar">
          <Link
            to="/"
            className="ref-brand"
            aria-label="NCEA — на главную"
            activeOptions={{ exact: true, includeHash: true }}
          >
            <img src={LOGO_MARK} alt="" width={42} height={42} />
          </Link>
          <nav className="ref-desktop-nav" aria-label="Основная навигация">
            {links.map(({ label, href, icon: Icon }) => {
              const active = isActive(href);
              return href === "/" || href === "/services" || href === "/workers" ? (
                <Link
                  key={label}
                  to={href}
                  className={active ? "is-active" : ""}
                  aria-current={active ? "page" : undefined}
                  activeOptions={{ exact: true, includeHash: true }}
                >
                  <Icon aria-hidden="true" />
                  {label}
                  {active && (
                    <motion.span
                      className="ref-nav-indicator"
                      layoutId="ref-nav-indicator"
                      transition={CHROME_MOTION_SPRING}
                    />
                  )}
                </Link>
              ) : (
                <a
                  key={label}
                  href={href}
                  className={active ? "is-active" : ""}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon aria-hidden="true" />
                  {label}
                </a>
              );
            })}
          </nav>
        </div>
      </motion.header>

      <nav className="ref-mobile-tabbar" aria-label="Мобильная навигация">
        <Link
          to="/"
          className="ref-mobile-tabbar-brand"
          aria-label="NCEA — на главную"
          activeOptions={{ exact: true, includeHash: true }}
        >
          <img src={LOGO_MARK} alt="" width={40} height={40} />
        </Link>
        <div className="ref-mobile-tabbar-links">
          {links.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            const content = (
              <>
                <span className="ref-mobile-tabbar-icon" aria-hidden="true">
                  <Icon />
                </span>
                <span className="ref-mobile-tabbar-label">{label}</span>
              </>
            );

            return href === "/" || href === "/services" || href === "/workers" ? (
              <Link
                key={label}
                to={href}
                className={`ref-mobile-tabbar-link${active ? " is-active" : ""}`}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                activeOptions={{ exact: true, includeHash: true }}
              >
                {content}
              </Link>
            ) : (
              <a
                key={label}
                href={href}
                className={`ref-mobile-tabbar-link${active ? " is-active" : ""}`}
                aria-label={label}
                aria-current={active ? "page" : undefined}
              >
                {content}
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}
