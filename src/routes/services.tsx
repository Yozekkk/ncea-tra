import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "iconoir-react";
import { motion } from "motion/react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ServiceReviews } from "@/components/site/ServiceReviews";
import { BrandMarquee } from "@/components/site/BrandMarquee";
import { GROUPS, SERVICES } from "@/lib/services";
import { SERVICE_MAIN_ASSETS } from "@/lib/service-art";
import "@/styles-ncea-redesign.css";

const ticker = "ПЛАГИНЫ • СЕРВЕРЫ • ДИЗАЙН • СБОРКИ • ОПТИМИЗАЦИЯ • РЕСУРСПАКИ • ";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Услуги NCEA — разработка и контент" },
      { name: "description", content: "Все услуги NCEA для Minecraft-проектов." },
      { name: "theme-color", content: "#ffffff" },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <div className="ref-site ncea-services-page">
      <a className="services-skip-link" href="#main-content">
        Перейти к каталогу
      </a>
      <SiteHeader />
      <main id="main-content" className="ncea-services-main">
        <section className="ncea-services-hero">
          <p className="ncea-section-label">NCEA / НАПРАВЛЕНИЯ</p>
          <h1>
            ТОВАРЫ <span>И УСЛУГИ</span>
          </h1>
          <p>
            Разработка, визуальный контент и сопровождение Minecraft-проектов. Выберите направление
            — детали и формат обсудим напрямую.
          </p>
          <div className="ncea-services-stat" aria-label={`${SERVICES.length} направлений услуг`}>
            <strong>{SERVICES.length}</strong>
            <span>направлений в каталоге</span>
          </div>
        </section>
        <BrandMarquee text={ticker} />
        {GROUPS.map((group) => (
          <section
            className="ncea-service-section"
            key={group.id}
            aria-labelledby={`group-${group.id}`}
          >
            <div className="ncea-service-section-heading">
              <p className="ncea-section-label">NCEA STUDIO / УСЛУГИ</p>
              <h2 id={`group-${group.id}`}>{group.label}</h2>
            </div>
            <div className="ncea-service-grid">
              {SERVICES.filter((service) => service.group === group.id).map((service) => {
                const globalIndex = SERVICES.findIndex((item) => item.id === service.id);
                return (
                  <motion.article className="ncea-service-card" key={service.id}>
                    <Link to={service.path} aria-label={`Подробнее: ${service.title}`}>
                      <div className="ncea-service-art">
                        <img
                          src={SERVICE_MAIN_ASSETS[globalIndex % SERVICE_MAIN_ASSETS.length]}
                          alt=""
                          width="280"
                          height="280"
                          loading="lazy"
                        />
                      </div>
                      <div className="ncea-service-card-copy">
                        <span className="ncea-service-card-category">{group.label}</span>
                        <h3>{service.title}</h3>
                        <p>{service.short}</p>
                        <span className="ncea-service-card-action">
                          Подробнее <ArrowUpRight aria-hidden="true" />
                        </span>
                      </div>
                    </Link>
                  </motion.article>
                );
              })}
            </div>
          </section>
        ))}
        <ServiceReviews />
        <section className="ncea-services-contact">
          <div>
            <p className="ncea-section-label">ОБСУДИМ ПРОЕКТ</p>
            <h2>Нужна помощь с выбором?</h2>
            <p>Расскажите менеджеру о задаче — подберём подходящее направление.</p>
          </div>
          <a href="https://t.me/lisiy_bob" target="_blank" rel="noreferrer">
            Написать менеджеру <ArrowUpRight aria-hidden="true" />
          </a>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
