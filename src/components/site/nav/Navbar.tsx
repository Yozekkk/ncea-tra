import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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
import { MOTION_DURATION, MOTION_EASE, MOTION_SPRING } from "@/lib/motion";

const links = [
  { label: "Главная", href: "/", icon: Home },
  { label: "Услуги", href: "/services", icon: BriefcaseBusiness },
  { label: "Работники", href: "/workers", icon: UsersRound },
  { label: "Отзывы", href: "/#reviews", icon: MessageSquareQuote },
  { label: "Контакты", href: "/#contacts", icon: Send },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  return (
    <motion.header
      className="ref-header"
      initial={{
        opacity: 0,
        transform: reduceMotion ? "none" : "translate3d(0, -16px, 0)",
      }}
      animate={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
      transition={{ duration: MOTION_DURATION.reveal, ease: MOTION_EASE }}
    >
      <div className="ref-navbar">
        <Link to="/" className="ref-brand" aria-label="NCEA — на главную">
          <img src={LOGO_MARK} alt="" width={42} height={42} />
        </Link>
        <nav className="ref-desktop-nav" aria-label="Основная навигация">
          {links.map(({ label, href, icon: Icon }) =>
            href === "/" || href === "/services" || href === "/workers" ? (
              <Link key={label} to={href} className={pathname === href ? "is-active" : ""}>
                <Icon />
                {label}
                {pathname === href && (
                  <motion.span
                    className="ref-nav-indicator"
                    layoutId="ref-nav-indicator"
                    transition={reduceMotion ? { duration: 0 } : MOTION_SPRING}
                  />
                )}
              </Link>
            ) : (
              <a key={label} href={href} className={pathname === href ? "is-active" : ""}>
                <Icon />
                {label}
              </a>
            ),
          )}
        </nav>
        <motion.button
          className="ref-menu-button"
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          whileTap={reduceMotion ? undefined : { transform: "scale(0.97)" }}
          transition={{ duration: MOTION_DURATION.fast, ease: MOTION_EASE }}
        >
          {open ? <X /> : <Menu />}
        </motion.button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            className="ref-mobile-nav"
            initial={{
              opacity: 0,
              transform: reduceMotion ? "none" : "translate3d(0, -10px, 0) scale(0.98)",
            }}
            animate={{ opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" }}
            exit={{
              opacity: 0,
              transform: reduceMotion ? "none" : "translate3d(0, -6px, 0) scale(0.985)",
            }}
            transition={{
              duration: reduceMotion ? MOTION_DURATION.fast : MOTION_DURATION.normal,
              ease: MOTION_EASE,
            }}
          >
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
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
