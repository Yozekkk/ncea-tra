import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Boxes,
  CalendarDays,
  CheckCircle2,
  Code2,
  Gamepad2,
  Headphones,
  MessageSquareQuote,
  Monitor,
  PackageOpen,
  Palette,
  Send,
  ServerCog,
  UsersRound,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SERVICES } from "@/lib/services";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NCEA — разработка Minecraft-проектов" },
      {
        name: "description",
        content:
          "NCEA создаёт плагины, сборки, сайты, карты, дизайн и ивенты для Minecraft-проектов.",
      },
    ],
  }),
  component: HomePage,
});
const TG = "https://t.me/ncea_official",
  ORDER = "https://t.me/lisiy_bob",
  DISCORD = "https://discord.gg/u73vDgBMAn";
const TAGS: Record<string, string[]> = {
  plugins: ["Paper", "Purpur", "Velocity"],
  modpacks: ["Forge", "Fabric", "Квесты"],
  "server-setup": ["Ядро", "Защита", "Оптимизация"],
  websites: ["Landing", "Frontend", "Интеграции"],
  design: ["Баннеры", "Discord", "Telegram"],
  events: ["Турниры", "Квесты", "Сезоны"],
};
const featured = ["plugins", "modpacks", "server-setup", "websites", "design", "events"]
  .map((id) => SERVICES.find((s) => s.id === id))
  .filter(Boolean) as typeof SERVICES;
const SERVICE_PRESENTATION = [
  {
    icon: Code2,
    label: "Плагины",
    asset: "/images/voxel/plugin-console.png",
    layout: "wide",
    art: "console",
  },
  {
    icon: PackageOpen,
    label: "Сборки",
    asset: "/images/voxel/modpack-chest.png",
    layout: "standard",
    art: "chest",
  },
  {
    icon: ServerCog,
    label: "Сервер",
    asset: "/images/voxel/server-redstone.png",
    layout: "standard",
    art: "block",
  },
  {
    icon: Monitor,
    label: "Сайты",
    asset: "/images/voxel/website-workstation.png",
    layout: "feature",
    art: "workstation",
  },
  {
    icon: Palette,
    label: "Дизайн",
    asset: "/images/voxel/design-archive.png",
    layout: "compact",
    art: "archive",
  },
  {
    icon: CalendarDays,
    label: "Ивенты",
    asset: "/images/voxel/event-table.png",
    layout: "wide-compact",
    art: "event",
  },
] as const;

function HomePage() {
  const siteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = siteRef.current;
    if (!root || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const nodes = root.querySelectorAll<HTMLElement>(".ref-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -36px" },
    );

    root.classList.add("ref-motion-ready");
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const moveVoxelAssets = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(min-width: 821px) and (pointer: fine)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 9;
    event.currentTarget.querySelectorAll<HTMLElement>(".ref-voxel-wrap").forEach((node) => {
      const depth = Number(node.dataset.depth ?? 1);
      node.style.setProperty("--object-x", `${(x * depth).toFixed(2)}px`);
      node.style.setProperty("--object-y", `${(y * depth).toFixed(2)}px`);
    });
  };

  const resetVoxelAssets = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.querySelectorAll<HTMLElement>(".ref-voxel-wrap").forEach((node) => {
      node.style.setProperty("--object-x", "0px");
      node.style.setProperty("--object-y", "0px");
    });
  };

  return (
    <div className="ref-site" ref={siteRef}>
      <SiteHeader />
      <main>
        <section className="ref-hero" id="home">
          <h1>NCEA</h1>
          <p className="ref-hero-copy">
            Разработка, оформление и поддержка Minecraft-проектов.
            <br />
            Плагины, сборки, сайты, дизайн и серверные решения.
            <br />
            Для владельцев проектов, команд и сообществ.
          </p>
        </section>
        <section className="ref-promos ref-reveal">
          <a className="ref-promo ref-promo-orange" href={ORDER} target="_blank" rel="noreferrer">
            <span className="ref-promo-icon">
              <BadgeCheck />
            </span>
            <span>
              <small>РАЗРАБОТКА</small>
              <strong>Проект под ключ</strong>
              <em>Плагины · сборка · сайт · оформление</em>
            </span>
            <b>
              Обсудить проект <ArrowUpRight />
            </b>
          </a>
          <a className="ref-promo ref-promo-dark" href={TG} target="_blank" rel="noreferrer">
            <span className="ref-promo-icon">
              <BarChart3 />
            </span>
            <span>
              <small>СООБЩЕСТВО</small>
              <strong>Telegram NCEA</strong>
              <em>Новости, кейсы и обновления агентства</em>
            </span>
            <i className="ref-promo-chart" />
            <b>
              Перейти <ArrowUpRight />
            </b>
          </a>
        </section>
        <section className="ref-stats ref-reveal">
          <article>
            <UsersRound />
            <span>
              <strong>7+</strong>
              <small>специалистов</small>
            </span>
          </article>
          <article>
            <Boxes />
            <span>
              <strong>12</strong>
              <small>направлений</small>
            </span>
          </article>
          <article>
            <CheckCircle2 />
            <span>
              <strong>50+</strong>
              <small>выполненных задач</small>
            </span>
          </article>
          <article>
            <Headphones />
            <span>
              <strong>7/7</strong>
              <small>связь с командой</small>
            </span>
          </article>
        </section>
        <section className="ref-services ref-reveal">
          <header>
            <p>УСЛУГИ NCEA</p>
            <h2>Разработка и контент</h2>
            <span>
              Реальные услуги команды — без калькуляторов и скрытых пакетов. Задачу и формат
              обсуждаем напрямую.
            </span>
          </header>
          <div
            className="ref-service-grid"
            onPointerMove={moveVoxelAssets}
            onPointerLeave={resetVoxelAssets}
          >
            {featured.map((service, index) => {
              const presentation = SERVICE_PRESENTATION[index];
              const Icon = presentation.icon;
              return (
                <article
                  className={`ref-service-card ref-service-card--${presentation.layout}`}
                  key={service.id}
                >
                  <div className="ref-service-content">
                    <div className="ref-service-top">
                      <span>
                        <Icon />
                        {presentation.label}
                      </span>
                      <a href={ORDER} target="_blank" rel="noreferrer">
                        Заказать <ArrowUpRight />
                      </a>
                    </div>
                    <h3>{service.title}</h3>
                    <p>{service.short}</p>
                    <div className="ref-tags">
                      {TAGS[service.id].map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <Link to={service.path} className="ref-service-more">
                      Подробнее о направлении <ArrowUpRight />
                    </Link>
                  </div>
                  <span
                    className={`ref-voxel-wrap ref-voxel-wrap--${presentation.art}`}
                    data-depth={0.72 + (index % 3) * 0.16}
                    aria-hidden="true"
                  >
                    <img className="ref-voxel" src={presentation.asset} alt="" loading="lazy" />
                  </span>
                </article>
              );
            })}
          </div>
          <div className="ref-all-services">
            <Link to="/services">
              Все 12 услуг <ArrowUpRight />
            </Link>
          </div>
        </section>
        <section className="ref-reviews ref-reveal" id="reviews">
          <div className="ref-footer-heading">
            <p>ОТЗЫВЫ</p>
            <h2>Что говорят клиенты</h2>
          </div>
          <div className="ref-review-placeholder">
            <MessageSquareQuote />
            <span>
              <strong>Отзывы скоро появятся</strong>
              <small>Скоро здесь появятся отзывы наших клиентов.</small>
            </span>
          </div>
        </section>
        <section className="ref-community ref-reveal" id="contacts">
          <div className="ref-footer-heading">
            <p>СООБЩЕСТВА</p>
            <h2>Оставайтесь на связи</h2>
          </div>
          <div className="ref-community-grid">
            <a className="ref-social-card ref-telegram" href={TG} target="_blank" rel="noreferrer">
              <span>
                <Send />
                <b>Telegram</b>
                <small>@ncea_official</small>
              </span>
              <strong>
                Подписаться <ArrowUpRight />
              </strong>
            </a>
            <a
              className="ref-social-card ref-discord"
              href={DISCORD}
              target="_blank"
              rel="noreferrer"
            >
              <span>
                <Gamepad2 className="ref-discord-glyph" />
                <b>Discord</b>
                <small>Сервер NCEA</small>
              </span>
              <strong>
                Вступить <ArrowUpRight />
              </strong>
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
