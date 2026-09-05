import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { ServiceGroupCard } from "@/components/site/ServiceGroupCard";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SERVICE_ART } from "@/lib/service-art";
import { GROUPS, SERVICES } from "@/lib/services";
import {
  WORKERS_MOTION_VIEWPORT,
  workersHeadingReveal,
  workersItemReveal,
  workersStaggerContainer,
} from "@/lib/motion";

const GROUP_PRESENTATIONS = [
  {
    variant: "primary" as const,
    label: "Minecraft development",
    title: ["MINECRAFT", "РАЗРАБОТКА"] as const,
    description:
      "Серверная инженерия, игровые механики и техническая основа проекта — от идеи до стабильного запуска.",
    art: SERVICE_ART.plugins,
    ctaTitle: "Нужна своя механика?",
    ctaCopy: "Опишите задачу — предложим технический формат.",
  },
  {
    variant: "creative" as const,
    label: "Content & identity",
    title: ["КОНТЕНТ", "& ДИЗАЙН"] as const,
    description:
      "Создаём визуальный язык и игровой контент, которые помогают Minecraft-проекту запомниться.",
    art: SERVICE_ART.design,
    ctaTitle: "Нужен цельный образ?",
    ctaCopy: "Соберём задачу в понятное творческое направление.",
  },
  {
    variant: "compact" as const,
    label: "Special projects",
    title: ["ДРУГИЕ", "УСЛУГИ"] as const,
    description:
      "Ивенты, сайты и сопровождение — всё, что соединяет проект с аудиторией и поддерживает его рост.",
    art: SERVICE_ART.events,
    ctaTitle: "Задача вне списка?",
    ctaCopy: "Расскажите о ней напрямую менеджеру NCEA.",
  },
] as const;
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
    <div className="ref-site services-experience">
      <a className="services-skip-link" href="#main-content">
        Перейти к каталогу
      </a>
      <SiteHeader />
      <main className="services-catalog" id="main-content">
        <span className="services-atmosphere services-atmosphere--one" aria-hidden="true" />
        <span className="services-atmosphere services-atmosphere--two" aria-hidden="true" />
        <motion.section
          className="services-hero"
          aria-labelledby="services-title"
          variants={workersStaggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="services-hero-meta" variants={workersItemReveal}>
            <span>12 направлений</span>
            <span>NCEA / Service atlas</span>
          </motion.div>
          <div className="services-hero-copy">
            <motion.h1 id="services-title" aria-label="Услуги NCEA" variants={workersHeadingReveal}>
              <span>УСЛУГИ</span>
              <span>NCEA</span>
            </motion.h1>
            <motion.div variants={workersItemReveal}>
              <p>
                Разработка, контент и сопровождение Minecraft-проектов. Выберите направление —
                детали и формат обсудим напрямую.
              </p>
              <a href="#service-groups">
                Смотреть каталог
                <span className="services-inline-arrow" aria-hidden="true">
                  <ArrowDownRight />
                </span>
              </a>
            </motion.div>
          </div>
          <motion.div
            className="services-hero-line"
            aria-hidden="true"
            variants={workersItemReveal}
          >
            <span>DESIGN / CODE / CONTENT / SUPPORT</span>
            <i />
            <b>2026</b>
          </motion.div>
        </motion.section>

        <motion.section
          className="services-groups"
          id="service-groups"
          aria-label="Каталог услуг NCEA"
          variants={workersStaggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={WORKERS_MOTION_VIEWPORT}
        >
          <span className="services-voxel-ribbon" aria-hidden="true">
            <i />
            <b />
            <em />
          </span>
          {GROUPS.map((group, index) => {
            const presentation = GROUP_PRESENTATIONS[index];
            const services = SERVICES.filter((service) => service.group === group.id);
            return (
              <ServiceGroupCard
                key={group.id}
                number={`0${index + 1}`}
                label={presentation.label}
                title={presentation.title}
                description={presentation.description}
                services={services}
                variant={presentation.variant}
                art={presentation.art}
                ctaTitle={presentation.ctaTitle}
                ctaCopy={presentation.ctaCopy}
              />
            );
          })}
        </motion.section>

        <motion.section
          className="services-bottom"
          variants={workersItemReveal}
          initial="hidden"
          whileInView="visible"
          viewport={WORKERS_MOTION_VIEWPORT}
        >
          <span>Не нашли точное направление?</span>
          <h2>Соберём решение вокруг вашей задачи.</h2>
          <a href="https://t.me/lisiy_bob" target="_blank" rel="noreferrer">
            Написать менеджеру
            <span className="services-inline-arrow" aria-hidden="true">
              <ArrowUpRight />
            </span>
          </a>
        </motion.section>
      </main>
      <SiteFooter />
    </div>
  );
}
