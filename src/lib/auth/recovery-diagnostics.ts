export type RecoveryFailureCategory = "invalid-link" | "pkce" | "exchange" | "missing-session" | "password-update" | "password-invalid";

type AuthErrorLike = { code?: string } | null | undefined;

export function recoveryFailureCategory(error: AuthErrorLike): RecoveryFailureCategory {
  if (error?.code === "pkce_code_verifier_not_found" || error?.code === "bad_code_verifier" || error?.code === "flow_state_not_found") return "pkce";
  if (error?.code === "otp_expired" || error?.code === "flow_state_expired") return "invalid-link";
  return "exchange";
}

export function recoveryFailurePath(category: RecoveryFailureCategory): string {
  return `/auth/update-password?error=${category}`;
}
