import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { usernameSchema } from "../src/features/auth/schemas.ts";
import { makeSlug, postSchema, topicSchema } from "../src/features/forum/schemas.ts";
import {
  MARKETPLACE_IMAGE_MAX_BYTES,
  listingSchema,
  validateMarketplaceImage,
} from "../src/features/marketplace/schemas.ts";
import { getStreakPresentation, rankMarketplaceListings } from "../src/features/streak/model.ts";

describe("account validation", () => {
  it("accepts a trimmed username and rejects unsafe or short values", () => {
    assert.equal(usernameSchema.parse("  Player.One_7 "), "Player.One_7");
    assert.equal(usernameSchema.safeParse("ab").success, false);
    assert.equal(usernameSchema.safeParse("<script>").success, false);
  });
});

describe("forum validation", () => {
  it("requires a category, title, and plain-text body", () => {
    assert.equal(topicSchema.safeParse({ categoryId: 0, title: "Hi", body: "" }).success, false);
    assert.equal(postSchema.parse({ body: "  Обычный <текст>  " }).body, "Обычный <текст>");
  });

  it("creates stable URL-safe slugs", () => {
    assert.equal(makeSlug("Hello, NCEA!"), "hello-ncea");
    assert.equal(makeSlug("Форум NCEA"), "ncea");
  });
});

describe("marketplace validation", () => {
  it("accepts zero price and a supported currency", () => {
    const listing = listingSchema.parse({
      categoryId: 1,
      title: "Plugin",
      shortDescription: "Короткое описание плагина",
      description: "Полное описание возможностей плагина.",
      priceAmount: 0,
      currencyCode: "EUR",
      minecraftVersion: "1.21.4",
      platform: "Paper",
    });
    assert.equal(listing.priceAmount, 0);
    assert.equal(listing.shortDescription, "Короткое описание плагина");
  });

  it("requires distinct short and full descriptions and limits optional metadata", () => {
    assert.equal(
      listingSchema.safeParse({
        categoryId: 1,
        title: "Plugin",
        shortDescription: "",
        description: "Полное описание возможностей плагина.",
        priceAmount: null,
        currencyCode: "RUB",
        minecraftVersion: "",
        platform: "",
      }).success,
      false,
    );
    assert.equal(
      listingSchema.safeParse({
        categoryId: 1,
        title: "Plugin",
        shortDescription: "Короткое описание плагина",
        description: "Полное описание возможностей плагина.",
        priceAmount: null,
        currencyCode: "RUB",
        minecraftVersion: "1".repeat(41),
        platform: "Paper",
      }).success,
      false,
    );
  });

  it("rejects unsupported and oversized images", () => {
    assert.match(validateMarketplaceImage({ type: "image/gif", size: 100 }) ?? "", /JPEG/);
    assert.match(
      validateMarketplaceImage({ type: "image/webp", size: MARKETPLACE_IMAGE_MAX_BYTES + 1 }) ?? "",
      /10 МБ/,
    );
    assert.equal(validateMarketplaceImage({ type: "image/png", size: 1024 }), null);
  });
});

describe("activity streak presentation and promotion order", () => {
  it("shows progress until day three and promotion afterwards", () => {
    assert.deepEqual(getStreakPresentation(0), {
      days: 0,
      progress: 0,
      eligible: false,
      message: "Зайдите сегодня, чтобы начать серию",
    });
    assert.equal(getStreakPresentation(2).progress, 2);
    assert.equal(getStreakPresentation(2).eligible, false);
    assert.equal(getStreakPresentation(3).eligible, true);
    assert.equal(getStreakPresentation(6).progress, 3);
  });

  it("ranks eligible sellers by live streak with stable tie-breakers", () => {
    const ranked = rankMarketplaceListings([
      {
        id: "b",
        effective_streak: 4,
        last_bumped_at: "2026-09-07T10:00:00Z",
        created_at: "2026-09-01T10:00:00Z",
      },
      { id: "c", effective_streak: 0, last_bumped_at: null, created_at: "2026-09-08T10:00:00Z" },
      {
        id: "a",
        effective_streak: 6,
        last_bumped_at: "2026-09-08T10:00:00Z",
        created_at: "2026-08-01T10:00:00Z",
      },
      {
        id: "d",
        effective_streak: 4,
        last_bumped_at: "2026-09-08T10:00:00Z",
        created_at: "2026-09-02T10:00:00Z",
      },
    ]);
    assert.deepEqual(
      ranked.map((item) => item.id),
      ["a", "d", "b", "c"],
    );
  });
});
