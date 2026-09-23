import assert from "node:assert/strict";
import test from "node:test";
import { safeAuthRedirect } from "../src/features/auth/redirect.ts";

test("login redirects stay on this site", () => {
  assert.equal(safeAuthRedirect("/marketplace/my"), "/marketplace/my");
  for (const value of [
    "//evil.example",
    "/\\evil.example",
    "https://evil.example",
    "/\n/evil.example",
  ]) {
    assert.equal(safeAuthRedirect(value), "/profile");
  }
});
