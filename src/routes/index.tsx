import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Swords, Pickaxe, BookOpen, Shield, Gift, Drama,
  MessageSquare, Mail, Copy, Check, Sparkles, Compass,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NovaCraft Event Agency — Ивенты на Minecraft-сервере ТРА" },
      { name: "description", content: "NCEA организует турниры, конкурсы и тематические события на собственном Minecraft-сервере в губернии Нова-Люминис вселенной ТРА." },
    ],
  }),
  component: Page,
});

const DISCORD_INVITE = "https://discord.gg/novacraft";
const DISCORD_TAG = "@yozekkk";
const SLOGAN = "Создаём события, которые делают игру интереснее.";

const NAV = [
  { id: "about", label: "О НАС" },
  { id: "events", label: "ИВЕНТЫ" },
  { id: "partners", label: "ПАРТНЁРЫ" },
  { id: "team", label: "КОМАНДА" },
  { id: "contact", label: "КОНТАКТ" },
];

function FrameTitle({ children }: { children: string }) {
  return (
    <div className="font-mono text-primary neon-text inline-block">
      <div className="text-xs sm:text-sm tracking-widest">╔══ {children} ══╗</div>
    </div>
  );
}

function PixelGrid() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* floating blocks */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-6 h-6 sm:w-10 sm:h-10 opacity-30"
          style={{
            top: `${(i * 13) % 90}%`,
            left: `${(i * 23) % 90}%`,
            background: i % 3 === 0 ? "var(--neon-cyan)" : i % 3 === 1 ? "var(--neon-magenta)" : "var(--neon-gold)",
            boxShadow: "0 0 20px currentColor",
            color: i % 3 === 0 ? "var(--neon-cyan)" : i % 3 === 1 ? "var(--neon-magenta)" : "var(--neon-gold)",
            animation: `float-block ${6 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
            imageRendering: "pixelated",
          }}
        />
      ))}
      {/* scanline */}
      <div
        className="absolute inset-x-0 h-px bg-primary/40"
        style={{ animation: "scan 6s linear infinite", boxShadow: "0 0 12px var(--neon-cyan)" }}
      />
    </div>
  );
}

function TypingSlogan() {
  const [text, setText] = useState("");
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i++;
      setText(SLOGAN.slice(0, i));
      if (i >= SLOGAN.length) clearInterval(t);
    }, 45);
    return () => clearInterval(t);
  }, []);
  return (
    <p className="font-mono text-sm sm:text-base md:text-lg text-foreground/90 blink-caret min-h-[3rem]">
      &gt; {text}
    </p>
  );
}

function CopyTag() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(DISCORD_TAG);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      className="inline-flex items-center gap-2 font-mono text-sm px-3 py-1.5 border border-primary/50 hover:border-primary hover:bg-primary/10 transition-colors text-primary"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {DISCORD_TAG}
      <span className="text-muted-foreground text-xs">{copied ? "скопировано" : "скопировать"}</span>
    </button>
  );
}

function NavBar({ active }: { active: string }) {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/70 border-b border-primary/20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="#top" className="font-pixel text-primary neon-text text-xs sm:text-sm">NCEA</a>
        <ul className="hidden md:flex gap-6 font-mono text-xs tracking-wider">
          {NAV.map((n) => (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                className={`transition-colors ${
                  active === n.id ? "text-primary neon-text" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {active === n.id ? "▸ " : ""}{n.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href={DISCORD_INVITE}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-xs px-3 py-1.5 bg-accent text-accent-foreground hover:opacity-90 transition"
          style={{ boxShadow: "0 0 16px var(--neon-magenta)" }}
        >
          DISCORD
        </a>
      </div>
    </nav>
  );
}

function LoaderOverlay({ done }: { done: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-700 ${
        done ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div style={{ animation: "logo-reveal 1.2s ease-out" }} className="text-center">
        <div className="pixel-border px-8 py-6 sm:px-14 sm:py-10">
          <div className="font-pixel text-3xl sm:text-5xl text-primary neon-text">NCEA</div>
        </div>
        <p className="mt-4 font-mono text-xs text-muted-foreground tracking-widest">LOADING SYSTEM...</p>
      </div>
    </div>
  );
}

const EVENTS = [
  { icon: Swords, title: "PvP-турниры", desc: "Регулярные сражения с призами и таблицами рекордов.", color: "var(--neon-magenta)" },
  { icon: Pickaxe, title: "Строительные конкурсы", desc: "Темы, дедлайны, голосование сообщества.", color: "var(--neon-cyan)" },
  { icon: Compass, title: "Квестовые события", desc: "Сюжетные приключения по миру Нова-Люминис.", color: "var(--neon-gold)" },
  { icon: Shield, title: "Командные соревнования", desc: "Гильдии против гильдий — кооперация и стратегия.", color: "var(--neon-cyan)" },
  { icon: Gift, title: "Сезонные ивенты", desc: "Праздничные активности и эксклюзивные награды.", color: "var(--neon-magenta)" },
  { icon: Drama, title: "Ролевые и сюжетные игры", desc: "Иммерсивные события во вселенной ТРА.", color: "var(--neon-gold)" },
];

const DIRECTIONS = [
  { icon: Swords, label: "PvP" },
  { icon: Pickaxe, label: "Стройка" },
  { icon: BookOpen, label: "Квесты" },
  { icon: Shield, label: "Команды" },
  { icon: Sparkles, label: "Атмосфера" },
];

const TEAM = [
  { role: "Генеральный директор", tag: "@yozekkk" },
  { role: "Руководитель отдела мероприятий", tag: "@yozekkk" },
  { role: "Глава техподдержки", tag: "@yozekkk" },
];

function Page() {
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState("top");

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    NAV.forEach((n) => {
      const el = document.getElementById(n.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const eventsScroll = useRef<HTMLDivElement>(null);

  return (
    <div id="top" className="relative min-h-screen">
      <LoaderOverlay done={loaded} />
      <NavBar active={active} />

      {/* HERO */}
      <header className="relative min-h-screen flex items-center justify-center px-4 pt-20 overflow-hidden">
        <PixelGrid />
        <div className="relative z-10 text-center max-w-3xl fade-up">
          <div className="inline-block pixel-border px-6 py-4 sm:px-10 sm:py-6 mb-6">
            <div className="font-pixel text-4xl sm:text-6xl md:text-7xl text-primary neon-text neon-flicker">
              NCEA
            </div>
          </div>
          <h1 className="font-pixel text-base sm:text-xl md:text-2xl text-foreground mb-2 leading-relaxed">
            NovaCraft <span className="text-accent neon-text">Event</span> Agency
          </h1>
          <p className="font-mono text-xs text-muted-foreground mb-8 tracking-widest">
            [ ТРА · ГУБЕРНИЯ НОВА-ЛЮМИНИС ]
          </p>
          <div className="mb-10 px-4">
            <TypingSlogan />
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#contact"
              className="font-mono text-xs sm:text-sm px-6 py-3 bg-primary text-primary-foreground font-bold hover:opacity-90 transition tracking-widest"
              style={{ boxShadow: "0 0 24px var(--neon-cyan)" }}
            >
              ▸ СВЯЗАТЬСЯ С НАМИ
            </a>
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs sm:text-sm px-6 py-3 border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition tracking-widest"
              style={{ boxShadow: "0 0 18px var(--neon-magenta)" }}
            >
              ▸ ДИСКОРД-СЕРВЕР
            </a>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-xs text-muted-foreground animate-pulse">
          ▼ scroll
        </div>
      </header>

      {/* ABOUT */}
      <section id="about" className="relative py-24 px-4 max-w-5xl mx-auto">
        <div className="mb-10 fade-up"><FrameTitle>О НАС</FrameTitle></div>
        <div className="pixel-border bg-card/50 p-6 sm:p-10 fade-up">
          <p className="font-sans text-base sm:text-lg text-foreground/90 leading-relaxed mb-8">
            <span className="text-primary neon-text font-mono">NCEA</span> — ивент-агентство и оператор игрового сервера.
            Мы создаём комфортную среду, проводим регулярные турниры, конкурсы и тематические события,
            поддерживаем честную и конкурентную атмосферу. Наша цель —
            <span className="text-accent"> развитие игрового сообщества ТРА</span>.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {DIRECTIONS.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="group flex flex-col items-center gap-2 p-4 border border-primary/30 bg-background/60 hover:border-primary hover:bg-primary/5 transition"
              >
                <Icon className="w-7 h-7 text-primary group-hover:text-accent transition" style={{ filter: "drop-shadow(0 0 6px currentColor)" }} />
                <span className="font-mono text-[10px] sm:text-xs text-muted-foreground tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTS */}
      <section id="events" className="relative py-24 px-4 max-w-6xl mx-auto">
        <div className="mb-10 flex items-end justify-between flex-wrap gap-4">
          <FrameTitle>ИВЕНТЫ</FrameTitle>
          <button
            disabled
            className="font-mono text-xs px-4 py-2 border border-muted-foreground/40 text-muted-foreground cursor-not-allowed opacity-60"
            title="Скоро"
          >
            РАСПИСАНИЕ [SOON]
          </button>
        </div>
        <div
          ref={eventsScroll}
          className="flex gap-5 overflow-x-auto pb-6 snap-x snap-mandatory -mx-4 px-4 scroll-smooth"
          style={{ scrollbarWidth: "thin" }}
        >
          {EVENTS.map(({ icon: Icon, title, desc, color }) => (
            <article
              key={title}
              className="snap-start shrink-0 w-72 sm:w-80 bg-card/70 border border-primary/40 p-6 hover:border-primary hover:-translate-y-1 transition-transform relative group"
              style={{ boxShadow: "0 0 0 1px rgba(0,255,255,0.1)" }}
            >
              <div className="absolute top-2 right-2 font-mono text-[10px] text-muted-foreground">╗</div>
              <div className="absolute bottom-2 left-2 font-mono text-[10px] text-muted-foreground">╚</div>
              <div
                className="inline-flex p-3 mb-4 border-2"
                style={{
                  borderColor: color,
                  color,
                  boxShadow: `0 0 18px ${color}`,
                }}
              >
                <Icon className="w-7 h-7 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-pixel text-sm text-foreground mb-3 leading-relaxed">{title}</h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </article>
          ))}
        </div>
        <p className="font-mono text-xs text-muted-foreground mt-2">← прокрутите →</p>
      </section>

      {/* PARTNERS */}
      <section id="partners" className="relative py-24 px-4 max-w-5xl mx-auto">
        <div className="mb-10 fade-up"><FrameTitle>ДЛЯ ПАРТНЁРОВ</FrameTitle></div>
        <div className="pixel-border-magenta bg-card/50 p-6 sm:p-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="font-sans text-base sm:text-lg leading-relaxed text-foreground/90 mb-6">
              Мы открыты к предложениям от <span className="text-accent neon-text">организаций ТРА</span>,
              спонсоров и медиа. Свяжитесь с генеральным директором напрямую.
            </p>
            <ul className="space-y-2 font-mono text-sm text-muted-foreground">
              {["Спонсорство", "Коллаборации", "Медийное освещение", "Совместные проекты"].map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <span className="text-primary">▣</span> {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="text-center flex flex-col items-center gap-4">
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noreferrer"
              className="font-pixel text-xs sm:text-sm px-8 py-5 bg-accent text-accent-foreground hover:scale-105 transition-transform inline-flex items-center gap-3"
              style={{ boxShadow: "0 0 32px var(--neon-magenta)" }}
            >
              <MessageSquare className="w-5 h-5" />
              НАПИСАТЬ В DISCORD
            </a>
            <CopyTag />
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section id="team" className="relative py-24 px-4 max-w-5xl mx-auto">
        <div className="mb-10 fade-up"><FrameTitle>РУКОВОДСТВО</FrameTitle></div>
        <div className="grid sm:grid-cols-3 gap-5">
          {TEAM.map((t, i) => (
            <div
              key={i}
              className="bg-card/60 border border-primary/40 p-6 hover:border-accent transition-colors text-center"
            >
              <div className="font-mono text-[10px] text-muted-foreground mb-3">
                ╔════════════╗
              </div>
              <div
                className="w-16 h-16 mx-auto mb-4 grid place-items-center font-pixel text-primary text-xl neon-text border-2 border-primary"
                style={{ boxShadow: "0 0 20px var(--neon-cyan)" }}
              >
                Y
              </div>
              <p className="font-mono text-xs text-muted-foreground mb-2 tracking-wider">{t.role}</p>
              <p className="font-pixel text-sm text-accent neon-text mb-3">{t.tag}</p>
              <p className="font-mono text-[10px] text-muted-foreground">Свяжитесь через Discord</p>
              <div className="font-mono text-[10px] text-muted-foreground mt-3">
                ╚════════════╝
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="relative py-24 px-4 max-w-3xl mx-auto text-center">
        <div className="mb-8 inline-block"><FrameTitle>КОНТАКТ</FrameTitle></div>
        <div className="pixel-border bg-card/60 p-8 sm:p-12">
          <h2 className="font-pixel text-base sm:text-xl text-primary neon-text mb-6">START_CONNECTION.EXE</h2>
          <p className="font-sans text-foreground/80 mb-8 leading-relaxed">
            Готовы провести ивент, обсудить партнёрство или вступить в сообщество? Мы на связи 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-sm px-6 py-3 bg-primary text-primary-foreground font-bold tracking-widest inline-flex items-center gap-2"
              style={{ boxShadow: "0 0 24px var(--neon-cyan)" }}
            >
              <MessageSquare className="w-4 h-4" /> DISCORD-СЕРВЕР
            </a>
            <CopyTag />
          </div>
          <div className="mt-8 pt-6 border-t border-primary/20 font-mono text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" /> contact@ncea.tra
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative pt-12 pb-8 px-4 border-t border-primary/20 mt-12">
        {/* garland */}
        <div className="absolute -top-2 left-0 right-0 flex justify-around">
          {[...Array(20)].map((_, i) => {
            const colors = ["var(--neon-cyan)", "var(--neon-magenta)", "var(--neon-gold)"];
            const c = colors[i % 3];
            return (
              <span
                key={i}
                className="block w-2 h-2 rounded-full"
                style={{
                  background: c,
                  color: c,
                  animation: "garland 1.8s ease-in-out infinite",
                  animationDelay: `${i * 0.12}s`,
                }}
              />
            );
          })}
        </div>
        <div className="max-w-5xl mx-auto text-center space-y-3">
          <div className="font-pixel text-primary neon-text text-sm">NCEA</div>
          <p className="font-mono text-xs text-muted-foreground italic">
            «{SLOGAN}»
          </p>
          <div className="flex justify-center gap-4 font-mono text-xs text-muted-foreground">
            <a href={DISCORD_INVITE} target="_blank" rel="noreferrer" className="hover:text-primary transition">Discord</a>
            <span>·</span>
            <a href="mailto:contact@ncea.tra" className="hover:text-primary transition">contact@ncea.tra</a>
          </div>
          <p className="font-mono text-[10px] text-muted-foreground/70">
            © 2026 NovaCraft Event Agency. Все права защищены.
          </p>
        </div>
      </footer>
    </div>
  );
}
