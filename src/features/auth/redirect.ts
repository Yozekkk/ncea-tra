export function safeAuthRedirect(value: unknown, fallback = "/profile") {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    ![...value].some((character) => character === "\\" || character.charCodeAt(0) < 32)
    ? value
    : fallback;
}
