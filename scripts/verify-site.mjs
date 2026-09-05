import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), "utf8");
const fail = (message) => {
  console.error(`\n❌ ${message}`);
  process.exitCode = 1;
};
const ok = (message) => console.log(`✅ ${message}`);

const expectedServices = [
  ["events", "/events"],
  ["modpacks", "/modpacks"],
  ["plugins", "/plugins"],
  ["server-setup", "/server-setup"],
  ["websites", "/websites"],
  ["support", "/support"],
  ["maps", "/maps"],
  ["skins", "/skins"],
  ["design", "/design"],
  ["logos", "/logos"],
  ["resourcepacks", "/resourcepacks"],
  ["fancymenu", "/fancymenu"],
];

const requiredFiles = [
  "src/routes/index.tsx",
  "src/routes/services.tsx",
  "src/routes/__root.tsx",
  "src/components/site/ServicePage.tsx",
  "src/components/site/SiteHeader.tsx",
  "src/components/site/SiteFooter.tsx",
  "src/components/site/ReviewsSection.tsx",
  "src/lib/services.ts",
  "public/images/reviews/minecraft-client-reviews.webp",
  "public/robots.txt",
  "public/sitemap.xml",
  "public/site.webmanifest",
];

for (const file of requiredFiles) {
  if (!existsSync(resolve(root, file))) fail(`Не найден обязательный файл: ${file}`);
}
if (!process.exitCode) ok("Все обязательные файлы присутствуют");

const servicesSource = read("src/lib/services.ts");
const sitemap = read("public/sitemap.xml");
const manifest = JSON.parse(read("public/site.webmanifest"));

for (const [id, route] of expectedServices) {
  const idPattern = new RegExp(`id:\\s*[\"']${id}[\"']`);
  const pathPattern = new RegExp(`path:\\s*[\"']${route}[\"']`);
  if (!idPattern.test(servicesSource)) fail(`В каталоге услуг отсутствует id: ${id}`);
  if (!pathPattern.test(servicesSource)) fail(`В каталоге услуг отсутствует маршрут: ${route}`);
  if (!sitemap.includes(`<loc>https://ncea-tra.vercel.app${route}</loc>`))
    fail(`Маршрут ${route} отсутствует в sitemap.xml`);
}
if (!process.exitCode) ok("Все 12 услуг и маршрутов зарегистрированы");

const baseMatches = [...servicesSource.matchAll(/base:\s*(-?\d+(?:\.\d+)?)/g)].map((match) =>
  Number(match[1]),
);
if (baseMatches.length < expectedServices.length) fail("Не удалось найти базовые цены всех услуг");
if (baseMatches.some((price) => !Number.isFinite(price) || price < 0))
  fail("Найдена некорректная или отрицательная базовая цена");
else ok("Базовые цены неотрицательны");

const daysMatches = [...servicesSource.matchAll(/days:\s*\[\s*(\d+)\s*,\s*(\d+)\s*\]/g)].map(
  (match) => [Number(match[1]), Number(match[2])],
);
if (daysMatches.length < expectedServices.length) fail("Не удалось найти сроки всех услуг");
for (const [min, max] of daysMatches) {
  if (min < 1 || max < min) fail(`Некорректный срок выполнения: ${min}–${max}`);
}
if (!process.exitCode) ok("Сроки услуг корректны");

if (!String(manifest.name).includes("NCEA") && !String(manifest.short_name).includes("NCEA"))
  fail("В web manifest отсутствует название NCEA");
if (!manifest.start_url) fail("В web manifest отсутствует start_url");
if (!manifest.theme_color || !manifest.background_color)
  fail("В web manifest отсутствуют фирменные цвета");
if (!process.exitCode) ok("Web manifest заполнен");

const forbiddenPatterns = [/href=[\"']#[\"']/g, /purple-logo/gi, /ncea-logo-old/gi];
const checkedFiles = [
  "src/routes/index.tsx",
  "src/components/site/SiteHeader.tsx",
  "src/components/site/SiteFooter.tsx",
  "src/components/site/ServicePage.tsx",
];
for (const file of checkedFiles) {
  const source = read(file);
  for (const pattern of forbiddenPatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(source)) fail(`В ${file} найден запрещённый шаблон: ${pattern}`);
  }
}
if (!process.exitCode) ok("Ссылки-заглушки и старые логотипы не найдены");

const reviewsSource = read("src/components/site/ReviewsSection.tsx");
const expectedReviewNicks = [
  "ArseniyInvesto",
  "jofi8k",
  "Bondar3501",
  "Rewards",
  "Hinti22",
  "momoakk1",
  "Bondar3501",
  "Rewards",
  "zoomer0k",
];
const reviewEntries = [...reviewsSource.matchAll(/nick:\s*"([^"]+)"/g)].map((match) => match[1]);
if (reviewEntries.length !== 9) fail(`Ожидалось 9 отзывов, найдено: ${reviewEntries.length}`);
if (reviewEntries.join("|") !== expectedReviewNicks.join("|"))
  fail("Ники или порядок отзывов не соответствуют утверждённому списку");
if (/₽|руб(?:\.|л|лей)|заказ\s*№|id\s*заказа|\d+\s*(?:дн|час).*назад/i.test(reviewsSource))
  fail("В секции отзывов найдены запрещённые коммерческие метаданные");
if (!process.exitCode) ok("Все 9 отзывов присутствуют без цен, дат и ID заказа");

if (process.exitCode) {
  console.error("\nПроверка NCEA завершилась с ошибками. Деплой остановлен.\n");
} else {
  console.log("\n🚀 Проверка NCEA успешно завершена. Сайт готов к сборке.\n");
}
