import assert from "node:assert/strict";
import test from "node:test";

import { categorySlug } from "../apps/admin/src/lib/format.ts";

test("NCreate category slug is generated from Cyrillic names", () => {
  assert.equal(categorySlug("  Новости сервера  "), "novosti-servera");
});

test("NCreate category slug stays URL-safe", () => {
  assert.equal(categorySlug("Guides & FAQ 1.21"), "guides-faq-1-21");
});
