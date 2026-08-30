import { useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { ServiceGroupCard } from "@/components/site/ServiceGroupCard";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SERVICE_ART } from "@/lib/service-art";
import { GROUPS, SERVICES } from "@/lib/services";

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
      { name: "theme-color", content: "#090909" },
    ],
  }),
  component: ServicesPage,
});
function ServicesPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    const elements = page.querySelectorAll<HTMLElement>(".services-reveal");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    page.classList.add("services-motion-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="ref-site services-experience" ref={pageRef}>
      <a className="services-skip-link" href="#main-content">
        Перейти к каталогу
      </a>
      <SiteHeader />
      <main className="services-catalog" id="main-content">
        <span className="services-atmosphere services-atmosphere--one" aria-hidden="true" />
        <span className="services-atmosphere services-atmosphere--two" aria-hidden="true" />
        <section className="services-hero" aria-labelledby="services-title">
          <div className="services-hero-meta">
            <span>12 направлений</span>
            <span>NCEA / Service atlas</span>
          </div>
          <div className="services-hero-copy">
            <h1 id="services-title" aria-label="Услуги NCEA">
              <span>УСЛУГИ</span>
              <span>NCEA</span>
            </h1>
            <div>
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
            </div>
          </div>
          <div className="services-hero-line" aria-hidden="true">
            <span>DESIGN / CODE / CONTENT / SUPPORT</span>
            <i />
            <b>2026</b>
          </div>
        </section>

        <section className="services-groups" id="service-groups" aria-label="Каталог услуг NCEA">
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
                revealDelay={index * 70}
              />
            );
          })}
        </section>

        <section className="services-bottom services-reveal">
          <span>Не нашли точное направление?</span>
          <h2>Соберём решение вокруг вашей задачи.</h2>
          <a href="https://t.me/lisiy_bob" target="_blank" rel="noreferrer">
            Написать менеджеру
            <span className="services-inline-arrow" aria-hidden="true">
              <ArrowUpRight />
            </span>
          </a>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
