import { Link } from "@tanstack/react-router";
import { I } from "@/components/site/ui";
import { GROUPS, SERVICES } from "@/lib/services";

export function ServicesDropdown({ onPick }: { onPick: () => void }) {
  return (
    <div className="nv-mega" role="menu" aria-label="Услуги">
      <div className="nv-mega-panel">
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {GROUPS.map((group) => (
            <div key={group.id} className="min-w-0">
              <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-[.14em] text-white/35">
                {group.label}
              </div>
              <div className="flex flex-col gap-0.5">
                {SERVICES.filter((service) => service.group === group.id).map((service) => {
                  const Icon = I[service.icon];
                  return (
                    <Link
                      key={service.id}
                      to={service.path}
                      role="menuitem"
                      onClick={onPick}
                      className="nv-mega-item group"
                    >
                      <span className="nv-mega-icon">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-white/85 transition-colors group-hover:text-white">
                          {service.title}
                        </span>
                        <span className="block truncate text-[11px] text-white/40">
                          {service.short}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <span className="text-xs text-white/40">12 направлений · онлайн-расчёт стоимости</span>
          <Link to="/services" onClick={onPick} className="nv-cta h-9 px-4 text-[13px]">
            Все услуги <I.Arrow className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
