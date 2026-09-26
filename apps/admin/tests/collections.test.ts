import assert from "node:assert/strict";
import test from "node:test";
import { pageRows, searchRows, selectedRows } from "../src/lib/collections.ts";
import { readRows } from "../src/lib/readRows.ts";

test("search handles whitespace, Cyrillic, IDs and optional display fields", () => {
  const rows = [
    { id: "1", name: "Степан" },
    { id: "2", name: "Максим" },
  ];
  assert.deepEqual(
    searchRows(rows, " СТЕП ", (r) => r.name),
    [rows[0]],
  );
  assert.deepEqual(
    searchRows(rows, "", (r) => r.name),
    rows,
  );
});
test("pagination clamps after filtering or deletion and preserves every row", () => {
  const rows = Array.from({ length: 61 }, (_, id) => ({ id }));
  assert.equal(pageRows(rows, 99).page, 2);
  assert.equal(pageRows(rows, 2).rows.length, 11);
  assert.deepEqual(pageRows([], 100), { rows: [], page: 0, pages: 1 });
  assert.equal(selectedRows(rows, new Set(["1", "60", "no-longer-exists"])).length, 2);
});
test("database row caps do not silently hide records", async () => {
  const source = Array.from({ length: 1051 }, (_, id) => ({ id }));
  const result = await readRows(async (from, to) => ({
    data: source.slice(from, to + 1),
    error: null,
  }));
  assert.equal(result.length, 1051);
  assert.equal(
    (await readRows(async (from, to) => ({ data: source.slice(from, to + 1), error: null }), 5))
      .length,
    5,
  );
  await assert.rejects(
    readRows(async () => ({ data: null, error: { message: "denied" } })),
    /denied/,
  );
});
