import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, type CSSProperties } from "react";
import { I } from "@/components/site/ui";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { GROUPS, SERVICES, startingPrice, type Service } from "@/lib/services";
import { useCurrency } from "@/lib/currency";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Услуги NCEA — Minecraft-разработка, дизайн и ивенты" },
      {
        name: "description",
        content:
          "Все услуги NCEA: плагины, сборки, настройка серверов, сайты, карты, скины, дизайн, логотипы, ресурспаки, FancyMenu, ивенты и поддержка.",
      },
      { property: "og:title", content: "Услуги NCEA — Minecraft-разработка, дизайн и ивенты" },
      {
        property: "og:description",
        content:
          "12 направлений с отдельными конфигураторами, расчётом стоимости и срока выполнения.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ServicesPage,
});

const CARD_TONES = ["ember", "ink", "paper", "brown"] as const;

function cardSpan(count: number, index: number) {
  if (count === 5) return ["feature", "hero", "regular", "regular", "regular"][index];
  if (count === 4) return ["hero", "feature", "half", "half"][index];
  return "regular";
}

function ServiceCard({
  service,
  index,
  localIndex,
  groupCount,
  fmt,
}: {
  service: Service;
  index: number;
  localIndex: number;
  groupCount: number;
  fmt: (amount: number) => string;
}) {
  const Icon = I[service.icon];
  const number = String(index + 1).padStart(2, "0");
  const tone = CARD_TONES[index % CARD_TONES.length];
  const span = cardSpan(groupCount, localIndex);
  const style = { "--card-delay": `${localIndex * 70}ms` } as CSSProperties;

  return (
    <Link
      to={service.path}
      className={`service-showcase-card service-showcase-card--${tone} service-showcase-card--${span}`}
      style={style}
      aria-label={`${service.title}: настроить заказ`}
    >
      <span className="service-card-grid" aria-hidden="true" />
      <Icon className="service-card-symbol" />
      <span className="service-card-orbit" aria-hidden="true">
        <i />
        <i />
      </span>

      <span className="service-card-top">
        <span className="service-card-number">{number}</span>
        {index % 3 === 1 && <span className="service-card-badge">NCEA</span>}
      </span>

      <span className="service-card-copy">
        <span className="service-card-kicker">NCEA / SERVICE {number}</span>
        <strong className="service-card-title">{service.title}</strong>
        <span className="service-card-description">{service.short}</span>
      </span>

      <span className="service-card-meta">
        <span>
          <small>От</small>
          <b>{fmt(startingPrice(service))}</b>
        </span>
        <span>
          <small>Срок</small>
          <b>от {service.days[0]} дн.</b>
        </span>
      </span>

      <span className="service-card-action">
        <b>Настроить заказ</b>
        <span>
          <I.Arrow className="h-5 w-5" />
        </span>
      </span>
    </Link>
  );
}

function ServicesPage() {
  const { fmt } = useCurrency();
  const catalogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = catalogRef.current;
    if (!root || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let frame = 0;
    const handlePointer = (event: PointerEvent) => {
      const card = (event.target as HTMLElement).closest<HTMLElement>(".service-showcase-card");
      if (!card || !root.contains(card)) return;
      const x = event.clientX;
      const y = event.clientY;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mouse-x", `${x - rect.left}px`);
        card.style.setProperty("--mouse-y", `${y - rect.top}px`);
      });
    };

    root.addEventListener("pointermove", handlePointer, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener("pointermove", handlePointer);
    };
  }, []);

  return (
    <div className="ncea-catalog relative min-h-screen bg-stone-950 text-white">
      <div className="noise fixed inset-0 opacity-30 pointer-events-none z-0" />
      <SiteHeader />
      <main ref={catalogRef} className="catalog-main relative z-10">
        <section className="catalog-hero">
          <div className="catalog-hero-grid" aria-hidden="true" />
          <div className="catalog-hero-word" aria-hidden="true">
            SERVICES
          </div>
          <div className="catalog-hero-ring" aria-hidden="true">
            <i />
          </div>

          <div className="catalog-shell relative z-10">
            <nav
              aria-label="Хлебные крошки"
              className="reveal-left flex items-center gap-2 text-xs text-white/45"
            >
              <Link to="/" className="catalog-text-link">
                Главная
              </Link>
              <span aria-hidden="true">→</span>
              <span className="text-white/80" aria-current="page">
                Услуги
              </span>
            </nav>

            <div className="catalog-hero-layout">
              <div>
                <span className="catalog-eyebrow reveal-left">NCEA / SERVICE DIRECTORY</span>
                <h1 className="catalog-hero-title reveal-stagger" aria-label="Все услуги агентства">
                  <span>
                    <i>Все</i>
                  </span>
                  <span>
                    <i>услуги</i>
                  </span>
                  <span>
                    <i>агентства</i>
                  </span>
                </h1>
                <p className="catalog-hero-copy reveal-up">
                  Выберите направление, настройте параметры заказа и сразу получите предварительную
                  стоимость и срок выполнения.
                </p>
              </div>

              <div className="catalog-hero-index reveal-right" aria-hidden="true">
                <span>
                  AVAILABLE
                  <br />
                  DIRECTIONS
                </span>
                <b>{String(SERVICES.length).padStart(2, "0")}</b>
                <i>
                  NCEA © 2026
                  <br />
                  50.4501° N / 30.5234° E
                </i>
              </div>
            </div>
          </div>
        </section>

        <div className="catalog-groups">
          {GROUPS.map((group, groupIndex) => {
            const services = SERVICES.filter((service) => service.group === group.id);
            return (
              <section
                key={group.id}
                className="catalog-group"
                aria-labelledby={`group-${group.id}`}
              >
                <div className="catalog-shell">
                  <header className="catalog-group-heading">
                    <span className="catalog-group-index reveal-left">
                      {String(groupIndex + 1).padStart(2, "0")} /
                    </span>
                    <h2 id={`group-${group.id}`} className="catalog-group-title reveal-stagger">
                      <span>
                        <i>{group.label}</i>
                      </span>
                    </h2>
                    <span className="catalog-group-count reveal-right">
                      {String(services.length).padStart(2, "0")} направлений
                    </span>
                  </header>

                  <div className="service-showcase-grid reveal-stagger">
                    {services.map((service, localIndex) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        index={SERVICES.indexOf(service)}
                        localIndex={localIndex}
                        groupCount={services.length}
                        fmt={fmt}
                      />
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

