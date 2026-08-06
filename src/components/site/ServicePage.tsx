import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { I, Blob, LOGO_MARK } from "@/components/site/ui";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { computeQuote, defaultValues, formatEUR, getService, type Values } from "@/lib/services";

const TELEGRAM_URL = "https://t.me/lisiy_bob";
const DISCORD_URL = "https://discord.gg/u73vDgBMAn";

function Breadcrumbs({ title }: { title: string }) {
  return (
    <nav aria-label="Хлебные крошки" className="flex flex-wrap items-center gap-2 text-xs text-white/45">
      <Link to="/" className="hover:text-white transition">Главная</Link>
      <span aria-hidden="true">→</span>
      <Link to="/services" className="hover:text-white transition">Услуги</Link>
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
  const [sent, setSent] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [form, setForm] = useState({ name: "", tg: "", ds: "", email: "", note: "", refs: "", agree: false });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setValues({ ...defaultValues(service), ...JSON.parse(raw) });
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [id, service, storageKey]);

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(values)); } catch { /* storage may be unavailable */ }
  }, [values, storageKey]);

  const quote = useMemo(() => computeQuote(service, values), [service, values]);
  const totalSteps = service.steps.length + 2;
  const current = service.steps[step];
  const isSummary = step === service.steps.length;
  const isForm = step === service.steps.length + 1;

  const set = (key: string, value: string | number | boolean) => setValues((prev) => ({ ...prev, [key]: value }));

  const reset = () => {
    setValues(defaultValues(service));
    setStep(0);
    setSent(false);
    setAttachment(null);
    localStorage.removeItem(storageKey);
    toast("Параметры сброшены");
  };

  const applicationText = useMemo(() => {
    const params = quote.lines.map((line) => `• ${line.label}: ${line.value}`).join("\n");
    return [
      "Новая заявка NCEA",
      `Услуга: ${service.title}`,
      `Имя/ник: ${form.name || "не указано"}`,
      `Telegram: ${form.tg || "не указан"}`,
      `Discord: ${form.ds || "не указан"}`,
      `Email: ${form.email || "не указан"}`,
      "",
      "Параметры:",
      params,
      "",
      `Предварительная стоимость: ${formatEUR(quote.total)}`,
      `Срок выполнения: ${quote.daysMin}–${quote.daysMax} дней`,
      form.note ? `Описание: ${form.note}` : "",
      form.refs ? `ТЗ/референсы: ${form.refs}` : "",
      attachment ? `Прикреплённый файл: ${attachment.name} (передать менеджеру отдельно)` : "",
    ].filter(Boolean).join("\n");
  }, [attachment, form, quote, service.title]);

  const submit = () => {
    if (!form.name.trim()) return toast.error("Укажите имя или ник");
    if (!form.tg.trim() && !form.ds.trim() && !form.email.trim()) return toast.error("Укажите хотя бы один способ связи");
    if (!form.agree) return toast.error("Подтвердите согласие на обработку данных");

    setSent(true);
    toast.success("Заявка успешно сформирована. Представитель NCEA свяжется с вами для уточнения деталей.");
    window.open(`https://t.me/share/url?url=${encodeURIComponent(location.href)}&text=${encodeURIComponent(applicationText)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative min-h-screen bg-stone-950 text-white overflow-x-hidden">
      <div className="noise fixed inset-0 opacity-40 pointer-events-none z-0" />
      <SiteHeader />
      <main className="relative z-10 pt-28 pb-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Breadcrumbs title={service.title} />
          <div className="mt-6 flex items-start gap-4">
            <span className="inline-flex w-12 h-12 items-center justify-center rounded-2xl bg-linear-to-br from-brand-red/20 to-brand-orange/20 ring-1 ring-white/10 text-brand-orange">
              {(() => { const Icon = I[service.icon]; return <Icon className="w-6 h-6" />; })()}
            </span>
            <div>
              <h1 className="font-display font-extrabold text-3xl lg:text-5xl leading-tight">{service.title}</h1>
              <p className="mt-3 text-white/55 max-w-2xl">{service.desc}</p>
            </div>
          </div>

          <div className="mt-10 grid lg:grid-cols-[1fr_360px] gap-6 items-start">
            <section className="glass-card p-6 lg:p-8 relative overflow-hidden" aria-label={`Конфигуратор: ${service.title}`}>
              <Blob className="bg-brand-red/15 w-[320px] h-[320px] -top-32 -right-24" />
              <div className="relative">
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span>Шаг {step + 1} из {totalSteps}</span>
                  <button onClick={reset} className="hover:text-white transition">Сбросить параметры</button>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-white/8 overflow-hidden" role="progressbar" aria-valuemin={1} aria-valuemax={totalSteps} aria-valuenow={step + 1}>
                  <div className="h-full bg-linear-to-r from-brand-red to-brand-orange transition-all duration-500" style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
                </div>

                {current && (
                  <div key={step} className="mt-8 fade-up">
                    <h2 className="font-display font-bold text-2xl">{current.title}</h2>
                    {current.desc && <p className="mt-1 text-white/50 text-sm">{current.desc}</p>}
                    <div className="mt-6 flex flex-col gap-6">
                      {current.fields.map((field) => (
                        <div key={field.id}>
                          {field.type === "select" && (
                            <>
                              <div className="text-sm font-medium">{field.label}</div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {field.options.map((option) => (
                                  <button key={option.id} type="button" onClick={() => set(field.id, option.id)} aria-pressed={values[field.id] === option.id} className={`px-4 min-h-10 rounded-full text-sm transition ring-1 ${values[field.id] === option.id ? "bg-linear-to-r from-brand-red to-brand-orange text-white ring-transparent" : "bg-white/3 ring-white/10 text-white/70 hover:text-white hover:ring-white/25"}`}>
                                    {option.label}{option.note ? ` · ${option.note}` : ""}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                          {field.type === "toggle" && (
                            <button type="button" onClick={() => set(field.id, !values[field.id])} aria-pressed={Boolean(values[field.id])} className={`w-full flex items-center justify-between gap-4 px-4 py-3.5 rounded-2xl ring-1 transition text-left ${values[field.id] ? "bg-white/6 ring-brand-orange/50" : "bg-white/3 ring-white/10 hover:ring-white/25"}`}>
                              <span><span className="block text-sm font-medium">{field.label}</span>{field.desc && <span className="block text-xs text-white/45 mt-0.5">{field.desc}</span>}</span>
                              <span className="flex items-center gap-3 shrink-0">
                                {typeof field.price === "number" && field.price !== 0 && <span className="text-xs text-white/50">{field.price > 0 ? "+" : ""}{field.price} €</span>}
                                <span className={`inline-flex w-6 h-6 items-center justify-center rounded-lg ring-1 ${values[field.id] ? "bg-linear-to-br from-brand-red to-brand-orange ring-transparent" : "ring-white/20"}`}>{values[field.id] && <I.Check className="w-3.5 h-3.5" />}</span>
                              </span>
                            </button>
                          )}
                          {field.type === "number" && (
                            <>
                              <div className="flex items-center justify-between text-sm"><span className="font-medium">{field.label}</span><span className="text-brand-orange font-display font-bold">{values[field.id]} {field.unit}</span></div>
                              <input type="range" aria-label={field.label} className="brand-range w-full mt-3" min={field.min} max={field.max} step={field.step} value={Number(values[field.id])} onChange={(event) => set(field.id, Number(event.target.value))} />
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
                    <h2 className="font-display font-bold text-2xl">Итоговый расчёт</h2>
                    <div className="mt-5 flex flex-col divide-y divide-white/5">
                      {quote.lines.map((line, index) => (
                        <div key={`${line.label}-${index}`} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                          <span className="text-white/55">{line.label}</span>
                          <span className="text-right"><span className="text-white/90">{line.value}</span>{line.amount ? <span className="ml-2 text-white/45">{line.amount > 0 ? "+" : ""}{line.amount} €</span> : null}{line.mult ? <span className="ml-2 text-brand-orange">×{line.mult}</span> : null}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 rounded-2xl bg-white/4 ring-1 ring-white/10 p-5 text-sm">
                      <Row label="Базовая стоимость" value={formatEUR(quote.base)} />
                      <Row label="Дополнительные функции" value={formatEUR(quote.addons)} />
                      <Row label="Коэффициенты" value={`${quote.multPct >= 0 ? "+" : ""}${quote.multPct}%`} />
                      <div className="mt-4 pt-4 border-t border-white/10 flex items-end justify-between gap-4"><span className="text-white/60">Предварительная стоимость</span><span className="font-display font-black text-3xl gradient-text">{formatEUR(quote.total)}</span></div>
                      <div className="mt-2 text-white/50">Срок выполнения: {quote.daysMin}–{quote.daysMax} дней</div>
                    </div>
                    <p className="mt-4 text-xs text-white/45">Итоговая стоимость является предварительной и может быть уточнена после обсуждения проекта с менеджером NCEA.</p>
                  </div>
                )}

                {isForm && (
                  <div className="mt-8 fade-up">
                    <h2 className="font-display font-bold text-2xl">Отправка заявки</h2>
                    {sent ? (
                      <div className="mt-6 rounded-2xl ring-1 ring-brand-orange/40 bg-white/4 p-6 text-center">
                        <img src={LOGO_MARK} alt="NCEA" className="w-20 h-20 mx-auto object-contain" />
                        <div className="mt-4 font-display font-bold text-xl">Заявка успешно сформирована</div>
                        <p className="mt-2 text-white/55 text-sm">Отправьте сформированное сообщение менеджеру NCEA в Telegram или перейдите в Discord.</p>
                        <div className="mt-5 flex flex-wrap justify-center gap-2">
                          <a href={`https://t.me/share/url?url=${encodeURIComponent(location.href)}&text=${encodeURIComponent(applicationText)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 h-11 px-5 rounded-full gradient-btn text-sm font-medium"><I.Telegram className="w-4 h-4" /> Отправить в Telegram</a>
                          <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 h-11 px-5 rounded-full ring-1 ring-white/15 text-sm hover:bg-white hover:text-black transition"><I.Discord className="w-4 h-4" /> Перейти в Discord</a>
                          <Link to="/services" className="inline-flex items-center gap-2 h-11 px-5 rounded-full ring-1 ring-white/15 text-sm hover:bg-white hover:text-black transition">К услугам</Link>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 grid sm:grid-cols-2 gap-3">
                        <Input label="Имя или ник" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
                        <Input label="Telegram" value={form.tg} onChange={(value) => setForm({ ...form, tg: value })} placeholder="@username" />
                        <Input label="Discord" value={form.ds} onChange={(value) => setForm({ ...form, ds: value })} placeholder="@username" />
                        <Input label="Email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} placeholder="mail@example.com" type="email" />
                        <div className="sm:col-span-2"><Input label="Описание заказа" value={form.note} onChange={(value) => setForm({ ...form, note: value })} textarea /></div>
                        <div className="sm:col-span-2"><Input label="Ссылка на ТЗ или референсы" value={form.refs} onChange={(value) => setForm({ ...form, refs: value })} placeholder="https://…" type="url" /></div>
                        <label className="sm:col-span-2 block rounded-2xl bg-white/3 ring-1 ring-white/10 p-4 text-sm cursor-pointer hover:ring-white/25 transition">
                          <span className="block text-white/70">Прикрепить ТЗ или референсы</span>
                          <span className="mt-1 block text-xs text-white/40">PDF, DOCX, ZIP, PNG или JPG — до 15 МБ</span>
                          <input type="file" className="mt-3 block w-full text-xs text-white/55 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white" accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg" onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;
                            if (file && file.size > 15 * 1024 * 1024) { toast.error("Файл должен быть не больше 15 МБ"); event.target.value = ""; return; }
                            setAttachment(file);
                          }} />
                          {attachment && <span className="mt-2 block text-xs text-brand-orange">Выбран файл: {attachment.name}</span>}
                        </label>
                        <div className="sm:col-span-2 rounded-2xl bg-white/3 ring-1 ring-white/10 p-4 text-sm text-white/60">
                          <div className="font-medium text-white/80">В заявку подставлено автоматически</div>
                          <div className="mt-2">Услуга: {service.title}</div><div>Параметры: {quote.lines.length} шт.</div><div>Предварительная стоимость: {formatEUR(quote.total)}</div><div>Срок: {quote.daysMin}–{quote.daysMax} дней</div>
                        </div>
                        <label className="sm:col-span-2 flex items-start gap-3 text-sm text-white/60"><input type="checkbox" checked={form.agree} onChange={(event) => setForm({ ...form, agree: event.target.checked })} className="mt-1 accent-[#ff4d4d]" />Согласен на обработку персональных данных.</label>
                        <div className="sm:col-span-2 flex flex-wrap gap-2">
                          <button onClick={submit} className="inline-flex items-center gap-2 h-12 px-6 rounded-full gradient-btn font-medium">Отправить заявку <I.Arrow className="w-4 h-4" /></button>
                          <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 h-12 px-6 rounded-full ring-1 ring-white/15 hover:bg-white hover:text-black transition"><I.Telegram className="w-4 h-4" /> Написать в Telegram</a>
                          <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 h-12 px-6 rounded-full ring-1 ring-white/15 hover:bg-white hover:text-black transition"><I.Discord className="w-4 h-4" /> Перейти в Discord</a>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!sent && (
                  <div className="mt-8 flex items-center justify-between gap-3">
                    <button onClick={() => setStep((currentStep) => Math.max(0, currentStep - 1))} disabled={step === 0} className="inline-flex items-center gap-2 h-12 px-5 rounded-full ring-1 ring-white/15 text-white/80 disabled:opacity-30 hover:bg-white hover:text-black transition"><I.ArrowLeft className="w-4 h-4" /> Назад</button>
                    {step < totalSteps - 1 && <button onClick={() => setStep((currentStep) => currentStep + 1)} className="inline-flex items-center gap-2 h-12 px-6 rounded-full gradient-btn font-medium">{step === service.steps.length - 1 ? "Рассчитать" : step === service.steps.length ? "Оформить заявку" : "Продолжить"} <I.Arrow className="w-4 h-4" /></button>}
                  </div>
                )}
              </div>
            </section>

            <aside className="lg:sticky lg:top-24 glass-card p-6">
              <div className="text-[11px] tracking-widest uppercase text-white/40">Предварительно</div>
              <div className="mt-2 font-display font-black text-4xl gradient-text transition-all duration-300">{formatEUR(quote.total)}</div>
              <div className="mt-1 text-sm text-white/50">Срок: {quote.daysMin}–{quote.daysMax} дней</div>
              <div className="mt-5 flex flex-col gap-1.5 text-sm"><Row label="База" value={formatEUR(quote.base)} /><Row label="Опции" value={formatEUR(quote.addons)} /><Row label="Коэффициенты" value={`${quote.multPct >= 0 ? "+" : ""}${quote.multPct}%`} /></div>
              <button onClick={() => setStep(service.steps.length)} className="mt-6 w-full inline-flex items-center justify-center gap-2 h-12 rounded-full gradient-btn font-medium">К расчёту</button>
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
  return <div className="flex items-center justify-between gap-4"><span className="text-white/50">{label}</span><span className="text-white/90 text-right">{value}</span></div>;
}

function Input({ label, value, onChange, placeholder, textarea, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; textarea?: boolean; type?: string; required?: boolean }) {
  const className = "mt-1.5 w-full rounded-2xl bg-white/5 ring-1 ring-white/10 focus:ring-brand-orange/50 outline-none px-4 py-3 text-sm text-white placeholder:text-white/35 transition";
  return (
    <label className="block text-sm"><span className="text-white/60">{label}{required && <span className="text-brand-orange"> *</span>}</span>{textarea ? <textarea rows={4} value={value} placeholder={placeholder} required={required} onChange={(event) => onChange(event.target.value)} className={className} /> : <input type={type} value={value} placeholder={placeholder} required={required} onChange={(event) => onChange(event.target.value)} className={className} />}</label>
  );
}
