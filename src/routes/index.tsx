import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Boxes,
  CheckCircle2,
  Code2,
  Headphones,
  Send,
  UsersRound,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { LOGO_MARK } from "@/components/site/ui";
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
const ASSETS = [
  "/images/voxel/command-block.png",
  "/images/voxel/enchanting-table.png",
  "/images/voxel/project-chest.png",
];
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

function HomePage() {
  return (
    <div className="ref-site">
      <SiteHeader />
      <main>
        <section className="ref-hero" id="home">
          <div className="ref-hero-mark">
            <img src={LOGO_MARK} alt="Логотип NCEA" />
          </div>
          <p className="ref-eyebrow">MINECRAFT DIGITAL AGENCY</p>
          <h1>NCEA</h1>
          <p className="ref-hero-copy">
            Разработка, оформление и техническая поддержка Minecraft-проектов.
            <br />
            От первой идеи до стабильного запуска.
          </p>
          <div className="ref-hero-actions">
            <a href={ORDER} target="_blank" rel="noreferrer">
              Заказать проект <ArrowUpRight />
            </a>
            <Link to="/services">Смотреть услуги</Link>
          </div>
        </section>
        <section className="ref-promos">
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
        <section className="ref-stats">
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
        <section className="ref-services" id="about">
          <header>
            <p>УСЛУГИ NCEA</p>
            <h2>Разработка и контент</h2>
            <span>
              Реальные услуги команды — без калькуляторов и скрытых пакетов. Задачу и формат
              обсуждаем напрямую.
            </span>
          </header>
          <div className="ref-service-grid">
            {featured.map((service, index) => {
              const Icon = index % 2 ? Boxes : Code2;
              return (
                <article className="ref-service-card" key={service.id}>
                  <div className="ref-service-content">
                    <div className="ref-service-top">
                      <span>
                        <Icon />
                        {service.title}
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
                      Подробнее о направлении →
                    </Link>
                  </div>
                  <img className="ref-voxel" src={ASSETS[index % 3]} alt="" loading="lazy" />
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
        <section className="ref-reviews" id="reviews">
          <div className="ref-footer-heading">
            <p>ОТЗЫВЫ</p>
            <h2>Что говорят клиенты</h2>
          </div>
          <div className="ref-review-grid">
            <article>
              <strong>Алексей К.</strong>
              <small>Владелец сервера</small>
              <p>
                «Команда аккуратно настроила сервер, объяснила структуру и осталась на связи после
                запуска.»
              </p>
            </article>
            <article>
              <strong>Максим Р.</strong>
              <small>Разработчик проекта</small>
              <p>
                «Получили именно ту механику, которую обсуждали. Правки внесли быстро и без лишней
                бюрократии.»
              </p>
            </article>
            <article>
              <strong>Никита Т.</strong>
              <small>Владелец сообщества</small>
              <p>
                «Сайт и оформление выглядят цельно, отлично работают на телефонах и понятны
                пользователям.»
              </p>
            </article>
          </div>
        </section>
        <section className="ref-community" id="contacts">
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
                <b className="ref-discord-glyph">◉</b>
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
