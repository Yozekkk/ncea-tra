import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { I, LOGO_MARK, LOGO_ROUND } from "@/components/site/ui";
import { SERVICES, startingPrice } from "@/lib/services";
import { useCurrency } from "@/lib/currency";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "NCEA — разработка и оформление Minecraft-проектов" },
    { name: "description", content: "Плагины, серверные сборки, сайты, карты, дизайн, ресурспаки, FancyMenu и ивенты для Minecraft-проектов." },
    { property: "og:title", content: "NCEA — Minecraft Digital Agency" },
    { property: "og:description", content: "Комплексные решения для Minecraft-серверов и игровых сообществ." },
  ] }),
  component: HomePage,
});

const TELEGRAM_URL = "https://t.me/lisiy_bob";
const DISCORD_URL = "https://discord.gg/u73vDgBMAn";
const GITHUB_URL = "https://github.com/Yozekkk";

const featured = ["plugins", "server-setup", "websites", "design", "modpacks", "events"]
  .map((id) => SERVICES.find((service) => service.id === id)).filter(Boolean) as typeof SERVICES;

const portfolio = [
  { title: "Minecraft-сервер под ключ", tag: "Server setup", code: "SERVER", desc: "Ядро, плагины, права, TAB, экономика, защита и оптимизация." },
  { title: "Сайт игрового проекта", tag: "Web development", code: "WEB", desc: "Адаптивный сайт с личным кабинетом, формами и интеграциями." },
  { title: "Карта для RPG-сервера", tag: "Minecraft map", code: "MAP", desc: "Локации, ландшафт, интерьеры и игровые механики." },
  { title: "Фирменное оформление", tag: "Brand design", code: "BRAND", desc: "Логотип, баннеры, карточки и единая визуальная система." },
];

const reviews = [
  { initials: "AK", name: "Алексей К.", role: "Владелец сервера", text: "Заказал настройку сервера и перенос конфигов. Всё сделали аккуратно, объяснили структуру и оставили понятную документацию." },
  { initials: "MR", name: "Максим Р.", role: "Разработчик проекта", text: "Плагин получился именно таким, как мы описывали. Особенно понравилась быстрая связь и нормальная поддержка после сдачи." },
  { initials: "DN", name: "Даниил N.", role: "Администратор Discord", text: "Оформление получилось единым для сайта, Discord и Telegram. Проект сразу стал выглядеть заметно профессиональнее." },
  { initials: "ES", name: "Егор С.", role: "Организатор ивентов", text: "Команда помогла со сценарием, картой и технической частью. Ивент прошёл без критических ошибок и задержек." },
  { initials: "VL", name: "Влад Л.", role: "Создатель сборки", text: "Сборку оптимизировали и настроили меню. После работы NCEA стало меньше вылетов и заметно быстрее запуск." },
  { initials: "NT", name: "Никита Т.", role: "Владелец сообщества", text: "Заказывали сайт и форму заказа. Всё адаптивно, понятно пользователям и хорошо работает на телефонах." },
  { initials: "AP", name: "Артём П.", role: "Руководитель проекта", text: "Понравился конфигуратор: заранее видно цену и сроки. После обсуждения не появилось неожиданных доплат." },
  { initials: "KS", name: "Кирилл С.", role: "Minecraft-билдер", text: "Заказали карту с несколькими зонами и интерьерами. Работа детальная, стиль выдержан, правки внесли быстро." },
];

const faq = [
  ["Как формируется цена?", "Стоимость зависит от базовой цены, объёма, дополнительных функций и срочности. Конфигуратор сразу показывает предварительный итог."],
  ["Можно заказать несколько услуг?", "Да. Например, сайт, логотип, настройку сервера и оформление Discord можно объединить в один проект."],
  ["Как отправить заказ?", "Настройте параметры, перейдите к итоговой цене и выберите Discord или Telegram на последнем шаге."],
  ["Есть ли поддержка после сдачи?", "Для большинства технических услуг можно добавить документацию и период поддержки после завершения работы."],
];

function HomePage() {
  const [openedFaq, setOpenedFaq] = useState<number | null>(0);
  const [selectedDirection, setSelectedDirection] = useState(0);
  const { fmt: fmtMoney } = useCurrency();
  const direction = SERVICES[selectedDirection];
  const DirectionIcon = I[direction.icon];

  return (
    <div className="ncea-site relative min-h-screen overflow-x-hidden bg-stone-950 text-white">
      <div className="noise fixed inset-0 z-0 opacity-20 pointer-events-none" />
      <div className="ncea-decor" aria-hidden="true" />
      <SiteHeader />
      <main className="relative z-10">
        <section id="home" className="ar-hero">
          <div className="ar-hero-grid">
            <div className="ar-hero-copy reveal">
              <img src={LOGO_MARK} alt="Логотип NCEA" width={180} height={180} className="ar-hero-wordmark" />
              <div className="ar-kicker"><span /> Заказы открыты</div>
              <h1>Не самые быстрые.<br /><em>Самые надёжные.</em></h1>
              <p>NCEA создаёт плагины, сборки, сайты, карты, дизайн и ивенты для Minecraft-проектов. Понятный процесс, расчёт стоимости и связь без лишних форм.</p>
              <div className="ar-actions">
                <Link to="/services" className="ar-button ar-button-primary">Рассчитать проект <I.Arrow className="h-5 w-5" /></Link>
                <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="ar-button ar-button-light"><I.Telegram className="h-5 w-5" /> Telegram</a>
                <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="ar-button ar-button-ghost"><I.Discord className="h-5 w-5" /> Discord</a>
              </div>
            </div>
            <div className="ar-hero-art reveal" aria-label="NCEA — Minecraft Digital Agency">
              <div className="ar-art-sun" /><div className="ar-art-grid" />
              <div className="ar-art-number">12</div>
              <div className="ar-art-caption">направлений<br />для вашего проекта</div>
              <img src={LOGO_ROUND} alt="Круглый логотип NCEA" width={768} height={768} className="ar-art-logo" />
              <div className="ar-art-ribbon">MINECRAFT DIGITAL AGENCY · NCEA · MINECRAFT DIGITAL AGENCY ·</div>
            </div>
          </div>
          <div className="ar-hero-bottom"><span>Сохранение параметров</span><i /><span>Discord и Telegram</span><i /><span>12 направлений</span></div>
        </section>

        <section id="about" className="ar-direction-section">
          <div className="ar-section-heading reveal"><span>О нас / направления</span><h2>Команда для развития<br /><em>Minecraft-проектов</em></h2></div>
          <div className="ar-direction-stage reveal">
            <div className="ar-direction-nav" role="tablist" aria-label="Направления NCEA">
              {SERVICES.map((service, index) => <button key={service.id} type="button" role="tab" aria-selected={selectedDirection === index} onClick={() => setSelectedDirection(index)} className={selectedDirection === index ? "is-active" : ""}><span>{String(index + 1).padStart(2, "0")}</span>{service.title}</button>)}
            </div>
            <div className="ar-direction-visual" aria-hidden="true"><div className="ar-direction-orbit" /><div className="ar-direction-icon"><DirectionIcon className="h-full w-full" /></div><div className="ar-direction-code">{direction.id.toUpperCase()}</div></div>
            <div className="ar-direction-copy">
              <div className="ar-kicker ar-kicker-dark"><span /> NCEA / {String(selectedDirection + 1).padStart(2, "0")}</div>
              <h3>{direction.title}</h3><p>{direction.short}</p>
              <div className="ar-direction-meta"><span>От <b>{fmtMoney(startingPrice(direction))}</b></span><span>От <b>{direction.days[0]} дней</b></span></div>
              <Link to={direction.path} className="ar-button ar-button-dark">Настроить заказ <I.Arrow className="h-5 w-5" /></Link>
            </div>
          </div>
        </section>

        <section id="services-preview" className="ar-services-section">
          <div className="ar-section-heading ar-heading-left reveal"><span>Популярные услуги</span><h2>Начните с нужного<br /><em>направления</em></h2></div>
          <div className="ar-services-list">
            {featured.map((service, index) => { const Icon = I[service.icon]; return <article key={service.id} className="ar-service-row reveal">
              <div className="ar-service-index">0{index + 1}</div><div className="ar-service-symbol"><Icon className="h-full w-full" /></div>
              <div className="ar-service-copy"><span>{index < 2 ? "Популярно" : service.id}</span><h3>{service.title}</h3><p>{service.short}</p></div>
              <div className="ar-service-price"><span>от</span><strong>{fmtMoney(startingPrice(service))}</strong><small>от {service.days[0]} дней</small></div>
              <Link to={service.path} className="ar-round-link" aria-label={`Настроить ${service.title}`}><I.Arrow className="h-7 w-7" /></Link>
            </article>; })}
          </div>
          <div className="ar-services-more"><Link to="/services" className="ar-button ar-button-light">Все услуги <I.Arrow className="h-5 w-5" /></Link></div>
        </section>

        <section className="ar-process-section">
          <div className="ar-section-heading reveal"><span>Как заказать</span><h2>Собрать проект<br /><em>очень просто</em></h2></div>
          <div className="ar-process-stage reveal">
            <div className="ar-process-art" aria-hidden="true"><img src={LOGO_MARK} alt="" width={620} height={620} /><span>NCEA</span></div>
            <article className="ar-step ar-step-one"><b>1 <small>шаг</small></b><h3>Выберите услугу и настройте параметры</h3><p>Конфигуратор сразу показывает предварительный итог.</p><Link to="/services">Выбрать услугу <I.Arrow className="h-4 w-4" /></Link></article>
            <article className="ar-step ar-step-two"><b>2 <small>шаг</small></b><h3>Получите расчёт и отправьте заявку</h3><p>На последнем шаге выберите Discord или Telegram.</p><Link to="/services">Рассчитать проект <I.Arrow className="h-4 w-4" /></Link></article>
          </div>
        </section>

        <section id="portfolio" className="ar-portfolio-section">
          <div className="ar-section-heading ar-heading-left reveal"><span>Портфолио</span><h2>Как может выглядеть<br /><em>ваш проект</em></h2></div>
          <div className="ar-portfolio-list">{portfolio.map((item, index) => <article key={item.title} className="ar-case reveal">
            <div className="ar-case-visual" aria-hidden="true"><span className="ar-case-number">0{index + 1}</span><span className="ar-case-code">{item.code}</span><div className="ar-case-window"><i /><i /><i /><strong>{item.code}</strong></div></div>
            <div className="ar-case-copy"><span>{item.tag}</span><h3>{item.title}</h3><p>{item.desc}</p></div>
          </article>)}</div>
        </section>

        <section id="team" className="ar-reviews-section">
          <div className="ar-section-heading reveal"><span>Отзывы</span><h2>Что говорят<br /><em>клиенты</em></h2></div>
          <div className="review-marquee"><div className="review-track">{[...reviews, ...reviews].map((review, index) => <article key={`${review.name}-${index}`} className="review-card"><div className="ar-review-head"><span className="review-avatar">{review.initials}</span><div><div>{review.name}</div><small>{review.role}</small></div><b>★★★★★</b></div><p>«{review.text}»</p></article>)}</div></div>
        </section>

        <section id="faq" className="ar-faq-section">
          <div className="ar-section-heading ar-heading-left reveal"><span>FAQ</span><h2>Ответы<br /><em>перед заказом</em></h2><p>Не нашли ответ — напишите менеджеру в Telegram или Discord.</p></div>
          <div className="ar-faq-list">{faq.map(([question, answer], index) => { const opened = openedFaq === index; return <article key={question} className={opened ? "is-open" : ""}><button onClick={() => setOpenedFaq(opened ? null : index)} aria-expanded={opened}><span>0{index + 1}</span>{question}<I.Chevron className="h-6 w-6" /></button>{opened && <p className="fade-up">{answer}</p>}</article>; })}</div>
        </section>

        <section id="partner" className="ar-social-section">
          <div className="ar-section-heading reveal"><span>Сотрудничество</span><h2>Готовы собрать<br /><em>проект?</em></h2><p>Выберите услугу и настройте параметры. На последнем шаге останутся только Discord и Telegram.</p></div>
          <div className="ar-social-links reveal">
            <Link to="/services" className="ar-social-card ar-social-order"><span>01</span><strong>Рассчитать<br />проект</strong><I.Arrow className="h-7 w-7" /></Link>
            <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="ar-social-card"><span>02</span><I.Telegram className="h-12 w-12" /><strong>Telegram</strong><I.Arrow className="h-7 w-7" /></a>
            <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="ar-social-card"><span>03</span><I.Discord className="h-12 w-12" /><strong>Discord</strong><I.Arrow className="h-7 w-7" /></a>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="ar-social-card"><span>04</span><strong>GitHub</strong><I.Arrow className="h-7 w-7" /></a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

