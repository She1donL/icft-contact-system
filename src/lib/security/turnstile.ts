import "server-only";

type TurnstileResult = { success?: boolean; action?: string; hostname?: string };
type Fetcher = typeof fetch;

type VerifyTurnstileOptions = {
  token: string | null;
  remoteIp?: string;
  secretKey?: string;
  expectedAction?: string;
  expectedHostname?: string;
  fetcher?: Fetcher;
};

function configuredHostname() {
  try {
    return process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname : undefined;
  } catch {
    return undefined;
  }
}

export async function verifyTurnstileToken({
  token,
  remoteIp,
  secretKey = process.env.TURNSTILE_SECRET_KEY,
  expectedAction = "contact_submission",
  expectedHostname = configuredHostname(),
  fetcher = fetch,
}: VerifyTurnstileOptions) {
  if (!token || token.length > 2048 || !secretKey) return false;

  const body = new URLSearchParams({ secret: secretKey, response: token });
  if (remoteIp && remoteIp !== "unavailable") body.set("remoteip", remoteIp);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetcher("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: controller.signal,
    });
    if (!response.ok) return false;
    const result = await response.json() as TurnstileResult;
    return result.success === true && result.action === expectedAction && (!expectedHostname || result.hostname === expectedHostname);
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
