import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Цены больше не переписываются во время каждой сборки. Выбранные услуги
// используют декларативный priceFactor в едином источнике src/lib/services.ts.
const TARGET_IDS = ["modpacks", "server-setup", "resourcepacks", "events", "websites"];
const FACTOR = 0.4;
const FACTOR_NAME = "REDUCED_PRICE_FACTOR";
const file = resolve(process.cwd(), "src/lib/services.ts");
const source = readFileSync(file, "utf8");

if (!source.includes(`const ${FACTOR_NAME} = ${FACTOR};`)) {
  throw new Error(`Не найден единый коэффициент ${FACTOR_NAME} = ${FACTOR}.`);
}

for (const id of TARGET_IDS) {
  const start = source.indexOf(`id: "${id}"`);
  const nextService = source.indexOf("\n  /* ----------------", start + 1);
  const block = source.slice(start, nextService < 0 ? source.length : nextService);
  if (start < 0 || !block.includes(`priceFactor: ${FACTOR_NAME}`)) {
    throw new Error(`Для услуги ${id} не настроен priceFactor ${FACTOR_NAME}.`);
  }
}

console.log(`Проверен коэффициент ${FACTOR} для ${TARGET_IDS.length} выбранных услуг NCEA.`);

