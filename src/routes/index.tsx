import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { I, LOGO_MARK } from "@/components/site/ui";
import { SERVICES, startingPrice } from "@/lib/services";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NCEA — разработка и оформление Minecraft-проектов" },
      { name: "description", content: "Плагины, серверные сборки, сайты, карты, скины, дизайн, ресурспаки, FancyMenu и ивенты для Minecraft-проектов." },
      { property: "og:title", content: "NCEA — разработка и оформление Minecraft-проектов" },
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

const stats = [
  { value: "12", label: "направлений", desc: "От разработки до оформления" },
  { value: "24/7", label: "приём заявок", desc: "Конфигуратор работает всегда" },
  { value: "1–14", label: "дней на старт", desc: "Зависит от сложности проекта" },
  { value: "100%", label: "индивидуально", desc: "Без шаблонных решений" },
];

const portfolio = [
  { title: "Игровой сервер под ключ", tag: "Server setup", desc: "Ядро, плагины, права, TAB, экономика, защита и оптимизация.", icon: "Wrench" as const },
  { title: "Сайт Minecraft-проекта", tag: "Web development", desc: "Современный адаптивный сайт с формами, кабинетами и интеграциями.", icon: "Globe" as const },
  { title: "Ивент для сообщества", tag: "Events", desc: "Сценарий, карта, механики, ведущий и техническое сопровождение.", icon: "Gift" as const },
  { title: "Фирменное оформление", tag: "Design", desc: "Логотип, баннеры, карточки, Telegram и Discord в единой стилистике.", icon: "Paint" as const },
];

const reviews = [
  { name: "Владелец Minecraft-проекта", role: "Заказ настройки сервера", text: "Получили полностью готовую структуру сервера, понятные конфиги и документацию. Всё можно было запускать сразу после сдачи." },
  { name: "Администратор сообщества", role: "Заказ дизайна", text: "NCEA сохранили атмосферу проекта и сделали оформление единым для сайта, Telegram и Discord." },
  { name: "Организатор ивента", role: "Заказ мероприятия", text: "Команда помогла со сценарием, механиками и проведением. Участникам было понятно, а нам не пришлось решать технические проблемы во время события." },
];

const faq = [
  ["Как формируется цена?", "Цена рассчитывается из базовой стоимости услуги, выбранных функций, объёма работы и срочности. Итог в конфигураторе предварительный."],
  ["Можно ли заказать несколько услуг одновременно?", "Да. Например, сайт, логотип и оформление Discord можно объединить в один комплексный проект."],
  ["Как передать техническое задание?", "В финальной форме можно указать ссылку на ТЗ или прикрепить файл. После этого менеджер уточнит детали."],
  ["Что происходит после отправки заявки?", "Менеджер проверяет параметры, уточняет сроки и финальную стоимость, после чего согласовывает начало работы."],
];

function HomePage() {
  const [openedFaq, setOpenedFaq] = useState<number | null>(0);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-stone-950 text-white">
      <div className="noise fixed inset-0 z-0 opacity-40 pointer-events-none" />
      <SiteHeader />

      <main className="relative z-10">
        <section id="home" className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-[-10%] top-[10%] h-[520px] w-[520px] rounded-full bg-brand-red/12 blur-[120px]" />
            <div className="absolute right-[-8%] bottom-[5%] h-[460px] w-[460px] rounded-full bg-brand-orange/10 blur-[120px]" />
          </div>

          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-orange/25 bg-white/4 px-4 py-2 text-xs text-white/65 backdrop-blur-xl">
                <span className="h-2 w-2 rounded-full bg-brand-orange shadow-[0_0_16px_rgba(255,120,40,.8)]" />
                Заказы на разработку и оформление открыты
              </div>

              <h1 className="mt-7 max-w-4xl font-display text-5xl font-black leading-[.96] tracking-[-.04em] sm:text-6xl lg:text-7xl">
                Мы создаём проекты, которые делают <span className="gradient-text">игру интереснее</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/58 sm:text-lg">
                NCEA — агентство разработки и оформления Minecraft-проектов. Плагины, сборки, сайты, карты, скины, ресурспаки, дизайн и ивенты в единой профессиональной системе.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/services" className="inline-flex h-13 items-center gap-2 rounded-full gradient-btn px-7 font-semibold">
                  Выбрать услугу <I.Arrow className="h-4 w-4" />
                </Link>
                <a href="#portfolio" className="inline-flex h-13 items-center gap-2 rounded-full px-7 font-medium ring-1 ring-white/15 transition hover:bg-white hover:text-black">
                  Посмотреть проекты
                </a>
              </div>

              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/45">
                <span className="inline-flex items-center gap-2"><I.Check className="h-4 w-4 text-brand-orange" /> Пошаговый расчёт</span>
                <span className="inline-flex items-center gap-2"><I.Check className="h-4 w-4 text-brand-orange" /> Сохранение параметров</span>
                <span className="inline-flex items-center gap-2"><I.Check className="h-4 w-4 text-brand-orange" /> Прямая связь с менеджером</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute inset-8 rounded-[3rem] bg-linear-to-br from-brand-red/25 to-brand-orange/15 blur-3xl" />
              <div className="relative glass-card overflow-hidden p-4 sm:p-6">
                <div className="flex items-center justify-between border-b border-white/7 pb-4">
                  <div className="flex items-center gap-3">
                    <img src={LOGO_MARK} alt="NCEA" className="h-12 w-12 object-contain" />
                    <div><div className="font-display font-bold">NCEA Project Center</div><div className="text-xs text-white/40">Выберите направление</div></div>
                  </div>
                  <span className="rounded-full bg-brand-orange/10 px-3 py-1 text-[11px] text-brand-orange ring-1 ring-brand-orange/20">ONLINE</span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {featured.slice(0, 4).map((service) => {
                    const Icon = I[service.icon];
                    return (
                      <Link key={service.id} to={service.path} className="group rounded-2xl bg-white/4 p-4 ring-1 ring-white/8 transition hover:-translate-y-1 hover:bg-white/7 hover:ring-brand-orange/35">
                        <div className="flex items-start justify-between gap-3">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-brand-red/20 to-brand-orange/20 text-brand-orange ring-1 ring-white/10"><Icon className="h-5 w-5" /></span>
                          <I.Arrow className="h-4 w-4 text-white/25 transition group-hover:translate-x-1 group-hover:text-brand-orange" />
                        </div>
                        <div className="mt-4 font-display font-bold">{service.title}</div>
                        <div className="mt-1 text-xs text-white/42">От {startingPrice(service)} € · от {service.days[0]} дней</div>
                      </Link>
                    );
                  })}
                </div>

                <Link to="/services" className="mt-4 flex h-12 items-center justify-center gap-2 rounded-2xl bg-white text-sm font-semibold text-black transition hover:bg-brand-orange hover:text-white">
                  Открыть все 12 услуг <I.Arrow className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Статистика" className="border-y border-white/5 bg-white/[.015] py-8">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 lg:grid-cols-4 lg:px-8">
            {stats.map((item) => (
              <div key={item.label} className="rounded-2xl p-5 ring-1 ring-white/7">
                <div className="font-display text-3xl font-black gradient-text">{item.value}</div>
                <div className="mt-1 font-medium">{item.label}</div>
                <div className="mt-1 text-xs text-white/38">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="mx-auto max-w-7xl px-4 py-24 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[.22em] text-brand-orange">Почему NCEA</div>
              <h2 className="mt-4 font-display text-4xl font-black sm:text-5xl">Не просто исполнитель, а команда проекта</h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-white/52">Мы объединяем техническую разработку, визуальное оформление и организацию событий. Это позволяет не собирать подрядчиков по отдельности и сохранять единый стиль проекта.</p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ["01", "Понятная конфигурация", "До общения с менеджером вы уже выбираете ключевые параметры, видите ориентировочную цену и срок."],
              ["02", "Единая дизайн-система", "Сайт, логотип, Discord, Telegram и игровые элементы могут выглядеть как части одного бренда."],
              ["03", "Техническая документация", "Для сложных проектов можно заказать инструкции, исходники и поддержку после сдачи."],
            ].map(([num, title, desc]) => (
              <article key={num} className="glass-card p-7 hover-scale">
                <div className="font-display text-sm font-bold text-brand-orange">{num}</div>
                <h3 className="mt-8 font-display text-xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/48">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="services-preview" className="bg-white/[.018] py-24">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div><div className="text-xs font-semibold uppercase tracking-[.22em] text-brand-orange">Популярные направления</div><h2 className="mt-4 font-display text-4xl font-black sm:text-5xl">Начните с нужной услуги</h2></div>
              <Link to="/services" className="inline-flex items-center gap-2 text-sm font-medium text-brand-orange">Все 12 услуг <I.Arrow className="h-4 w-4" /></Link>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featured.map((service, index) => {
                const Icon = I[service.icon];
                return (
                  <article key={service.id} className="group glass-card flex min-h-[280px] flex-col p-6 transition duration-300 hover:-translate-y-1 hover:ring-brand-orange/30">
                    <div className="flex items-start justify-between">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-brand-red/20 to-brand-orange/20 text-brand-orange ring-1 ring-white/10"><Icon className="h-6 w-6" /></span>
                      {index < 2 && <span className="rounded-full bg-brand-orange/10 px-3 py-1 text-[10px] uppercase tracking-wider text-brand-orange ring-1 ring-brand-orange/20">Популярно</span>}
                    </div>
                    <h3 className="mt-6 font-display text-xl font-bold">{service.title}</h3>
                    <p className="mt-3 flex-1 text-sm leading-6 text-white/47">{service.short}</p>
                    <div className="mt-6 flex items-center justify-between text-sm"><span>От <b className="gradient-text">{startingPrice(service)} €</b></span><span className="text-white/38">от {service.days[0]} дней</span></div>
                    <Link to={service.path} className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-full ring-1 ring-white/13 transition hover:bg-white hover:text-black">Настроить заказ <I.Arrow className="h-4 w-4" /></Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="portfolio" className="mx-auto max-w-7xl px-4 py-24 lg:px-8">
          <div className="max-w-2xl"><div className="text-xs font-semibold uppercase tracking-[.22em] text-brand-orange">Портфолио направлений</div><h2 className="mt-4 font-display text-4xl font-black sm:text-5xl">Что может получить ваш проект</h2><p className="mt-4 text-white/50">Примеры комплексных решений, которые можно собрать из услуг NCEA.</p></div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {portfolio.map((item) => {
              const Icon = I[item.icon];
              return (
                <article key={item.title} className="group relative min-h-[300px] overflow-hidden rounded-[2rem] border border-white/8 bg-linear-to-br from-white/7 to-white/[.015] p-8">
                  <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-brand-orange/10 blur-3xl transition group-hover:bg-brand-red/18" />
                  <div className="relative flex h-full flex-col">
                    <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-950/60 text-brand-orange ring-1 ring-white/12"><Icon className="h-7 w-7" /></span>
                    <div className="mt-auto pt-14 text-xs uppercase tracking-[.2em] text-brand-orange">{item.tag}</div>
                    <h3 className="mt-3 font-display text-2xl font-bold">{item.title}</h3>
                    <p className="mt-3 max-w-md text-sm leading-6 text-white/48">{item.desc}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="team" className="bg-white/[.018] py-24">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="text-center"><div className="text-xs font-semibold uppercase tracking-[.22em] text-brand-orange">Отзывы</div><h2 className="mt-4 font-display text-4xl font-black sm:text-5xl">Проекты говорят результатом</h2></div>
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {reviews.map((review) => (
                <article key={review.role} className="glass-card p-7">
                  <div className="text-brand-orange tracking-[.18em]">★★★★★</div>
                  <p className="mt-5 min-h-28 text-sm leading-6 text-white/58">«{review.text}»</p>
                  <div className="mt-6 border-t border-white/7 pt-5"><div className="font-medium">{review.name}</div><div className="mt-1 text-xs text-white/38">{review.role}</div></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto grid max-w-7xl gap-10 px-4 py-24 lg:grid-cols-[.75fr_1.25fr] lg:px-8">
          <div><div className="text-xs font-semibold uppercase tracking-[.22em] text-brand-orange">FAQ</div><h2 className="mt-4 font-display text-4xl font-black sm:text-5xl">Ответы перед заказом</h2><p className="mt-5 max-w-md text-sm leading-6 text-white/48">Не нашли нужный ответ — напишите менеджеру напрямую в Telegram или Discord.</p></div>
          <div className="flex flex-col gap-3">
            {faq.map(([question, answer], index) => {
              const opened = openedFaq === index;
              return (
                <article key={question} className="rounded-2xl bg-white/3 ring-1 ring-white/8">
                  <button onClick={() => setOpenedFaq(opened ? null : index)} aria-expanded={opened} className="flex w-full items-center justify-between gap-4 p-5 text-left font-medium">
                    {question}<I.Chevron className={`h-5 w-5 shrink-0 transition ${opened ? "rotate-180 text-brand-orange" : "text-white/35"}`} />
                  </button>
                  {opened && <p className="px-5 pb-5 text-sm leading-6 text-white/48 fade-up">{answer}</p>}
                </article>
              );
            })}
          </div>
        </section>

        <section id="partner" className="px-4 pb-24 lg:px-8">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-brand-orange/20 bg-linear-to-br from-brand-red/18 via-white/5 to-brand-orange/12 px-6 py-14 text-center sm:px-10 sm:py-20">
            <div className="absolute inset-0 noise opacity-30" />
            <div className="relative mx-auto max-w-3xl">
              <img src={LOGO_MARK} alt="NCEA" className="mx-auto h-20 w-20 object-contain" />
              <h2 className="mt-6 font-display text-4xl font-black sm:text-5xl">Готовы собрать ваш проект?</h2>
              <p className="mx-auto mt-5 max-w-2xl text-white/55">Выберите услугу, настройте параметры и отправьте готовую заявку. Для комплексного заказа свяжитесь с менеджером напрямую.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/services" className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 font-semibold text-black transition hover:bg-brand-orange hover:text-white">Рассчитать проект <I.Arrow className="h-4 w-4" /></Link>
                <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center gap-2 rounded-full px-6 ring-1 ring-white/18 transition hover:bg-white hover:text-black"><I.Telegram className="h-5 w-5" /> Telegram</a>
                <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center gap-2 rounded-full px-6 ring-1 ring-white/18 transition hover:bg-white hover:text-black"><I.Discord className="h-5 w-5" /> Discord</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
