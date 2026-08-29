import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { I } from "@/components/site/ui";
import { GROUPS, SERVICES } from "@/lib/services";
export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Услуги NCEA — разработка и контент" },
      { name: "description", content: "Все услуги NCEA для Minecraft-проектов." },
    ],
  }),
  component: ServicesPage,
});
const ASSETS = [
  "/images/voxel/command-block.png",
  "/images/voxel/enchanting-table.png",
  "/images/voxel/project-chest.png",
];
function ServicesPage() {
  return (
    <div className="ref-site">
      <SiteHeader />
      <main className="ref-catalog">
        <section className="ref-catalog-hero">
          <p className="ref-eyebrow">12 НАПРАВЛЕНИЙ NCEA</p>
          <h1>Все услуги</h1>
          <p>
            Выберите направление и напишите менеджеру. Ценовых конфигураторов, пакетов и
            автоматических расчётов больше нет.
          </p>
          <a href="https://t.me/lisiy_bob" target="_blank" rel="noreferrer">
            Обсудить проект <ArrowUpRight />
          </a>
        </section>
        {GROUPS.map((group, gi) => {
          const items = SERVICES.filter((s) => s.group === group.id);
          return (
            <section className="ref-catalog-group" key={group.id}>
              <header>
                <span>0{gi + 1}</span>
                <h2>{group.label}</h2>
                <small>{items.length} направлений</small>
              </header>
              <div>
                {items.map((service) => {
                  const Icon = I[service.icon],
                    index = SERVICES.indexOf(service);
                  return (
                    <Link key={service.id} to={service.path} className="ref-catalog-card">
                      <span className="ref-catalog-icon">
                        <Icon />
                      </span>
                      <span>
                        <strong>{service.title}</strong>
                        <small>{service.short}</small>
                      </span>
                      <img src={ASSETS[index % 3]} alt="" loading="lazy" />
                      <ArrowUpRight className="ref-catalog-arrow" />
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>
      <SiteFooter />
    </div>
  );
}
