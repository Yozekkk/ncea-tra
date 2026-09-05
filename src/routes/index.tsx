import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
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
  Monitor,
  PackageOpen,
  Palette,
  Send,
  ServerCog,
  UsersRound,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ReviewsSection } from "@/components/site/ReviewsSection";
import { SERVICE_ART } from "@/lib/service-art";
import { SERVICES } from "@/lib/services";
import {
  WORKERS_MOTION_VIEWPORT,
  workersDirectionalReveal,
  workersHeadingReveal,
  workersItemReveal,
  workersStaggerContainer,
} from "@/lib/motion";

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
  .map((id) => SERVICES.find((service) => service.id === id))
  .filter(Boolean) as typeof SERVICES;

const SERVICE_PRESENTATION = [
  {
    icon: Code2,
    label: "Плагины",
    assets: SERVICE_ART.plugins,
    layout: "wide",
    art: "command",
  },
  {
    icon: PackageOpen,
    label: "Сборки",
    assets: SERVICE_ART.modpacks,
    layout: "standard",
    art: "chest",
  },
  {
    icon: ServerCog,
    label: "Сервер",
    assets: SERVICE_ART.server,
    layout: "standard",
    art: "crafter",
  },
  {
    icon: Monitor,
    label: "Сайты",
    assets: SERVICE_ART.websites,
    layout: "feature",
    art: "bookshelf",
  },
  {
    icon: Palette,
    label: "Дизайн",
    assets: SERVICE_ART.design,
    layout: "compact",
    art: "enchanting",
  },
  {
    icon: CalendarDays,
    label: "Ивенты",
    assets: SERVICE_ART.events,
    layout: "wide-compact",
    art: "event",
  },
] as const;

const STATS = [
  [UsersRound, "7+", "специалистов"],
  [Boxes, "12", "направлений"],
  [CheckCircle2, "50+", "выполненных задач"],
  [Headphones, "7/7", "связь с командой"],
] as const;

function HomePage() {
  return (
    <div className="ref-site">
      <SiteHeader />
      <main>
        <motion.section
          className="ref-hero"
          id="home"
          variants={workersStaggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 variants={workersHeadingReveal}>NCEA</motion.h1>
          <motion.p className="ref-hero-copy" variants={workersItemReveal}>
            Разработка, оформление и поддержка Minecraft-проектов.
            <br />
            Плагины, сборки, сайты, дизайн и серверные решения.
            <br />
            Для владельцев проектов, команд и сообществ.
          </motion.p>
        </motion.section>

        <motion.section
          className="ref-promos"
          variants={workersStaggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={WORKERS_MOTION_VIEWPORT}
        >
          <motion.div className="ref-promo-motion" variants={workersDirectionalReveal("left")}>
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
          </motion.div>
          <motion.div className="ref-promo-motion" variants={workersDirectionalReveal("right")}>
            <a className="ref-promo ref-promo-channel" href={TG} target="_blank" rel="noreferrer">
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
          </motion.div>
        </motion.section>

        <motion.section
          className="ref-stats"
          variants={workersStaggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={WORKERS_MOTION_VIEWPORT}
        >
          {STATS.map(([Icon, value, label]) => (
            <motion.div className="ref-stat-motion" variants={workersItemReveal} key={label}>
              <article>
                <Icon />
                <span>
                  <strong>{value}</strong>
                  <small>{label}</small>
                </span>
              </article>
            </motion.div>
          ))}
        </motion.section>

        <motion.section
          className="ref-services"
          variants={workersStaggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={WORKERS_MOTION_VIEWPORT}
        >
          <motion.header variants={workersHeadingReveal}>
            <p>УСЛУГИ NCEA</p>
            <h2>Разработка и контент</h2>
            <span>
              Реальные услуги команды — без калькуляторов и скрытых пакетов. Задачу и формат
              обсуждаем напрямую.
            </span>
          </motion.header>
          <motion.div className="ref-service-grid" variants={workersStaggerContainer}>
            {featured.map((service, index) => {
              const presentation = SERVICE_PRESENTATION[index];
              const Icon = presentation.icon;
              return (
                <motion.div
                  className={`ref-service-card-motion ref-service-card-motion--${presentation.layout}`}
                  key={service.id}
                  variants={workersDirectionalReveal(index % 2 === 0 ? "left" : "right")}
                >
                  <article className={`ref-service-card ref-service-card--${presentation.layout}`}>
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
                      aria-hidden="true"
                    >
                      <span className="ref-voxel-stage">
                        {presentation.assets.map((asset) => (
                          <img
                            className={`ref-voxel ref-voxel--${asset.role}`}
                            src={asset.src}
                            alt=""
                            loading="lazy"
                            key={asset.src}
                          />
                        ))}
                      </span>
                    </span>
                  </article>
                </motion.div>
              );
            })}
          </motion.div>
          <div className="ref-all-services">
            <Link to="/services">
              Все 12 услуг <ArrowUpRight />
            </Link>
          </div>
        </motion.section>

        <ReviewsSection />

        <motion.section
          className="ref-community"
          id="contacts"
          variants={workersStaggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={WORKERS_MOTION_VIEWPORT}
        >
          <motion.div className="ref-footer-heading" variants={workersHeadingReveal}>
            <p>СООБЩЕСТВА</p>
            <h2>Оставайтесь на связи</h2>
          </motion.div>
          <motion.div className="ref-community-grid" variants={workersStaggerContainer}>
            <motion.div
              className="ref-social-card-motion"
              variants={workersDirectionalReveal("left")}
            >
              <a
                className="ref-social-card ref-telegram"
                href={TG}
                target="_blank"
                rel="noreferrer"
              >
                <span>
                  <Send />
                  <b>Telegram</b>
                  <small>@ncea_official</small>
                </span>
                <strong>
                  Подписаться <ArrowUpRight />
                </strong>
              </a>
            </motion.div>
            <motion.div
              className="ref-social-card-motion"
              variants={workersDirectionalReveal("right")}
            >
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
            </motion.div>
          </motion.div>
        </motion.section>
      </main>
      <SiteFooter />
    </div>
  );
}
