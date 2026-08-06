export function safeNextPath(value: string | null, fallback = "/admin"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
