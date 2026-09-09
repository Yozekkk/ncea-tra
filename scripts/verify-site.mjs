import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const canonicalOrigin = "https://www.ncea-studio.com";
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
  "src/routes/login.tsx",
  "src/routes/register.tsx",
  "src/routes/profile.tsx",
  "src/routes/forum.index.tsx",
  "src/routes/marketplace.index.tsx",
  "src/routes/admin.tsx",
  "src/routes/services.tsx",
  "src/routes/__root.tsx",
  "src/components/site/ServicePage.tsx",
  "src/components/site/SiteHeader.tsx",
  "src/components/site/nav/Navbar.tsx",
  "src/components/site/SiteFooter.tsx",
  "src/components/site/ReviewsSection.tsx",
  "src/components/site/TikTokSection.tsx",
  "src/components/site/InteractiveGridBackground.tsx",
  "src/lib/services.ts",
  "src/lib/supabase.ts",
  "supabase/migrations/20260905220000_ncea_platform_foundation.sql",
  "supabase/migrations/20260907194500_ncea_community_platform.sql",
  "supabase/migrations/20260907201500_ncea_username_fallback_collision_fix.sql",
  "supabase/migrations/20260907213000_ncea_forum_topic_route_invariant.sql",
  "supabase/migrations/20260908120000_ncea_marketplace_pending_review_status.sql",
  "supabase/migrations/20260908121000_ncea_marketplace_streak_and_hardening.sql",
  "supabase/migrations/20260908122000_ncea_marketplace_rpc_enum_cast.sql",
  "supabase/migrations/20260908123000_ncea_storage_policy_upload_compatibility.sql",
  "supabase/migrations/20260908124000_ncea_registration_rate_limit_saturation.sql",
  "supabase/functions/register-account/index.ts",
  "supabase/tests/ncea_api_verification.mjs",
  "supabase/tests/ncea_platform_rls.sql",
  "supabase/tests/ncea_streak_marketplace_rls.sql",
  "tests/validation.test.ts",
  "docs/ncea-platform.md",
  ".env.example",
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
  if (!sitemap.includes(`<loc>${canonicalOrigin}${route}</loc>`))
    fail(`Маршрут ${route} отсутствует в sitemap.xml`);
}
if (!process.exitCode) ok("Все 12 услуг и маршрутов зарегистрированы");

for (const route of ["/forum", "/marketplace"]) {
  if (!sitemap.includes(`<loc>${canonicalOrigin}${route}</loc>`))
    fail(`Публичный маршрут ${route} отсутствует в sitemap.xml`);
}
if (!process.exitCode) ok("Forum и Marketplace добавлены в canonical sitemap");

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

const navbarSource = read("src/components/site/nav/Navbar.tsx");
const stylesSource = read("src/styles.css");
if (!navbarSource.includes('className="ref-mobile-tabbar"'))
  fail("Mobile bottom navigation не найден");
if (!navbarSource.includes("LOGO_MARK"))
  fail("Mobile navigation не использует официальный логотип");
if (!/env\(safe-area-inset-bottom/.test(stylesSource))
  fail("Mobile navigation не учитывает нижнюю safe-area");
if (!stylesSource.includes(".ref-mobile-tabbar-link.is-active"))
  fail("Mobile navigation не содержит active state");
if (!process.exitCode) ok("Mobile bottom navigation использует общий navbar, логотип и safe-area");

const tiktokSource = read("src/components/site/TikTokSection.tsx");
const homeSource = read("src/routes/index.tsx");
for (const url of [
  "https://www.tiktok.com/@ncea_argentia",
  "https://www.tiktok.com/@ncea_kreativ",
]) {
  if (!tiktokSource.includes(url)) fail(`TikTok-ссылка отсутствует: ${url}`);
}
if (!homeSource.includes("<TikTokSection />")) fail("TikTok showcase не подключён на главной");
if (!homeSource.includes("ref-community-tiktok")) fail("TikTok-ссылки не добавлены в контакты");
if (!/target="_blank"[\s\S]*?rel="noopener noreferrer"/.test(tiktokSource))
  fail("TikTok showcase не использует безопасные внешние ссылки");
if (!process.exitCode) ok("Оба TikTok-направления добавлены на главную и в контакты");

const backgroundSource = read("src/components/site/InteractiveGridBackground.tsx");
if (!backgroundSource.includes("requestAnimationFrame")) fail("Canvas-grid не использует rAF");
if (!backgroundSource.includes("prefers-reduced-motion"))
  fail("Canvas-grid не учитывает reduced motion");
if (!backgroundSource.includes('removeEventListener("pointermove"'))
  fail("Canvas-grid не очищает pointer listener");
if (!process.exitCode) ok("Interactive canvas-grid оптимизирован и поддерживает reduced motion");

const supabaseSource = read("src/lib/supabase.ts");
const envExample = read(".env.example");
const migrationSource = read("supabase/migrations/20260905220000_ncea_platform_foundation.sql");
const foundationTables = [
  "profiles",
  "user_roles",
  "forum_categories",
  "forum_topics",
  "forum_posts",
  "marketplace_categories",
  "marketplace_listings",
  "marketplace_listing_images",
];
if (!supabaseSource.includes("VITE_SUPABASE_PUBLISHABLE_KEY"))
  fail("Supabase client не использует publishable key");
if (/SERVICE_ROLE/i.test(supabaseSource + envExample))
  fail("Во frontend-конфигурации найден service role key");
for (const table of foundationTables) {
  if (!migrationSource.includes(`create table public.${table}`))
    fail(`В foundation migration отсутствует таблица ${table}`);
  if (!migrationSource.includes(`alter table public.${table} enable row level security`))
    fail(`RLS не включён для ${table}`);
}
if (!process.exitCode) ok("Supabase foundation использует только publishable key и RLS");

const communityHardening = read(
  "supabase/migrations/20260908121000_ncea_marketplace_streak_and_hardening.sql",
);
for (const invariant of [
  "create table public.user_activity_streaks",
  "create or replace function public.record_daily_activity()",
  "create or replace function public.create_marketplace_listing",
  "create or replace view public.marketplace_feed",
  "seller_id = (select auth.uid())",
  "with (security_invoker = true)",
]) {
  if (!communityHardening.includes(invariant))
    fail(`В community hardening migration отсутствует invariant: ${invariant}`);
}
if (!process.exitCode)
  ok("Streak, Marketplace RPC и security-invoker feed зафиксированы миграцией");

const agencyMigration = read(
  "supabase/migrations/20260909172147_ncea_agency_marketplace_and_role_boundaries.sql",
);
const marketplaceRoute = read("src/routes/marketplace.index.tsx");
const marketplaceCards = read("src/features/marketplace/components.tsx");
for (const invariant of [
  "marketplace_listing_source",
  "protect_marketplace_listing_fields",
  "listing_source = 'agency'",
  "user_is_admin",
  "is_protected",
  "with (security_invoker = true)",
]) {
  if (!agencyMigration.includes(invariant))
    fail(`В agency migration отсутствует invariant: ${invariant}`);
}
for (const label of ["Все", "От агентства", "От пользователей"]) {
  if (!marketplaceRoute.includes(label)) fail(`Marketplace не содержит фильтр: ${label}`);
}
for (const copy of ["Цена скоро будет добавлена", "Скоро будет добавлена картинка"]) {
  if (!marketplaceCards.includes(copy)) fail(`Marketplace не содержит текст: ${copy}`);
}
if (!homeSource.includes("https://my.awas.ovh/")) fail("Ссылка официального партнёра отсутствует");
if (!homeSource.includes("Надёжный хостинг для ваших игровых проектов"))
  fail("Текст официального партнёра отсутствует");
if (
  !/href="https:\/\/my\.awas\.ovh\/"[\s\S]*?target="_blank"[\s\S]*?rel="noopener noreferrer"/.test(
    homeSource,
  )
)
  fail("Ссылка официального партнёра открывается небезопасно");
if (!process.exitCode)
  ok("Официальный партнёр и защищённый agency Marketplace зафиксированы в UI и миграции");

if (process.exitCode) {
  console.error("\nПроверка NCEA завершилась с ошибками. Деплой остановлен.\n");
} else {
  console.log("\n🚀 Проверка NCEA успешно завершена. Сайт готов к сборке.\n");
}
