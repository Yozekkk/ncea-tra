import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Check, MessageCircle, Send } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SERVICE_MAIN_ASSETS } from "@/lib/service-art";
import { SERVICES, getService } from "@/lib/services";
const ORDER = "https://t.me/lisiy_bob",
  CHANNEL = "https://t.me/ncea_official";
export function ServicePage({ id }: { id: string }) {
  const service = getService(id);
  const index = Math.max(
    0,
    SERVICES.findIndex((s) => s.id === id),
  );
  const related = SERVICES.filter((s) => s.id !== id).slice(index % 5, (index % 5) + 3);
  const deliverables = service.steps.slice(0, 4).map((s) => s.title);
  return (
    <div className="ref-site">
      <SiteHeader />
      <main className="ref-service-page">
        <nav className="ref-breadcrumbs">
          <Link to="/">Главная</Link>
          <span>/</span>
          <Link to="/services">Услуги</Link>
          <span>/</span>
          <b>{service.title}</b>
        </nav>
        <section className="ref-service-hero">
          <div>
            <p className="ref-eyebrow">NCEA / УСЛУГА {String(index + 1).padStart(2, "0")}</p>
            <h1>{service.title}</h1>
            <p>{service.desc}</p>
            <div className="ref-service-actions">
              <a href={ORDER} target="_blank" rel="noreferrer">
                <MessageCircle /> Заказать <ArrowUpRight />
              </a>
              <a href={CHANNEL} target="_blank" rel="noreferrer">
                <Send /> Telegram-канал
              </a>
            </div>
          </div>
          <img src={SERVICE_MAIN_ASSETS[index % SERVICE_MAIN_ASSETS.length]} alt="" />
        </section>
        <section className="ref-service-details">
          <div>
            <p className="ref-eyebrow">ЧТО ВХОДИТ</p>
            <h2>Работа под вашу задачу</h2>
            <p>
              Без выбора пакетов и автоматического расчёта. Напишите менеджеру, расскажите о проекте
              — команда предложит подходящий объём и порядок работы.
            </p>
          </div>
          <div className="ref-deliverables">
            {deliverables.map((x) => (
              <div key={x}>
                <Check />
                {x}
              </div>
            ))}
            <div>
              <Check />
              Связь и согласование результата
            </div>
          </div>
        </section>
        <section className="ref-order-banner">
          <div>
            <p>ГОТОВЫ ОБСУДИТЬ?</p>
            <h2>Расскажите о вашем проекте</h2>
            <span>Ответим в Telegram и уточним задачу без формы-конфигуратора.</span>
          </div>
          <a href={ORDER} target="_blank" rel="noreferrer">
            Написать в ЛС <ArrowUpRight />
          </a>
        </section>
        <section className="ref-related">
          <div className="ref-related-heading">
            <div>
              <p className="ref-eyebrow">ЕЩЁ УСЛУГИ</p>
              <h2>Другие направления</h2>
            </div>
            <Link to="/services">
              Все услуги <ArrowUpRight />
            </Link>
          </div>
          <div>
            {related.map((item) => (
              <Link key={item.id} to={item.path}>
                <span>
                  {item.title}
                  <small>{item.short}</small>
                </span>
                <ArrowUpRight />
              </Link>
            ))}
          </div>
        </section>
        <Link to="/services" className="ref-back">
          <ArrowLeft /> Вернуться к услугам
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
