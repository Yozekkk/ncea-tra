import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// Итоговая скидка от первоначального прайса:
// прежние -20%, затем дополнительные -25% от сниженной цены => 0.8 × 0.75 = 0.6.
const DISCOUNT = 0.40;
const factor = 1 - DISCOUNT;
const file = resolve(process.cwd(), "src/lib/services.ts");
let source = readFileSync(file, "utf8");

const priceKeys = ["base", "price", "pricePerUnit"];
let changed = 0;

for (const key of priceKeys) {
  const pattern = new RegExp(`(${key}:\\s*)(-?\\d+(?:\\.\\d+)?)`, "g");
  source = source.replace(pattern, (_, prefix, raw) => {
    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0) return `${prefix}${raw}`;
    changed += 1;
    const discounted = Math.max(1, Math.round(value * factor * 100) / 100);
    return `${prefix}${discounted}`;
  });
}

writeFileSync(file, source);
console.log(`Применена итоговая скидка ${DISCOUNT * 100}% к ${changed} ценовым значениям NCEA.`);
