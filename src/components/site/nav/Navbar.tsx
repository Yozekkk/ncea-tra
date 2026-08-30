import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Home,
  Menu,
  MessageSquareQuote,
  Send,
  UsersRound,
  X,
} from "lucide-react";
import { LOGO_MARK } from "@/components/site/ui";

const links = [
  { label: "Главная", href: "/", icon: Home },
  { label: "Услуги", href: "/services", icon: BriefcaseBusiness },
  { label: "Работники", href: "/workers", icon: UsersRound },
  { label: "Отзывы", href: "/#reviews", icon: MessageSquareQuote },
  { label: "Контакты", href: "/#contacts", icon: Send },
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
        </Link>
        <nav className="ref-desktop-nav" aria-label="Основная навигация">
          {links.map(({ label, href, icon: Icon }) =>
            href === "/" || href === "/services" || href === "/workers" ? (
              <Link key={label} to={href} className={pathname === href ? "is-active" : ""}>
                <Icon />
                {label}
              </Link>
            ) : (
              <a key={label} href={href} className={pathname === href ? "is-active" : ""}>
                <Icon />
                {label}
              </a>
            ),
          )}
        </nav>
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
          {links.map(({ label, href, icon: Icon }) => (
            <a key={label} href={href}>
              <span>
                <Icon />
                {label}
              </span>
              <ArrowUpRight />
            </a>
          ))}
          <a
            className="ref-mobile-order"
            href="https://t.me/lisiy_bob"
            target="_blank"
            rel="noreferrer"
          >
            Заказать в Telegram <ArrowUpRight />
          </a>
        </nav>
      )}
    </header>
  );
}
