import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { LOGO_MARK } from "@/components/site/ui";

const links = [
  ["Главная", "/"],
  ["Услуги", "/services"],
  ["О нас", "/#about"],
  ["Работники", "/workers"],
  ["Отзывы", "/#reviews"],
  ["Контакты", "/#contacts"],
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  return (
    <header className="ref-header">
      <div className="ref-navbar">
        <Link to="/" className="ref-brand" aria-label="NCEA — на главную">
          <img src={LOGO_MARK} alt="" width={38} height={38} />
          <strong>NCEA</strong>
        </Link>
        <nav className="ref-desktop-nav" aria-label="Основная навигация">
          {links.map(([label, href]) =>
            href === "/" || href === "/services" ? (
              <Link key={label} to={href} className={pathname === href ? "is-active" : ""}>
                {label}
              </Link>
            ) : (
              <a key={label} href={href} className={pathname === href ? "is-active" : ""}>
                {label}
              </a>
            ),
          )}
        </nav>
        <a className="ref-nav-order" href="https://t.me/lisiy_bob" target="_blank" rel="noreferrer">
          Заказать ↗
        </a>
        <button
          className="ref-menu-button"
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="ref-mobile-nav">
          {links.map(([label, href]) => (
            <a key={label} href={href}>
              {label}
              <span>↗</span>
            </a>
          ))}
          <a
            className="ref-mobile-order"
            href="https://t.me/lisiy_bob"
            target="_blank"
            rel="noreferrer"
          >
            Заказать в Telegram ↗
          </a>
        </nav>
      )}
    </header>
  );
}
