const FORBIDDEN_URL_CHARACTERS = /[\s<>"'`]/;

export function normalizeOptionalText(value: FormDataEntryValue | string | null | undefined) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

export function parseSafeHttpUrl(value: string): URL | null {
  const normalized = value.trim();
  if (!normalized || normalized.length > 2048 || FORBIDDEN_URL_CHARACTERS.test(normalized)) {
    return null;
  }
  try {
    const url = new URL(normalized);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

export function isSafeHttpUrl(value: string) {
  return parseSafeHttpUrl(value) !== null;
}

export function normalizeTelegram(value: string | null) {
  const normalized = value?.trim() ?? "";
  if (!normalized) return null;
  if (/^@[A-Za-z0-9_]{5,32}$/.test(normalized)) return normalized;
  const url = parseSafeHttpUrl(normalized);
  if (
    url?.protocol === "https:" &&
    url.hostname.toLowerCase() === "t.me" &&
    /^\/[A-Za-z0-9_]{5,32}\/?$/.test(url.pathname) &&
    !url.search &&
    !url.hash
  ) {
    return `@${url.pathname.replaceAll("/", "")}`;
  }
  throw new Error("Telegram должен быть в формате @username или https://t.me/username.");
}
