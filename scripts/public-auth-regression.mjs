// All auth and Supabase writes are intercepted fixtures. No production data is changed.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || "playwright");
const publicBase = process.env.PUBLIC_BASE || "http://127.0.0.1:3100";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const now = new Date().toISOString();
const userId = "10000000-0000-4000-8000-000000000001";
function employee(index) {
  return {
    id: `60000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    name: index === 7 ? "ОченьДлинноеИмя".repeat(5) : `Сотрудник ${index}`,
    role: index === 7 ? "Должность".repeat(12) : "Разработчик",
    level: "Junior",
    username: null,
    timezone: null,
    telegram: null,
    discord: "qa-contact",
    github_url: null,
    image_url: null,
    bio: null,
    sort_order: index * 10,
    is_active: true,
    deleted_at: null,
    created_at: now,
    updated_at: now,
  };
}
const defaultEmployees = Array.from({ length: 7 }, (_, i) => employee(i + 1));
async function adminFixture(role = "admin") {
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const rows = {
    ncea_employees: [employee(1), employee(2)],
    profiles: [{ id: userId, username: "qa_user", display_name: "QA", bio: null, created_at: now }],
    user_roles: [{ user_id: userId, role }],
    forum_categories: [
      {
        id: 1,
        name: "Обсуждение",
        slug: "general",
        sort_order: 10,
        is_active: true,
        description: null,
      },
    ],
    forum_topics: [
      {
        id: "70000000-0000-4000-8000-000000000001",
        title: "Тестовая тема",
        slug: "qa-topic",
        category_id: 1,
        author_id: userId,
        created_at: now,
        is_pinned: false,
        is_locked: false,
        is_protected: false,
        deleted_at: null,
        profiles: { username: "qa_user" },
        forum_categories: { name: "Обсуждение" },
      },
    ],
    forum_posts: [],
    marketplace_categories: [
      { id: 1, name: "Разработка", slug: "development", sort_order: 10, is_active: true },
    ],
    marketplace_listings: [
      {
        id: "80000000-0000-4000-8000-000000000001",
        title: "Тестовое объявление",
        slug: "qa-listing",
        seller_id: userId,
        category_id: 1,
        short_description: "Описание для проверки",
        description: "Полное описание тестового объявления",
        listing_source: "user",
        status: "pending_review",
        price_amount: 0,
        currency_code: "RUB",
        image_url: null,
        created_at: now,
        deleted_at: null,
        profiles: { username: "qa_user" },
        marketplace_categories: { name: "Разработка" },
      },
    ],
    marketplace_listing_images: [],
    ncea_site_settings: [
      { site_id: "ncea", announcement: "", announcement_enabled: false, updated_at: now },
    ],
    ncea_admin_audit: [],
    ncreate_site_settings: [
      {
        site_id: "ncreate",
        server_name: "NCreate",
        hero_title: "NCreate",
        online_players: 0,
        record_players: 0,
        total_players: 0,
        status: "soon",
      },
    ],
    ncreate_home_sections: [],
    ncreate_home_cards: [],
    ncreate_forum_categories: [],
    ncreate_forum_topics: [],
    ncreate_forum_posts: [],
  };
  const writes = [];
  const user = {
    id: userId,
    aud: "authenticated",
    role: "authenticated",
    email: "qa@example.invalid",
    app_metadata: {},
    user_metadata: {},
    created_at: now,
  };
  const session = {
    access_token: "fixture-access-token",
    refresh_token: "fixture-refresh-token",
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    expires_in: 3600,
    token_type: "bearer",
    user,
  };
  await context.addInitScript(
    ({ session }) =>
      localStorage.setItem("sb-bualqaeinwifoopzflbt-auth-token", JSON.stringify(session)),
    { session },
  );
  await context.route("**/bualqaeinwifoopzflbt.supabase.co/**", async (route) => {
    const req = route.request(),
      url = new URL(req.url()),
      method = req.method();
    if (url.pathname.endsWith("/logout")) return route.fulfill({ status: 204 });
    if (url.pathname.includes("/auth/v1/"))
      return route.fulfill({ json: url.pathname.endsWith("/user") ? user : session });
    const entity = url.pathname.split("/").pop();
    if (url.pathname.includes("/rpc/")) {
      const body = req.postDataJSON();
      writes.push({ entity, body });
      if (entity === "create_forum_reply") {
        rows.forum_posts.push({
          id: "90000000-0000-4000-8000-000000000001",
          topic_id: body._topic_id,
          author_id: userId,
          body: body._body,
          created_at: now,
          deleted_at: null,
          profiles: { username: "qa_user", avatar_url: null },
        });
        return route.fulfill({ json: null });
      }

      if (entity === "create_marketplace_listing" || entity === "update_marketplace_listing") {
        Object.assign(rows.marketplace_listings[0], {
          title: body._title,
          slug: body._slug ?? rows.marketplace_listings[0].slug,
          short_description: body._short_description,
          description: body._description,
          status: body._submit ? "pending_review" : "draft",
          marketplace_listing_images: [],
          published_at: null,
        });
        return route.fulfill({ json: rows.marketplace_listings[0].id });
      }

      if (entity === "admin_reorder_employees")
        body._ids.forEach((id, i) => {
          rows.ncea_employees.find((e) => e.id === id).sort_order = (i + 1) * 10;
        });
      return route.fulfill({
        json: entity === "admin_save_marketplace_listing" ? rows.marketplace_listings[0].id : null,
      });
    }
    let data = rows[entity] ?? [];
    const id = url.searchParams.get("id");
    if (id?.startsWith("eq.")) data = data.filter((r) => String(r.id) === id.slice(3));
    const deletion = url.searchParams.get("deleted_at");
    if (deletion === "is.null") data = data.filter((r) => !r.deleted_at);
    if (deletion === "not.is.null") data = data.filter((r) => r.deleted_at);
    if (method === "POST") {
      const body = req.postDataJSON();
      const row = {
        ...body,
        id: `60000000-0000-4000-8000-${String(rows.ncea_employees.length + 1).padStart(12, "0")}`,
        deleted_at: null,
        created_at: now,
        updated_at: now,
      };
      rows[entity].push(row);
      data = [row];
      writes.push({ entity, body });
    }
    if (method === "PATCH") {
      const body = req.postDataJSON();
      data.forEach((r) => Object.assign(r, body));
      writes.push({ entity, body });
    }
    if (method === "HEAD")
      return route.fulfill({
        status: 200,
        headers: {
          "content-range": `0-0/${data.length}`,
          "access-control-expose-headers": "content-range",
        },
        body: "",
      });
    const single = req.headers().accept?.includes("vnd.pgrst.object");
    return route.fulfill({ json: single ? data[0] : data });
  });
  const page = await context.newPage();
  page.on("dialog", (d) => d.accept());
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  return { context, page, rows, writes, errors };
}
const f = await adminFixture("user");
await f.page.goto(publicBase + "/profile", { waitUntil: "networkidle" });
await f.page.getByLabel("Отображаемое имя", { exact: true }).fill("QA обновлён");
await f.page.getByRole("button", { name: "Сохранить изменения", exact: true }).click();
await f.page.getByRole("status").filter({ hasText: "Профиль сохранён" }).waitFor();
assert(f.writes.some((w) => w.entity === "profiles" && w.body.display_name === "QA обновлён"));
await f.page.reload({ waitUntil: "networkidle" });
assert.equal(
  await f.page.getByLabel("Отображаемое имя", { exact: true }).inputValue(),
  "QA обновлён",
);
console.log("PASS NCEA profile edit and authenticated reload (intercepted fixtures)");
await f.page.goto(publicBase + "/marketplace/new", { waitUntil: "networkidle" });
await f.page.getByLabel("Название", { exact: true }).fill("Русское объявление QA");
await f.page.getByLabel("Краткое описание", { exact: true }).fill("Подробное описание QA товара");
await f.page
  .getByLabel("Полное описание", { exact: true })
  .fill("Полное описание QA товара для browser regression");
await f.page.getByRole("button", { name: "Создать черновик", exact: true }).click();
await f.page.waitForURL(
  (url) => url.pathname.startsWith("/marketplace/") && url.pathname !== "/marketplace/new",
);
await f.page.getByRole("heading", { name: "Русское объявление QA", exact: true }).waitFor();
assert(f.writes.some((w) => w.entity === "create_marketplace_listing" && w.body._submit === false));
await f.page.getByRole("link", { name: "Изменить", exact: true }).click();
await f.page.waitForLoadState("networkidle");
await f.page.getByLabel("Название", { exact: true }).waitFor();
await f.page.reload({ waitUntil: "networkidle" });
await f.page.getByLabel("Название", { exact: true }).waitFor();
await f.page.goBack({ waitUntil: "networkidle" });
await f.page.getByRole("heading", { name: "Русское объявление QA", exact: true }).waitFor();
await f.page.goForward({ waitUntil: "networkidle" });
await f.page.getByLabel("Название", { exact: true }).fill("Изменённое объявление QA");
await f.page.getByRole("button", { name: "Отправить на проверку", exact: true }).click();
await f.page.getByRole("heading", { name: "Изменённое объявление QA", exact: true }).waitFor();
assert(f.writes.some((w) => w.entity === "update_marketplace_listing" && w.body._submit === true));
await f.page.goto(publicBase + "/marketplace/my", { waitUntil: "networkidle" });
await f.page.getByRole("heading", { name: "Мои объявления", exact: true }).waitFor();
await f.page.getByText("Изменённое объявление QA", { exact: true }).waitFor();
console.log("PASS NCEA create/edit listing, pending review and my listings (intercepted fixtures)");

await f.page.goto(publicBase + "/forum/topic/qa-topic", { waitUntil: "networkidle" });
await f.page.getByRole("heading", { name: "Тестовая тема", exact: true }).waitFor();
await f.page.getByLabel("Ваш ответ", { exact: true }).fill("Ответ QA для проверки форума");
await f.page.getByRole("button", { name: "Ответить", exact: true }).click();
await f.page.getByText("Ответ QA для проверки форума", { exact: true }).waitFor();
assert(f.writes.some((w) => w.entity === "create_forum_reply"));
f.rows.forum_topics[0].is_locked = true;
await f.page.reload({ waitUntil: "networkidle" });
await f.page.getByText("Новые ответы отключены модератором.", { exact: true }).waitFor();
assert.equal(await f.page.getByLabel("Ваш ответ", { exact: true }).count(), 0);
console.log("PASS NCEA forum reply, reload and locked-topic UI (intercepted fixtures)");
await f.page.goto(publicBase + "/profile", { waitUntil: "networkidle" });
await f.page
  .locator("form.profile-card")
  .getByRole("button", { name: "Выйти", exact: true })
  .click();
await f.page.getByText("Войдите, чтобы открыть профиль", { exact: true }).waitFor();
assert.equal(
  await f.page.evaluate(() => localStorage.getItem("sb-bualqaeinwifoopzflbt-auth-token")),
  null,
);
assert.deepEqual(f.errors, []);
console.log("PASS NCEA logout clears profile and stored session (intercepted fixtures)");
await f.context.close();
await browser.close();
