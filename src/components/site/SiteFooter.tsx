import { Link } from "@tanstack/react-router";
import { I, LOGO_ROUND, copy, DISCORD_TAG, TELEGRAM_TAG, DESIGNER } from "@/components/site/ui";
import { SERVICES } from "@/lib/services";
import { useHashNav } from "@/components/site/SiteHeader";

export function SiteFooter() {
  const goHash = useHashNav();
  const half = Math.ceil(SERVICES.length / 2);

  return (
    <footer className="relative pt-16 pb-10 border-t border-white/5">
      <div className="noise absolute inset-0 opacity-30 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-8">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <img src={LOGO_ROUND} alt="NCEA" className="w-10 h-10 rounded-full ring-1 ring-white/10" />
              <span className="font-display font-bold">NCEA <span className="gradient-text">Event Agency</span></span>
            </div>
            <p className="mt-4 text-white/50 text-sm max-w-sm">
              Агентство разработки и оформления Minecraft-проектов. Губерния Нова-Люминис, ТРА.
            </p>
            <div className="mt-4 text-white/40 text-xs">Внесено в ЕРФ</div>
          </div>

          <div>
            <div className="text-[11px] tracking-widest uppercase text-white/40">Услуги</div>
            <ul className="mt-4 flex flex-col gap-2 text-sm">
              {SERVICES.slice(0, half).map((s) => (
                <li key={s.id}>
                  <Link to={s.path} className="text-white/65 hover:text-white transition">{s.title}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[11px] tracking-widest uppercase text-white/40">Ещё услуги</div>
            <ul className="mt-4 flex flex-col gap-2 text-sm">
              {SERVICES.slice(half).map((s) => (
                <li key={s.id}>
                  <Link to={s.path} className="text-white/65 hover:text-white transition">{s.title}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[11px] tracking-widest uppercase text-white/40">Навигация</div>
            <ul className="mt-4 flex flex-col gap-2 text-sm">
              <li><Link to="/services" className="text-white/65 hover:text-white transition">Все услуги</Link></li>
              <li><button onClick={() => goHash("about")} className="text-white/65 hover:text-white transition">О нас</button></li>
              <li><button onClick={() => goHash("portfolio")} className="text-white/65 hover:text-white transition">Портфолио</button></li>
              <li><button onClick={() => goHash("team")} className="text-white/65 hover:text-white transition">Отзывы</button></li>
              <li><button onClick={() => goHash("staff")} className="text-white/65 hover:text-white transition">Сотрудники</button></li>
              <li><button onClick={() => goHash("partner")} className="text-white/65 hover:text-white transition">Сотрудничество</button></li>
            </ul>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => copy(TELEGRAM_TAG, `Telegram ${TELEGRAM_TAG} скопирован`)}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-full ring-1 ring-white/15 text-sm hover:bg-white hover:text-black transition"
              >
                <I.Telegram className="w-4 h-4" /> TG
              </button>
              <button
                onClick={() => copy(DISCORD_TAG, `Discord-тег ${DISCORD_TAG} скопирован`)}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-full ring-1 ring-white/15 text-sm hover:bg-white hover:text-black transition"
              >
                <I.Discord className="w-4 h-4" /> DS
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-white/40">
          <div>© {new Date().getFullYear()} NovaCraft Event Agency (NCEA). Все права защищены.</div>
          <button onClick={() => copy(DESIGNER, "Скопировано")} className="hover:text-white transition">
            Дизайн и разработка от <span className="text-brand-orange">{DESIGNER}</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
