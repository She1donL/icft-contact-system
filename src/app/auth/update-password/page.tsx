import { messages } from "@/messages/en";
import { SubmitButton } from "@/components/auth/submit-button";
import { recoveryPasswordFieldName, recoveryPasswordMinLength } from "@/lib/auth/recovery-diagnostics";
import { updatePassword } from "./actions";
const errorMessages = {
  "invalid-link": messages.auth.recoverySessionError,
  pkce: messages.auth.recoveryPkceError,
  exchange: messages.auth.recoveryExchangeError,
  "missing-session": messages.auth.recoveryMissingSessionError,
  "password-required": messages.auth.recoveryPasswordRequiredError,
  "password-too-short": messages.auth.recoveryPasswordTooShortError,
  "password-update": messages.auth.recoveryPasswordUpdateError,
} as const;

export default async function UpdatePasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const errorMessage = params.error ? errorMessages[params.error as keyof typeof errorMessages] ?? messages.auth.recoveryExchangeError : null;

  return <main className="auth-page"><form action={updatePassword} className="auth-card"><h1>{messages.auth.updatePasswordTitle}</h1>{errorMessage && <p role="alert">{errorMessage}</p>}<label>{messages.auth.newPasswordLabel}<input name={recoveryPasswordFieldName} type="password" autoComplete="new-password" required minLength={recoveryPasswordMinLength} /></label><SubmitButton pendingLabel={messages.auth.working}>{messages.auth.updatePassword}</SubmitButton></form></main>;
}
