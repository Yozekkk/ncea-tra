import { createFileRoute, Link } from "@tanstack/react-router";
import { I } from "@/components/site/ui";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { GROUPS, SERVICES, startingPrice } from "@/lib/services";
import { useCurrency } from "@/lib/currency";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Услуги NCEA — Minecraft-разработка, дизайн и ивенты" },
      { name: "description", content: "Все услуги NCEA: плагины, сборки, настройка серверов, сайты, карты, скины, дизайн, логотипы, ресурспаки, FancyMenu, ивенты и поддержка." },
      { property: "og:title", content: "Услуги NCEA — Minecraft-разработка, дизайн и ивенты" },
      { property: "og:description", content: "12 направлений с отдельными конфигураторами, расчётом стоимости и срока выполнения." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { fmt } = useCurrency();
  return (
    <div className="relative min-h-screen bg-stone-950 text-white overflow-x-hidden">
      <div className="noise fixed inset-0 opacity-40 pointer-events-none z-0" />
      <SiteHeader />
      <main className="relative z-10 pt-28 pb-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <nav aria-label="Хлебные крошки" className="flex items-center gap-2 text-xs text-white/45">
            <Link to="/" className="hover:text-white transition">Главная</Link><span aria-hidden="true">→</span><span className="text-white/80" aria-current="page">Услуги</span>
          </nav>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-end">
            <div>
              <h1 className="font-display font-extrabold text-4xl lg:text-6xl leading-[1.05]">Все <span className="gradient-text">услуги</span> агентства</h1>
              <p className="mt-4 text-white/55 max-w-2xl">Выберите направление, настройте параметры заказа и сразу получите предварительную стоимость и срок выполнения.</p>
            </div>
            <div className="glass-card p-5 text-sm text-white/55">
              <div className="font-display text-lg font-bold text-white">Как это работает</div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <span className="rounded-xl bg-white/4 p-3"><b className="block text-brand-orange">1</b>Услуга</span>
                <span className="rounded-xl bg-white/4 p-3"><b className="block text-brand-orange">2</b>Настройка</span>
                <span className="rounded-xl bg-white/4 p-3"><b className="block text-brand-orange">3</b>Заявка</span>
              </div>
            </div>
          </div>

          {GROUPS.map((group) => (
            <section key={group.id} className="mt-14" aria-labelledby={`group-${group.id}`}>
              <div className="flex items-center gap-3"><h2 id={`group-${group.id}`} className="font-display font-bold text-2xl">{group.label}</h2><span className="h-px flex-1 bg-white/10" /></div>
              <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SERVICES.filter((service) => service.group === group.id).map((service) => {
                  const Icon = I[service.icon];
                  return (
                    <article key={service.id} className="group glass-card p-6 flex flex-col hover-scale">
                      <span className="inline-flex w-12 h-12 items-center justify-center rounded-2xl bg-linear-to-br from-brand-red/20 to-brand-orange/20 ring-1 ring-white/10 text-brand-orange"><Icon className="w-6 h-6" /></span>
                      <h3 className="mt-4 font-display font-bold text-lg">{service.title}</h3>
                      <p className="mt-2 text-sm text-white/50 flex-1">{service.short}</p>
                      <div className="mt-5 flex items-center justify-between gap-4 text-sm">
                        <span className="text-white/70">От <b className="gradient-text">{fmt(startingPrice(service))}</b></span>
                        <span className="text-white/45">Срок: от {service.days[0]} дн.</span>
                      </div>
                      <Link to={service.path} className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-full gradient-btn px-5 text-sm font-medium">
                        Настроить заказ <I.Arrow className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </article>
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
