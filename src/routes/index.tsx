import { type PointerEvent as ReactPointerEvent } from "react";
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
import { SERVICE_ART } from "@/lib/service-art";
import { SERVICES } from "@/lib/services";
import {
  MOTION_DURATION,
  MOTION_EASE,
  MOTION_SPRING,
  MOTION_VIEWPORT,
  directionalReveal,
  revealItem,
  staggerContainer,
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
const SOFT_HOVER = { transform: "translate3d(0, -2px, 0)", transition: MOTION_SPRING } as const;
const CARD_HOVER = { transform: "translate3d(0, -4px, 0)", transition: MOTION_SPRING } as const;
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

function HomePage() {
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
    <div className="ref-site">
      <SiteHeader />
      <main>
        <motion.section
          className="ref-hero"
          id="home"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            variants={{
              hidden: {
                opacity: 0,
                clipPath: "inset(0 0 100% 0)",
                transform: "translate3d(0, 18px, 0)",
              },
              visible: {
                opacity: 1,
                clipPath: "inset(0 0 0% 0)",
                transform: "translate3d(0, 0, 0)",
                transition: { duration: 0.58, ease: MOTION_EASE },
              },
            }}
          >
            NCEA
          </motion.h1>
          <motion.p className="ref-hero-copy" variants={revealItem}>
            Разработка, оформление и поддержка Minecraft-проектов.
            <br />
            Плагины, сборки, сайты, дизайн и серверные решения.
            <br />
            Для владельцев проектов, команд и сообществ.
          </motion.p>
        </motion.section>
        <motion.section
          className="ref-promos"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={MOTION_VIEWPORT}
        >
          <motion.a
            className="ref-promo ref-promo-orange"
            href={ORDER}
            target="_blank"
            rel="noreferrer"
            variants={directionalReveal("left")}
            whileHover={SOFT_HOVER}
            whileTap={{ transform: "scale(0.985)" }}
          >
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
          </motion.a>
          <motion.a
            className="ref-promo ref-promo-channel"
            href={TG}
            target="_blank"
            rel="noreferrer"
            variants={directionalReveal("right")}
            whileHover={SOFT_HOVER}
            whileTap={{ transform: "scale(0.985)" }}
          >
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
          </motion.a>
        </motion.section>
        <motion.section
          className="ref-stats"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={MOTION_VIEWPORT}
        >
          <motion.article variants={revealItem} whileHover={SOFT_HOVER}>
            <UsersRound />
            <span>
              <strong>7+</strong>
              <small>специалистов</small>
            </span>
          </motion.article>
          <motion.article variants={revealItem} whileHover={SOFT_HOVER}>
            <Boxes />
            <span>
              <strong>12</strong>
              <small>направлений</small>
            </span>
          </motion.article>
          <motion.article variants={revealItem} whileHover={SOFT_HOVER}>
            <CheckCircle2 />
            <span>
              <strong>50+</strong>
              <small>выполненных задач</small>
            </span>
          </motion.article>
          <motion.article variants={revealItem} whileHover={SOFT_HOVER}>
            <Headphones />
            <span>
              <strong>7/7</strong>
              <small>связь с командой</small>
            </span>
          </motion.article>
        </motion.section>
        <motion.section
          className="ref-services"
          initial="hidden"
          whileInView="visible"
          viewport={MOTION_VIEWPORT}
        >
          <motion.header variants={revealItem}>
            <p>УСЛУГИ NCEA</p>
            <h2>Разработка и контент</h2>
            <span>
              Реальные услуги команды — без калькуляторов и скрытых пакетов. Задачу и формат
              обсуждаем напрямую.
            </span>
          </motion.header>
          <div
            className="ref-service-grid"
            onPointerMove={moveVoxelAssets}
            onPointerLeave={resetVoxelAssets}
          >
            {featured.map((service, index) => {
              const presentation = SERVICE_PRESENTATION[index];
              const Icon = presentation.icon;
              return (
                <motion.article
                  className={`ref-service-card ref-service-card--${presentation.layout}`}
                  key={service.id}
                  variants={directionalReveal(index % 2 === 0 ? "left" : "right", index * 0.045)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={MOTION_VIEWPORT}
                  whileHover={CARD_HOVER}
                  whileTap={{ transform: "translate3d(0, -1px, 0) scale(0.992)" }}
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
                    <motion.span
                      className="ref-voxel-motion"
                      initial={{ opacity: 0, transform: "translate3d(0, 12px, 0) rotate(-2deg)" }}
                      whileInView={{ opacity: 1, transform: "translate3d(0, 0, 0) rotate(0deg)" }}
                      viewport={MOTION_VIEWPORT}
                      transition={{
                        delay: 0.16 + index * 0.045,
                        duration: MOTION_DURATION.reveal,
                        ease: MOTION_EASE,
                      }}
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
                    </motion.span>
                  </span>
                </motion.article>
              );
            })}
          </div>
          <div className="ref-all-services">
            <Link to="/services">
              Все 12 услуг <ArrowUpRight />
            </Link>
          </div>
        </motion.section>
        <motion.section
          className="ref-reviews"
          id="reviews"
          variants={revealItem}
          initial="hidden"
          whileInView="visible"
          viewport={MOTION_VIEWPORT}
        >
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
        </motion.section>
        <motion.section
          className="ref-community"
          id="contacts"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={MOTION_VIEWPORT}
        >
          <div className="ref-footer-heading">
            <p>СООБЩЕСТВА</p>
            <h2>Оставайтесь на связи</h2>
          </div>
          <div className="ref-community-grid">
            <motion.a
              className="ref-social-card ref-telegram"
              href={TG}
              target="_blank"
              rel="noreferrer"
              variants={directionalReveal("left")}
              whileHover={SOFT_HOVER}
              whileTap={{ transform: "scale(0.985)" }}
            >
              <span>
                <Send />
                <b>Telegram</b>
                <small>@ncea_official</small>
              </span>
              <strong>
                Подписаться <ArrowUpRight />
              </strong>
            </motion.a>
            <motion.a
              className="ref-social-card ref-discord"
              href={DISCORD}
              target="_blank"
              rel="noreferrer"
              variants={directionalReveal("right")}
              whileHover={SOFT_HOVER}
              whileTap={{ transform: "scale(0.985)" }}
            >
              <span>
                <Gamepad2 className="ref-discord-glyph" />
                <b>Discord</b>
                <small>Сервер NCEA</small>
              </span>
              <strong>
                Вступить <ArrowUpRight />
              </strong>
            </motion.a>
          </div>
        </motion.section>
      </main>
      <SiteFooter />
    </div>
  );
}
