import { createFileRoute, Link } from "@tanstack/react-router";
import { I } from "@/components/site/ui";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { GROUPS, SERVICES, startingPrice } from "@/lib/services";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Услуги NCEA — Minecraft-разработка, контент и оформление" },
      { name: "description", content: "12 направлений NCEA: плагины, сборки, настройка серверов, ресурспаки, карты, скины, дизайн, ивенты и сайты. Онлайн-расчёт стоимости в евро." },
      { property: "og:title", content: "Услуги NCEA — Minecraft-разработка, контент и оформление" },
      { property: "og:description", content: "12 направлений с пошаговым конфигуратором и расчётом стоимости." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <div className="relative min-h-screen bg-stone-950 text-white overflow-x-hidden">
      <div className="noise fixed inset-0 opacity-40 pointer-events-none z-0" />
      <SiteHeader />
      <main className="relative z-10 pt-28 pb-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-white/45">
            <Link to="/" className="hover:text-white transition">Главная</Link>
            <span>→</span>
            <span className="text-white/80">Услуги</span>
          </nav>
          <h1 className="mt-6 font-display font-extrabold text-4xl lg:text-6xl leading-[1.05]">
            Все <span className="gradient-text">услуги</span> агентства
          </h1>
          <p className="mt-4 text-white/55 max-w-2xl">
            12 направлений: от разработки плагинов и настройки серверов до дизайна, ивентов и сайтов.
            Выберите услугу и рассчитайте стоимость в пошаговом конфигураторе.
          </p>

          {GROUPS.map((g) => (
            <section key={g.id} className="mt-14">
              <div className="flex items-center gap-3">
                <h2 className="font-display font-bold text-2xl">{g.label}</h2>
                <span className="h-px flex-1 bg-white/10" />
              </div>
              <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SERVICES.filter((s) => s.group === g.id).map((s) => {
                  const Icon = I[s.icon];
                  return (
                    <Link key={s.id} to={s.path} className="group glass-card p-6 flex flex-col hover-scale">
                      <span className="inline-flex w-12 h-12 items-center justify-center rounded-2xl bg-linear-to-br from-brand-red/20 to-brand-orange/20 ring-1 ring-white/10 text-brand-orange">
                        <Icon className="w-6 h-6" />
                      </span>
                      <span className="mt-4 font-display font-bold text-lg">{s.title}</span>
                      <span className="mt-2 text-sm text-white/50 flex-1">{s.short}</span>
                      <span className="mt-5 flex items-center justify-between">
                        <span className="text-sm text-white/70">от <b className="gradient-text">{startingPrice(s)}</b></span>
                        <span className="inline-flex items-center gap-1.5 text-sm text-brand-orange">
                          Рассчитать <I.Arrow className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
