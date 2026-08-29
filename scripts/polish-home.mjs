import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const file = resolve(process.cwd(), "src/routes/index.tsx");
let source = readFileSync(file, "utf8");

source = source.replace(
  /const portfolio = \[[\s\S]*?\n\];/,
  `const portfolio = [
  { title: "Minecraft-сервер под ключ", tag: "Server setup", code: "SERVER", desc: "Ядро, плагины, права, TAB, экономика, защита и оптимизация." },
  { title: "Сайт игрового проекта", tag: "Web development", code: "WEB", desc: "Адаптивный сайт с личным кабинетом, формами и интеграциями." },
  { title: "Карта для RPG-сервера", tag: "Minecraft map", code: "MAP", desc: "Локации, ландшафт, интерьеры и игровые механики." },
  { title: "Фирменное оформление", tag: "Brand design", code: "BRAND", desc: "Логотип, баннеры, карточки и единая визуальная система." },
];`,
);

source = source.replace(
  `<a href="#portfolio" className="liquid-secondary inline-flex h-13 items-center gap-2 px-7 font-medium">Портфолио</a>`,
  `<a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="liquid-secondary inline-flex h-13 items-center gap-2 px-7 font-medium"><I.Telegram className="h-5 w-5" /> Telegram</a>
                <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="liquid-secondary inline-flex h-13 items-center gap-2 px-7 font-medium"><I.Discord className="h-5 w-5" /> Discord</a>`,
);

source = source.replace(
  `<div className="liquid-orb liquid-orb-b" />`,
  `<div className="liquid-orb liquid-orb-b" />\n      <div className="network-background" aria-hidden="true"><span className="network-layer network-layer-a" /><span className="network-layer network-layer-b" /></div>`,
);

source = source.replaceAll(
  `className="liquid-choice group block rounded-2xl p-4"`,
  `className="liquid-choice service-square group block p-5"`,
);

source = source.replace(
  /\{portfolio\.map\(\(item\) => \([\s\S]*?\)\)\}/,
  `{portfolio.map((item, index) => (
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
              ))}`,
);

source = source.replace(
  `<img src={LOGO_MARK} alt="NCEA" className="round-brand-image mx-auto h-24 w-24" />\n            <h2 className="mt-6`,
  `<h2 className="mt-0`,
);

writeFileSync(file, source);
console.log(
  "Главная страница NCEA обновлена: фон-сеть, квадратные услуги, соцкнопки и портфолио без изображений.",
);
