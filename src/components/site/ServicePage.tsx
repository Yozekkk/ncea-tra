import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { I, Blob, LOGO_ROUND } from "@/components/site/ui";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { computeQuote, defaultValues, formatEUR, getService, type Values } from "@/lib/services";

const TELEGRAM_URL = "https://t.me/lisiy_bob";
const DISCORD_URL = "https://discord.gg/u73vDgBMAn";

function Breadcrumbs({ title }: { title: string }) {
  return (
    <nav aria-label="Хлебные крошки" className="flex flex-wrap items-center gap-2 text-xs text-white/45">
      <Link to="/" className="transition hover:text-white">Главная</Link>
      <span aria-hidden="true">→</span>
      <Link to="/services" className="transition hover:text-white">Услуги</Link>
      <span aria-hidden="true">→</span>
      <span className="text-white/80" aria-current="page">{title}</span>
    </nav>
  );
}

export function ServicePage({ id }: { id: string }) {
  const service = getService(id);
  const storageKey = `ncea:cfg:${id}`;
  const [values, setValues] = useState<Values>(() => defaultValues(service));
  const [step, setStep] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setValues({ ...defaultValues(service), ...JSON.parse(raw) });
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [service, storageKey]);

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(values)); } catch { /* localStorage may be unavailable */ }
  }, [values, storageKey]);

  const quote = useMemo(() => computeQuote(service, values), [service, values]);
  const totalSteps = service.steps.length + 2;
  const current = service.steps[step];
  const isSummary = step === service.steps.length;
  const isCheckout = step === service.steps.length + 1;

  const set = (key: string, value: string | number | boolean) => setValues((previous) => ({ ...previous, [key]: value }));

  const reset = () => {
    setValues(defaultValues(service));
    setStep(0);
    localStorage.removeItem(storageKey);
    toast("Параметры сброшены");
  };

  const applicationText = useMemo(() => {
    const params = quote.lines.map((line) => `• ${line.label}: ${line.value}`).join("\n");
    return [
      "Новая заявка NCEA",
      `Услуга: ${service.title}`,
      "",
      "Выбранные параметры:",
      params,
      "",
      `Предварительная стоимость: ${formatEUR(quote.total)}`,
      `Срок выполнения: ${quote.daysMin}–${quote.daysMax} дней`,
      "",
      "Итоговая стоимость уточняется после обсуждения проекта.",
    ].join("\n");
  }, [quote, service.title]);

  const pageUrl = typeof window === "undefined" ? "https://ncea-tra.vercel.app" : window.location.href;
  const telegramShare = `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(applicationText)}`;

  const goTo = (nextStep: number) => {
    setStep(Math.max(0, Math.min(totalSteps - 1, nextStep)));
    window.requestAnimationFrame(() => window.scrollTo({ top: 120, behavior: "smooth" }));
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-stone-950 text-white">
      <div className="noise fixed inset-0 z-0 opacity-35 pointer-events-none" />
      <div className="liquid-orb liquid-orb-a" />
      <div className="liquid-orb liquid-orb-b" />
      <SiteHeader />
      <main className="relative z-10 pb-28 pt-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Breadcrumbs title={service.title} />
          <div className="mt-6 flex items-start gap-4">
            <span className="liquid-icon inline-flex h-12 w-12 shrink-0 items-center justify-center text-brand-orange">
              {(() => { const Icon = I[service.icon]; return <Icon className="h-6 w-6" />; })()}
            </span>
            <div>
              <h1 className="font-display text-3xl font-extrabold leading-tight lg:text-5xl">{service.title}</h1>
              <p className="mt-3 max-w-2xl text-white/55">{service.desc}</p>
            </div>
          </div>

          <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
            <section className="liquid-panel relative overflow-hidden p-5 sm:p-7 lg:p-8" aria-label={`Конфигуратор: ${service.title}`}>
              <Blob className="-right-24 -top-32 h-[320px] w-[320px] bg-brand-red/15" />
              <div className="relative">
                <div className="flex items-center justify-between gap-3 text-xs text-white/50">
                  <span>Шаг {step + 1} из {totalSteps}</span>
                  <button type="button" onClick={reset} className="transition hover:text-white">Сбросить параметры</button>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8" role="progressbar" aria-valuemin={1} aria-valuemax={totalSteps} aria-valuenow={step + 1}>
                  <div className="h-full bg-linear-to-r from-brand-red to-brand-orange transition-all duration-500" style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
                </div>

                {current && (
                  <div key={step} className="mt-8 fade-up">
                    <h2 className="font-display text-2xl font-bold">{current.title}</h2>
                    {current.desc && <p className="mt-1 text-sm text-white/50">{current.desc}</p>}
                    <div className="mt-6 flex flex-col gap-6">
                      {current.fields.map((field) => (
                        <div key={field.id}>
                          {field.type === "select" && (
                            <>
                              <div className="text-sm font-medium">{field.label}</div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {field.options.map((option) => (
                                  <button key={option.id} type="button" onClick={() => set(field.id, option.id)} aria-pressed={values[field.id] === option.id} className={`liquid-choice px-4 py-2.5 text-sm ${values[field.id] === option.id ? "is-active" : ""}`}>
                                    {option.label}{option.note ? ` · ${option.note}` : ""}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}

                          {field.type === "toggle" && (
                            <button type="button" onClick={() => set(field.id, !values[field.id])} aria-pressed={Boolean(values[field.id])} className={`liquid-toggle w-full ${values[field.id] ? "is-active" : ""}`}>
                              <span className="text-left"><span className="block text-sm font-medium">{field.label}</span>{field.desc && <span className="mt-0.5 block text-xs text-white/45">{field.desc}</span>}</span>
                              <span className="flex shrink-0 items-center gap-3">
                                {typeof field.price === "number" && field.price !== 0 && <span className="text-xs text-white/50">{field.price > 0 ? "+" : ""}{field.price} €</span>}
                                <span className="liquid-check">{values[field.id] && <I.Check className="h-3.5 w-3.5" />}</span>
                              </span>
                            </button>
                          )}

                          {field.type === "number" && (
                            <>
                              <div className="flex items-center justify-between gap-4 text-sm"><span className="font-medium">{field.label}</span><span className="font-display font-bold text-brand-orange">{values[field.id]} {field.unit}</span></div>
                              <input type="range" aria-label={field.label} className="brand-range mt-3 w-full" min={field.min} max={field.max} step={field.step} value={Number(values[field.id])} onChange={(event) => set(field.id, Number(event.target.value))} />
                              <div className="mt-1 flex justify-between text-[11px] text-white/35"><span>{field.min} {field.unit}</span><span>{field.max} {field.unit}</span></div>
                            </>
                          )}

                          {field.type === "text" && <Input label={field.label} value={String(values[field.id] ?? "")} onChange={(value) => set(field.id, value)} placeholder={field.placeholder} />}
                          {field.type === "textarea" && <Input label={field.label} value={String(values[field.id] ?? "")} onChange={(value) => set(field.id, value)} placeholder={field.placeholder} textarea />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isSummary && (
                  <div className="mt-8 fade-up">
                    <h2 className="font-display text-2xl font-bold">Итоговый расчёт</h2>
                    <div className="mt-5 flex flex-col divide-y divide-white/7">
                      {quote.lines.map((line, index) => (
                        <div key={`${line.label}-${index}`} className="flex items-center justify-between gap-4 py-3 text-sm">
                          <span className="text-white/55">{line.label}</span>
                          <span className="text-right"><span className="text-white/90">{line.value}</span>{line.amount ? <span className="ml-2 text-white/45">{line.amount > 0 ? "+" : ""}{line.amount} €</span> : null}{line.mult ? <span className="ml-2 text-brand-orange">×{line.mult}</span> : null}</span>
                        </div>
                      ))}
                    </div>
                    <div className="liquid-summary mt-6 p-5 text-sm">
                      <Row label="Базовая стоимость" value={formatEUR(quote.base)} />
                      <Row label="Дополнительные функции" value={formatEUR(quote.addons)} />
                      <Row label="Коэффициенты" value={`${quote.multPct >= 0 ? "+" : ""}${quote.multPct}%`} />
                      <div className="mt-4 flex items-end justify-between gap-4 border-t border-white/10 pt-4"><span className="text-white/60">Предварительная стоимость</span><span className="gradient-text font-display text-3xl font-black">{formatEUR(quote.total)}</span></div>
                      <div className="mt-2 text-white/50">Срок выполнения: {quote.daysMin}–{quote.daysMax} дней</div>
                    </div>
                    <p className="mt-4 text-xs text-white/45">Цена предварительная и уточняется после обсуждения проекта с менеджером NCEA.</p>
                  </div>
                )}

                {isCheckout && (
                  <div className="mt-8 fade-up text-center">
                    <img src={LOGO_ROUND} alt="NCEA" width={96} height={96} className="mx-auto h-24 w-24 rounded-full object-cover shadow-[0_14px_45px_rgba(255,90,45,.3)]" />
                    <h2 className="mt-5 font-display text-3xl font-bold">Свяжитесь с менеджером</h2>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/55">Параметры заказа уже собраны. Выберите удобный мессенджер — в Telegram откроется готовый текст заявки, а в Discord вы попадёте на сервер NCEA.</p>
                    <div className="mt-7 grid gap-3 sm:grid-cols-2">
                      <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="liquid-contact liquid-contact-discord"><I.Discord className="h-7 w-7" /><span><b>Написать в Discord</b><small>Открыть сервер NCEA</small></span></a>
                      <a href={telegramShare} target="_blank" rel="noreferrer" className="liquid-contact liquid-contact-telegram"><I.Telegram className="h-7 w-7" /><span><b>Написать в Telegram</b><small>Отправить готовую заявку</small></span></a>
                    </div>
                    <div className="liquid-summary mt-6 p-5 text-left text-sm"><Row label="Услуга" value={service.title} /><Row label="Стоимость" value={formatEUR(quote.total)} /><Row label="Срок" value={`${quote.daysMin}–${quote.daysMax} дней`} /></div>
                  </div>
                )}

                <div className="mt-8 flex items-center justify-between gap-3">
                  <button type="button" onClick={() => goTo(step - 1)} disabled={step === 0} className="liquid-secondary inline-flex h-12 items-center gap-2 px-5 disabled:opacity-30"><I.ArrowLeft className="h-4 w-4" /> Назад</button>
                  {step < totalSteps - 1 && <button type="button" onClick={() => goTo(step + 1)} className="gradient-btn inline-flex h-12 items-center gap-2 rounded-full px-6 font-medium">{step === service.steps.length - 1 ? "Рассчитать" : step === service.steps.length ? "Перейти к связи" : "Продолжить"}<I.Arrow className="h-4 w-4" /></button>}
                </div>
              </div>
            </section>

            <aside className="liquid-panel p-6 lg:sticky lg:top-24">
              <div className="text-[11px] uppercase tracking-widest text-white/40">Предварительно</div>
              <div className="gradient-text mt-2 font-display text-4xl font-black">{formatEUR(quote.total)}</div>
              <div className="mt-1 text-sm text-white/50">Срок: {quote.daysMin}–{quote.daysMax} дней</div>
              <div className="mt-5 flex flex-col gap-2 text-sm"><Row label="База" value={formatEUR(quote.base)} /><Row label="Опции" value={formatEUR(quote.addons)} /><Row label="Коэффициенты" value={`${quote.multPct >= 0 ? "+" : ""}${quote.multPct}%`} /></div>
              <button type="button" onClick={() => goTo(service.steps.length)} className="gradient-btn mt-6 h-12 w-full rounded-full font-medium">К расчёту</button>
              <p className="mt-3 text-[11px] text-white/40">Стоимость предварительная и уточняется с менеджером NCEA.</p>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4"><span className="text-white/50">{label}</span><span className="text-right text-white/90">{value}</span></div>;
}

function Input({ label, value, onChange, placeholder, textarea }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; textarea?: boolean }) {
  const className = "liquid-input mt-1.5 w-full px-4 py-3 text-sm text-white outline-none placeholder:text-white/30";
  return <label className="block text-sm"><span className="text-white/60">{label}</span>{textarea ? <textarea rows={4} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className={className} /> : <input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className={className} />}</label>;
}
