export function getTrustedClientIdentifier(requestHeaders: Headers) {
  if (process.env.VERCEL === "1") {
    const forwardedFor = requestHeaders.get("x-forwarded-for")?.trim();
    if (forwardedFor) return forwardedFor;
  }

  return "unavailable";
}
