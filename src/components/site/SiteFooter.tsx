import { Link } from "@tanstack/react-router";
import { I, LOGO_ROUND } from "@/components/site/ui";
import { SERVICES } from "@/lib/services";
import { useHashNav } from "@/components/site/SiteHeader";

const TELEGRAM_URL = "https://t.me/lisiy_bob";
const DISCORD_URL = "https://discord.gg/u73vDgBMAn";
const GITHUB_URL = "https://github.com/Yozekkk";

export function SiteFooter() {
  const goHash = useHashNav();
  const featured = SERVICES.slice(0, 6);

  return (
    <footer className="relative overflow-hidden border-t border-white/5 pt-16 pb-10">
      <div className="noise absolute inset-0 opacity-25 pointer-events-none" />
      <div className="absolute -left-36 top-0 h-72 w-72 rounded-full bg-brand-red/10 blur-3xl pointer-events-none" />
      <div className="absolute -right-36 bottom-0 h-72 w-72 rounded-full bg-brand-orange/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="glass-card mb-12 grid gap-7 p-6 md:grid-cols-[1fr_auto] md:items-center lg:p-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange">Готовы начать?</div>
            <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Соберите заказ и узнайте предварительную стоимость</h2>
            <p className="mt-3 max-w-2xl text-sm text-white/50">Выберите услугу, настройте параметры и отправьте готовую заявку менеджеру NCEA.</p>
          </div>
          <Link to="/services" className="inline-flex h-12 items-center justify-center gap-2 rounded-full gradient-btn px-6 font-medium">
            Выбрать услугу <I.Arrow className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3" aria-label="NCEA — на главную">
              <img src={LOGO_ROUND} alt="Логотип NCEA" className="h-11 w-11 rounded-full object-contain ring-1 ring-white/10" />
              <span className="font-display text-lg font-bold">NCEA <span className="gradient-text">Event Agency</span></span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/50">Агентство разработки и оформления Minecraft-проектов: плагины, сборки, сайты, карты, ресурспаки, дизайн и ивенты.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm ring-1 ring-white/15 transition hover:bg-white hover:text-black"><I.Telegram className="h-4 w-4" /> Telegram</a>
              <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm ring-1 ring-white/15 transition hover:bg-white hover:text-black"><I.Discord className="h-4 w-4" /> Discord</a>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm ring-1 ring-white/15 transition hover:bg-white hover:text-black">GitHub</a>
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">Популярные услуги</div>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              {featured.map((service) => <li key={service.id}><Link to={service.path} className="text-white/60 transition hover:text-white">{service.title}</Link></li>)}
            </ul>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">Навигация</div>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              <li><Link to="/" className="text-white/60 transition hover:text-white">Главная</Link></li>
              <li><Link to="/services" className="text-white/60 transition hover:text-white">Все услуги</Link></li>
              <li><button onClick={() => goHash("about")} className="text-left text-white/60 transition hover:text-white">О нас</button></li>
              <li><button onClick={() => goHash("portfolio")} className="text-left text-white/60 transition hover:text-white">Портфолио</button></li>
              <li><button onClick={() => goHash("team")} className="text-left text-white/60 transition hover:text-white">Отзывы</button></li>
              <li><button onClick={() => goHash("faq")} className="text-left text-white/60 transition hover:text-white">FAQ</button></li>
            </ul>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">Связь</div>
            <div className="mt-4 space-y-3 text-sm text-white/55">
              <p>Telegram: <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="text-white/85 hover:text-brand-orange">@lisiy_bob</a></p>
              <p>Discord: <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="text-white/85 hover:text-brand-orange">сервер NCEA</a></p>
              <p>Заказы принимаются через конфигураторы услуг.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-white/35">
          <div>© {new Date().getFullYear()} NovaCraft Event Agency. Все права защищены.</div>
          <div>NCEA v2 · Minecraft Digital Agency</div>
        </div>
      </div>
    </footer>
  );
}
