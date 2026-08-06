import Link from "next/link";
import { SubmitButton } from "@/components/auth/submit-button";
import { messages } from "@/messages/en";
import { login } from "./actions";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const params = await searchParams;
  return <main className="auth-page"><form action={login} className="auth-card"><h1>{messages.auth.loginTitle}</h1><p>{messages.auth.loginIntro}</p>{params.error && <p role="alert">{messages.auth.genericLoginError}</p>}<input type="hidden" name="next" value={params.next ?? ""} /><label>{messages.auth.emailLabel}<input name="email" type="email" autoComplete="email" required /></label><label>{messages.auth.passwordLabel}<input name="password" type="password" autoComplete="current-password" required minLength={8} /></label><SubmitButton pendingLabel={messages.auth.working}>{messages.auth.signIn}</SubmitButton><Link href="/auth/forgot-password">{messages.auth.forgotPassword}</Link></form></main>;
}
