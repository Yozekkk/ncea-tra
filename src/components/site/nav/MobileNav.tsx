import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { I, LOGO_MARK } from "@/components/site/ui";
import { GROUPS, SERVICES } from "@/lib/services";
import { DISCORD_URL, NAV_ITEMS, TELEGRAM_URL, type NavKey } from "./nav-items";
import { CurrencySwitcher } from "./CurrencySwitcher";

type Props = {
  open: boolean;
  active: NavKey;
  onClose: () => void;
  onHash: (key: NavKey, hash: string) => void;
};

export function MobileNav({ open, active, onClose, onHash }: Props) {
  const [servicesOpen, setServicesOpen] = useState(false);
  if (!open) return null;

  const hash = (key: NavKey, id: string) => {
    onClose();
    window.setTimeout(() => onHash(key, id), 60);
  };

  return (
    <div className="nv-sheet lg:hidden" role="dialog" aria-modal="true" aria-label="Мобильное меню">
      <div className="nv-sheet-bar">
        <Link to="/" onClick={onClose} className="flex min-w-0 items-center gap-2.5">
          <img
            src={LOGO_MARK}
            alt=""
            width={30}
            height={30}
            className="h-[30px] w-[30px] shrink-0 rounded-lg object-cover ring-1 ring-white/12"
          />
          <span className="truncate font-display text-sm font-extrabold">
            NCEA <span className="gradient-text">Event Agency</span>
          </span>
        </Link>
        <button type="button" aria-label="Закрыть меню" onClick={onClose} className="nv-icon-btn">
          <I.Close className="h-5 w-5" />
        </button>
      </div>

      <div className="nv-sheet-body">
        <CurrencySwitcher variant="mobile" />

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          if (item.kind === "route") {
            return (
              <Link
                key={item.key}
                to={item.to}
                onClick={onClose}
                className={`nv-row${active === item.key ? " is-active" : ""}`}
              >
                <Icon className="nv-row-icon" aria-hidden="true" /> Главная
              </Link>
            );
          }

          if (item.kind === "mega") {
            return (
              <div key={item.key} className="flex flex-col gap-2">
                <button
                  type="button"
                  aria-expanded={servicesOpen}
                  onClick={() => setServicesOpen((value) => !value)}
                  className={`nv-row justify-between${active === item.key ? " is-active" : ""}`}
                >
                  <span className="inline-flex items-center gap-2.5">
                    <Icon className="nv-row-icon" aria-hidden="true" /> Услуги
                  </span>
                  <I.Chevron
                    className={`h-5 w-5 transition-transform duration-300 ${servicesOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {servicesOpen && (
                  <div className="nv-sub">
                    {GROUPS.map((group) => (
                      <div key={group.id} className="py-1">
                        <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-[.14em] text-white/32">
                          {group.label}
                        </div>
                        {SERVICES.filter((service) => service.group === group.id).map((service) => {
                          const Icon = I[service.icon];
                          return (
                            <Link
                              key={service.id}
                              to={service.path}
                              onClick={onClose}
                              className="nv-sub-item"
                            >
                              <Icon className="h-4 w-4 shrink-0 text-brand-orange" />
                              <span className="truncate">{service.title}</span>
                            </Link>
                          );
                        })}
                      </div>
                    ))}
                    <Link
                      to="/services"
                      onClick={onClose}
                      className="nv-cta mt-1 h-11 w-full justify-center rounded-xl text-sm"
                    >
                      Все услуги
                    </Link>
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => hash(item.key, item.hash)}
              className={`nv-row${active === item.key ? " is-active" : ""}`}
            >
              <Icon className="nv-row-icon" aria-hidden="true" /> {item.label}
            </button>
          );
        })}

        <Link
          to="/services"
          onClick={onClose}
          className="nv-cta mt-2 h-12 justify-center rounded-2xl text-sm"
        >
          Рассчитать стоимость <I.Arrow className="h-4 w-4" />
        </Link>
        <div className="grid grid-cols-2 gap-2">
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noreferrer"
            className="nv-ghost h-12 rounded-2xl"
          >
            <I.Discord className="h-5 w-5" /> Discord
          </a>
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="nv-ghost h-12 rounded-2xl"
          >
            <I.Telegram className="h-5 w-5" /> Telegram
          </a>
        </div>
      </div>
    </div>
  );
}
