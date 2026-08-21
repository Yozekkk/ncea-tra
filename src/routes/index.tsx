import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { I, LOGO_MARK, LOGO_ROUND } from "@/components/site/ui";
import { SERVICES, startingPrice } from "@/lib/services";
import { useCurrency } from "@/lib/currency";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NCEA — разработка и оформление Minecraft-проектов" },
      { name: "description", content: "Плагины, серверные сборки, сайты, карты, дизайн, ресурспаки, FancyMenu и ивенты для Minecraft-проектов." },
      { property: "og:title", content: "NCEA — Minecraft Digital Agency" },
      { property: "og:description", content: "Комплексные решения для Minecraft-серверов и игровых сообществ." },
    ],
  }),
  component: HomePage,
});

const TELEGRAM_URL = "https://t.me/lisiy_bob";
const DISCORD_URL = "https://discord.gg/u73vDgBMAn";

const featured = ["plugins", "server-setup", "websites", "design", "modpacks", "events"]
  .map((id) => SERVICES.find((service) => service.id === id))
  .filter(Boolean) as typeof SERVICES;

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
  const { fmt: fmtMoney } = useCurrency();
  const doubledReviews = [...reviews, ...reviews];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-stone-950 text-white">
      <div className="noise fixed inset-0 z-0 opacity-35 pointer-events-none" />
      <div className="ncea-decor" aria-hidden="true" />
      <div className="liquid-orb liquid-orb-a" />
      <div className="liquid-orb liquid-orb-b" />
      <div className="network-background" aria-hidden="true"><span className="network-layer network-layer-a" /><span className="network-layer network-layer-b" /></div>

      <SiteHeader />

      <main className="relative z-10">
        <section id="home" className="relative flex min-h-screen items-center overflow-hidden pb-16 pt-24">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
            <div className="reveal min-w-0">
              <div className="liquid-secondary inline-flex items-center gap-2 px-4 py-2 text-xs text-white/70">
                <span className="h-2 w-2 rounded-full bg-brand-orange shadow-[0_0_16px_rgba(255,120,40,.9)]" /> Заказы открыты
              </div>
              <h1 className="mt-7 max-w-4xl font-display text-[1.75rem] font-black leading-[1] tracking-[-.04em] sm:text-6xl lg:text-7xl">
                Не самые быстрые. <span className="gradient-text">Самые надёжные.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lead">NCEA создаёт плагины, сборки, сайты, карты, дизайн и ивенты для Minecraft-проектов. Понятный процесс, расчёт стоимости и связь без лишних форм.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/services" className="cta-pulse gradient-btn magnetic inline-flex h-13 items-center gap-2 rounded-full px-7 font-semibold">Рассчитать проект <I.Arrow className="h-4 w-4" /></Link>
                <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="liquid-secondary inline-flex h-13 items-center gap-2 px-7 font-medium"><I.Telegram className="h-5 w-5" /> Telegram</a>
                <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="liquid-secondary inline-flex h-13 items-center gap-2 px-7 font-medium"><I.Discord className="h-5 w-5" /> Discord</a>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/45">
                <span className="inline-flex items-center gap-2"><I.Check className="h-4 w-4 text-brand-orange" /> 12 направлений</span>
                <span className="inline-flex items-center gap-2"><I.Check className="h-4 w-4 text-brand-orange" /> Сохранение параметров</span>
                <span className="inline-flex items-center gap-2"><I.Check className="h-4 w-4 text-brand-orange" /> Discord и Telegram</span>
              </div>
            </div>

            <div className="reveal relative mx-auto w-full max-w-xl">
              <img src={LOGO_MARK} alt="Логотип NCEA" width={132} height={132} className="brand-glow mx-auto mb-6 h-28 w-28 rounded-[28px] object-cover ring-1 ring-white/10 sm:h-32 sm:w-32" />
              <div className="liquid-panel relative overflow-hidden p-5 sm:p-7">
                <div className="flex items-center justify-between border-b border-white/8 pb-5">
                  <div className="text-sm font-medium text-white/65">Выберите направление</div>
                  <span className="rounded-full border border-brand-orange/25 bg-brand-orange/10 px-3 py-1 text-[10px] text-brand-orange">ONLINE</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {featured.slice(0, 4).map((service) => {
                    const Icon = I[service.icon];
                    return (
                      <Link key={service.id} to={service.path} className="liquid-choice service-square group block p-5">
                        <div className="flex items-start justify-between">
                          <span className="liquid-icon inline-flex h-10 w-10 items-center justify-center text-brand-orange"><Icon className="h-5 w-5" /></span>
                          <I.Arrow className="h-4 w-4 text-white/25 transition group-hover:translate-x-1 group-hover:text-brand-orange" />
                        </div>
                        <div className="mt-4 font-display font-bold text-white">{service.title}</div>
                        <div className="mt-1 text-xs text-white/42">От {fmtMoney(startingPrice(service))} · от {service.days[0]} дней</div>
                      </Link>
                    );
                  })}
                </div>
                <Link to="/services" className="gradient-btn mt-4 flex h-12 items-center justify-center gap-2 rounded-2xl text-sm font-semibold">Открыть все услуги <I.Arrow className="h-4 w-4" /></Link>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="scroll-mt-24 border-y border-white/5 py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:px-8">
            <div className="reveal">
              <div className="text-caption text-brand-orange">О нас</div>
              <h2 className="mt-4 text-section">Команда для развития Minecraft-проектов</h2>
              <img src={LOGO_ROUND} alt="Круглый логотип NCEA" width={128} height={128} loading="lazy" className="brand-glow mt-8 h-28 w-28 rounded-full object-cover ring-1 ring-white/10" />
            </div>
            <div className="reveal-stagger grid gap-5 sm:grid-cols-2">
              <div className="liquid-panel p-6 transition duration-300 hover:-translate-y-1"><div className="gradient-text font-display text-3xl font-black">12</div><div className="mt-2 font-medium">направлений</div><p className="mt-2 text-sm leading-6 text-white/50">Разработка, настройка, дизайн и организация событий в одном месте.</p></div>
              <div className="liquid-panel p-6 transition duration-300 hover:-translate-y-1"><div className="gradient-text font-display text-3xl font-black">40%</div><div className="mt-2 font-medium">ниже старого прайса</div><p className="mt-2 text-sm leading-6 text-white/50">Предварительная цена рассчитывается сразу по выбранным параметрам.</p></div>
              <div className="liquid-panel p-6 transition duration-300 hover:-translate-y-1"><div className="gradient-text font-display text-3xl font-black">24/7</div><div className="mt-2 font-medium">приём заявок</div><p className="mt-2 text-sm leading-6 text-white/50">Конфигураторы доступны в любое время и сохраняют выбранные настройки.</p></div>
              <div className="liquid-panel p-6 transition duration-300 hover:-translate-y-1"><div className="gradient-text font-display text-3xl font-black">100%</div><div className="mt-2 font-medium">индивидуально</div><p className="mt-2 text-sm leading-6 text-white/50">Каждый проект собирается под конкретную задачу, а не по одному шаблону.</p></div>
            </div>
          </div>
        </section>

        <section id="services-preview" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-24 lg:px-8">
          <div className="reveal flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><div className="text-caption text-brand-orange">Популярные услуги</div><h2 className="mt-4 text-section">Начните с нужного направления</h2></div>
            <Link to="/services" className="inline-flex items-center gap-2 text-sm text-brand-orange">Все услуги <I.Arrow className="h-4 w-4" /></Link>
          </div>
          <div className="reveal-stagger mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((service, index) => {
              const Icon = I[service.icon];
              return (
                <article key={service.id} className="liquid-panel group flex min-h-[280px] flex-col p-6 transition duration-300 hover:-translate-y-1.5">
                  <div className="flex items-start justify-between"><span className="liquid-icon inline-flex h-12 w-12 items-center justify-center text-brand-orange"><Icon className="h-6 w-6" /></span>{index < 2 && <span className="rounded-full border border-brand-orange/25 bg-brand-orange/10 px-3 py-1 text-[10px] uppercase tracking-wider text-brand-orange">Популярно</span>}</div>
                  <h3 className="mt-6 font-display text-xl font-bold">{service.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-white/47">{service.short}</p>
                  <div className="mt-6 flex items-center justify-between text-sm"><span>От <b className="gradient-text">{fmtMoney(startingPrice(service))}</b></span><span className="text-white/38">от {service.days[0]} дней</span></div>
                  <Link to={service.path} className="liquid-secondary mt-4 inline-flex h-11 items-center justify-center gap-2 px-5">Настроить заказ <I.Arrow className="h-4 w-4" /></Link>
                </article>
              );
            })}
          </div>
        </section>

        <section id="portfolio" className="scroll-mt-24 bg-white/[.015] py-24">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="reveal max-w-2xl"><div className="text-caption text-brand-orange">Портфолио</div><h2 className="mt-4 text-section">Как может выглядеть ваш проект</h2></div>
            <div className="reveal-stagger mt-10 grid gap-5 md:grid-cols-2">
              {portfolio.map((item, index) => (
                <article key={item.title} className="portfolio-code-card liquid-panel reveal group overflow-hidden p-6">
                  <div className="portfolio-code-visual" aria-hidden="true">
                    <span className="portfolio-code-index">0{index + 1}</span>
                    <span className="portfolio-code-label">{item.code}</span>
                    <span className="portfolio-code-line portfolio-code-line-a" />
                    <span className="portfolio-code-line portfolio-code-line-b" />
                    <span className="portfolio-code-dot portfolio-code-dot-a" />
                    <span className="portfolio-code-dot portfolio-code-dot-b" />
                    <I.Arrow className="portfolio-code-arrow h-6 w-6" />
                  </div>
                  <div className="mt-6 text-xs uppercase tracking-[.2em] text-brand-orange">{item.tag}</div>
                  <h3 className="mt-3 font-display text-2xl font-bold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/48">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="team" className="scroll-mt-24 py-24">
          <div className="mx-auto max-w-7xl px-4 lg:px-8"><div className="reveal text-center"><div className="text-caption text-brand-orange">Отзывы</div><h2 className="mt-4 text-section">Что говорят клиенты</h2></div></div>
          <div className="review-marquee mt-10"><div className="review-track">{doubledReviews.map((review, index) => <article key={`${review.name}-${index}`} className="review-card"><div className="flex items-center gap-3"><span className="review-avatar">{review.initials}</span><div><div className="font-medium">{review.name}</div><div className="text-xs text-white/38">{review.role}</div></div></div><div className="mt-4 tracking-[.16em] text-brand-orange">★★★★★</div><p className="mt-4 text-sm leading-6 text-white/58">«{review.text}»</p></article>)}</div></div>
        </section>

        <section id="faq" className="mx-auto grid max-w-7xl scroll-mt-24 gap-10 px-4 py-24 lg:grid-cols-[.75fr_1.25fr] lg:px-8">
          <div className="reveal"><div className="text-caption text-brand-orange">FAQ</div><h2 className="mt-4 text-section">Ответы перед заказом</h2><p className="mt-5 text-sm leading-6 text-white/48">Не нашли ответ — напишите менеджеру в Telegram или Discord.</p></div>
          <div className="flex flex-col gap-3">{faq.map(([question, answer], index) => { const opened = openedFaq === index; return <article key={question} className="liquid-panel reveal"><button onClick={() => setOpenedFaq(opened ? null : index)} aria-expanded={opened} className="flex w-full items-center justify-between gap-4 p-5 text-left font-medium">{question}<I.Chevron className={`h-5 w-5 shrink-0 transition ${opened ? "rotate-180 text-brand-orange" : "text-white/35"}`} /></button>{opened && <p className="fade-up px-5 pb-5 text-sm leading-6 text-white/48">{answer}</p>}</article>; })}</div>
        </section>

        <section id="partner" className="scroll-mt-24 px-4 pb-24 lg:px-8">
          <div className="liquid-panel reveal mx-auto max-w-7xl px-6 py-14 text-center sm:px-10 sm:py-20">
            <img src={LOGO_ROUND} alt="Логотип NCEA" width={112} height={112} loading="lazy" className="round-brand-image mx-auto h-24 w-24" />
            <h2 className="mt-6 text-section">Готовы собрать проект?</h2>
            <p className="mx-auto mt-5 max-w-2xl text-white/55">Выберите услугу и настройте параметры. На последнем шаге останутся только Discord и Telegram.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3"><Link to="/services" className="cta-pulse gradient-btn inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold">Рассчитать проект <I.Arrow className="h-4 w-4" /></Link><a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="liquid-secondary inline-flex h-12 items-center gap-2 px-6"><I.Telegram className="h-5 w-5" /> Telegram</a><a href={DISCORD_URL} target="_blank" rel="noreferrer" className="liquid-secondary inline-flex h-12 items-center gap-2 px-6"><I.Discord className="h-5 w-5" /> Discord</a></div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
