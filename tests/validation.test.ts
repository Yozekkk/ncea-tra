import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { usernameSchema } from "../src/features/auth/schemas.ts";
import { makeSlug, postSchema, topicSchema } from "../src/features/forum/schemas.ts";
import {
  MARKETPLACE_IMAGE_MAX_BYTES,
  listingSchema,
  validateMarketplaceImage,
} from "../src/features/marketplace/schemas.ts";

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
      description: "Описание",
      priceAmount: 0,
      currencyCode: "EUR",
    });
    assert.equal(listing.priceAmount, 0);
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
