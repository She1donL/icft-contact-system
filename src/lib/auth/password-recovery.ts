const updatePasswordPath = "/auth/update-password";

export function appBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3000";
  return new URL(configuredUrl).origin;
}

export function passwordRecoveryCallbackUrl(baseUrl = appBaseUrl()): string {
  const url = new URL("/auth/callback", baseUrl);
  url.searchParams.set("next", updatePasswordPath);
  return url.toString();
}

export function safeRecoveryNextPath(value: string | null): string {
  return value === updatePasswordPath ? value : updatePasswordPath;
}

export function passwordRecoveryDestination(isValid: boolean): string {
  return isValid ? updatePasswordPath : `${updatePasswordPath}?error=recovery`;
}
