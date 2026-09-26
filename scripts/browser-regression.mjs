// Run with Playwright installed (or PLAYWRIGHT_MODULE set) and local NCEA/Admin servers.
// All Supabase writes are intercepted fixtures. This is not a production-auth test.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || "playwright");
const publicBase = process.env.PUBLIC_BASE || "http://127.0.0.1:3100";
const adminBase = process.env.ADMIN_BASE || "http://127.0.0.1:3101";
const output = process.env.E2E_OUTPUT || "/tmp/ncea-browser-regression";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
let passed = 0;
async function check(name, run) {
  await run();
  passed++;
  console.log("PASS " + name);
}
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
for (const width of [1920, 1366, 768, 430, 390]) {
  await check(`workers ${width}: async cards visible, bounded and all mapped`, async () => {
    const context = await browser.newContext({
      viewport: { width, height: 844 },
      permissions: ["clipboard-read", "clipboard-write"],
    });
    await context.route("**/rest/v1/ncea_employees*", (r) => r.fulfill({ json: defaultEmployees }));
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(publicBase + "/workers");
    await page.waitForFunction(
      () =>
        document.querySelectorAll(".employee-card").length === 7 &&
        [...document.querySelectorAll(".employee-card-motion")].every(
          (e) => getComputedStyle(e).opacity === "1",
        ),
    );
    const rects = await page.locator(".employee-card").evaluateAll((items) =>
      items.map((e) => ({
        left: e.getBoundingClientRect().left,
        right: e.getBoundingClientRect().right,
        name: e.querySelector("h2").textContent,
      })),
    );
    assert.equal(rects.length, 7);
    assert(rects.every((r) => r.left >= 0 && r.right <= width));
    assert.deepEqual(
      rects.map((r) => r.name),
      defaultEmployees.map((e) => e.name),
    );
    await page.getByRole("button", { name: "Discord Скопировать" }).first().click();
    await page.getByRole("button", { name: "Discord Скопировано ✓" }).waitFor();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), "qa-contact");
    await page.reload();
    await page.waitForFunction(
      () =>
        document.querySelectorAll(".employee-card").length === 7 &&
        getComputedStyle(document.querySelector(".employee-card-motion")).opacity === "1",
    );
    await page.screenshot({ path: `${output}/workers-${width}.png`, fullPage: true });
    assert.deepEqual(errors, []);
    await context.close();
  });
}
for (const mode of ["empty", "error", "slow", "broken-image"]) {
  await check(`workers ${mode} state`, async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    let release;
    const delay = new Promise((resolve) => (release = resolve));
    await context.route("**/rest/v1/ncea_employees*", async (r) => {
      if (mode === "slow") await delay;
      if (mode === "error")
        return r.fulfill({ status: 503, json: { message: "Test backend unavailable" } });
      return r.fulfill({
        json:
          mode === "empty"
            ? []
            : mode === "broken-image"
              ? [{ ...employee(1), image_url: publicBase + "/missing-qa-image.png" }]
              : [employee(1)],
      });
    });
    await page.goto(publicBase + "/workers");
    if (mode === "slow") {
      await page.getByRole("status").filter({ hasText: "Загружаем команду" }).waitFor();
      release();
    }
    if (mode === "empty") await page.getByText("Команда скоро появится здесь").waitFor();
    else if (mode === "error") {
      await page.getByText("Не удалось загрузить сотрудников", { exact: true }).waitFor();
      await page.getByRole("button", { name: "Повторить" }).click();
    } else if (mode === "broken-image") await page.getByText("Фото недоступно").waitFor();
    else await page.locator(".employee-card").waitFor();
    await context.close();
  });
}

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
    if (url.pathname.includes("/auth/v1/"))
      return route.fulfill({ json: url.pathname.endsWith("/user") ? user : session });
    const entity = url.pathname.split("/").pop();
    if (url.pathname.includes("/rpc/")) {
      const body = req.postDataJSON();
      writes.push({ entity, body });
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
await check("Admin AuthGate denies ordinary user and keeps privileged pages hidden", async () => {
  const f = await adminFixture("user");
  await f.page.goto(adminBase + "/employees");
  await f.page.getByRole("heading", { name: "Staff role required" }).waitFor();
  assert.equal(await f.page.getByRole("button", { name: "Добавить сотрудника" }).count(), 0);
  await f.context.close();
});
await check("Admin employee CRUD, publish intent, ordering and restoration", async () => {
  const f = await adminFixture();
  await f.page.goto(adminBase + "/employees");
  await f.page.getByText("Сотрудник 1", { exact: true }).first().waitFor();
  await f.page.getByRole("button", { name: "Добавить сотрудника" }).click();
  await f.page.locator("input[name=name]").fill("Новый QA");
  await f.page.locator("input[name=role]").fill("Тестировщик");
  await f.page.locator("input[name=is_active]").uncheck();
  await f.page.getByRole("button", { name: "Сохранить и опубликовать" }).click();
  await f.page.getByRole("dialog").waitFor({ state: "hidden" });
  assert.equal(f.writes.find((w) => w.body.name === "Новый QA").body.is_active, true);
  await f.page.getByRole("button", { name: "Поднять Сотрудник 2" }).click();
  await f.page.getByRole("status").filter({ hasText: "Изменения сохранены" }).waitFor();
  assert(f.writes.some((w) => w.entity === "admin_reorder_employees"));
  const row = f.page.getByRole("row").filter({ hasText: "Новый QA" });
  await row.getByRole("button", { name: "Удалить", exact: true }).click();
  await f.page.getByLabel("Статус сотрудников").selectOption("deleted");
  await f.page.getByRole("button", { name: "Восстановить скрытым" }).click();
  await f.page.getByLabel("Статус сотрудников").selectOption("inactive");
  await f.page.getByText("Новый QA", { exact: true }).waitFor();
  assert(f.writes.some((w) => w.body.deleted_at === null && w.body.is_active === false));
  assert.deepEqual(f.errors, []);
  await f.page.screenshot({ path: output + "/admin-employees.png" });
  await f.context.close();
});
await check("Marketplace moderation, preview and publication submitter", async () => {
  const f = await adminFixture();
  await f.page.goto(adminBase + "/marketplace");
  await f.page.getByRole("tab", { name: "listings" }).click();
  await f.page.getByRole("button", { name: "Одобрить", exact: true }).click();
  await f.page.getByRole("status").filter({ hasText: "Изменения сохранены" }).waitFor();
  assert(f.writes.some((w) => w.body.status === "published"));
  await f.page.getByRole("button", { name: "Preview", exact: true }).click();
  await f.page.getByText("Связанные файлы: 0").waitFor();
  await f.page.getByRole("button", { name: "Close dialog" }).click();
  await f.page.getByRole("button", { name: "Edit Тестовое объявление" }).click();
  await f.page.getByRole("button", { name: "Сохранить черновик", exact: true }).click();
  await f.page.getByRole("dialog").waitFor({ state: "hidden" });
  assert(
    f.writes.some(
      (w) => w.entity === "admin_save_marketplace_listing" && w.body._status === "draft",
    ),
  );
  assert.deepEqual(f.errors, []);
  await f.context.close();
});
await check("Forum moderation, pin, lock and bulk unlock", async () => {
  const f = await adminFixture();
  await f.page.goto(adminBase + "/forum");
  await f.page.getByRole("tab", { name: "topics" }).click();
  await f.page.getByRole("button", { name: "Pin topic", exact: true }).click();
  await f.page.getByRole("button", { name: "Unpin topic" }).waitFor();
  await f.page.getByRole("button", { name: "Lock topic" }).click();
  await f.page.getByRole("button", { name: "Unlock topic" }).waitFor();
  assert(f.writes.some((w) => w.body.is_pinned === true));
  assert(f.writes.some((w) => w.body.is_locked === true));
  assert.deepEqual(f.errors, []);
  await f.context.close();
});
await check("Admin dashboard, users, settings, audit and existing NCreate section", async () => {
  const f = await adminFixture();
  for (const path of ["/", "/users", "/settings", "/audit"]) {
    await f.page.goto(adminBase + path);
    await f.page.locator("h1").waitFor();
    await f.page.waitForFunction(() => !document.body.innerText.includes("Loading live data"));
  }
  await f.page.goto(adminBase + "/settings");
  await f.page.locator("textarea[name=announcement]").fill("Объявление QA");
  await f.page.getByRole("button", { name: "Сохранить объявление" }).click();
  await f.page.getByRole("status").filter({ hasText: "Изменения сохранены" }).waitFor();
  assert(
    f.writes.some(
      (w) => w.entity === "ncea_site_settings" && w.body.announcement === "Объявление QA",
    ),
  );
  await f.page.getByRole("button", { name: "NCreate Minecraft server" }).click();
  await f.page.getByRole("button", { name: "Сайт", exact: true }).click();
  await f.page.getByRole("heading", { name: "Сайт", exact: true }).waitFor();
  assert.deepEqual(f.errors, []);
  await f.context.close();
});
for (const width of [1920, 1366, 768, 390]) {
  await check(`Admin responsive ${width}: all sections and employee form`, async () => {
    const f = await adminFixture();
    await f.page.setViewportSize({ width, height: width === 390 ? 844 : 1080 });
    for (const path of [
      "/",
      "/employees",
      "/users",
      "/marketplace",
      "/forum",
      "/settings",
      "/audit",
    ]) {
      await f.page.goto(adminBase + path);
      await f.page.locator("h1").waitFor();
      await f.page.waitForFunction(() => !document.body.innerText.includes("Loading live data"));
      assert(
        await f.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `Page overflow ${path} at ${width}`,
      );
      if (path === "/employees") {
        await f.page.getByRole("button", { name: "Добавить сотрудника" }).click();
        await f.page.getByRole("dialog").waitFor();
        await f.page.waitForFunction(
          () =>
            getComputedStyle(document.querySelector(".modal-backdrop")).opacity === "1" &&
            getComputedStyle(document.querySelector(".modal")).opacity === "1",
        );
        await f.page.keyboard.press("Shift+Tab");
        assert(
          await f.page.evaluate(() =>
            document.querySelector('[role="dialog"]').contains(document.activeElement),
          ),
        );
        assert(await f.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await f.page.screenshot({ path: `${output}/admin-form-${width}.png`, fullPage: true });
        await f.page.getByRole("button", { name: "Close dialog" }).click();
      }
    }
    assert.deepEqual(f.errors, []);
    await f.context.close();
  });
}
await check(
  "Admin failed action: visible error, controls re-enabled, no false success",
  async () => {
    const f = await adminFixture();
    await f.context.route("**/rest/v1/ncea_employees*", async (route) => {
      if (route.request().method() === "PATCH")
        return route.fulfill({ status: 403, json: { message: "Permission denied QA" } });
      await route.fallback();
    });
    await f.page.goto(adminBase + "/employees");
    await f.page.getByText("Сотрудник 1", { exact: true }).first().waitFor();
    await f.page.getByRole("button", { name: "Удалить", exact: true }).first().click();
    await f.page.getByText("Permission denied QA", { exact: true }).waitFor();
    assert.equal(
      await f.page.getByRole("button", { name: "Удалить", exact: true }).first().isEnabled(),
      true,
    );
    assert.equal(await f.page.getByText("Изменения сохранены.", { exact: true }).count(), 0);
    assert.equal(f.rows.ncea_employees[0].deleted_at, null);
    await f.context.close();
  },
);
await check("Admin moderator cannot open employee, role or settings administration", async () => {
  const f = await adminFixture("moderator");
  for (const path of ["/employees", "/users", "/settings", "/audit"]) {
    await f.page.goto(adminBase + path);
    await f.page.getByRole("heading", { name: "Moderation", exact: true }).waitFor();
    assert.equal(await f.page.getByRole("button", { name: "Добавить сотрудника" }).count(), 0);
  }
  await f.context.close();
});
await browser.close();
console.log(
  `PASS ${passed} browser scenarios. Backend permissions verified separately by rollback-only SQL tests.`,
);
