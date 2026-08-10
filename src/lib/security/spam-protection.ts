/**
 * Production QR release gate: verify a Cloudflare Turnstile token here and use
 * a durable, provider-backed rate limiter before enabling public QR distribution.
 * The current local milestone intentionally relies only on validation and a honeypot.
 */
export const spamProtectionStatus = "turnstile and durable rate limiting required before public QR release" as const;
