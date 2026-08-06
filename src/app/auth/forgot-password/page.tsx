import { messages } from "@/messages/en";
import { SubmitButton } from "@/components/auth/submit-button";
import { requestPasswordReset } from "./actions";
export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) { const params = await searchParams; return <main className="auth-page"><form action={requestPasswordReset} className="auth-card"><h1>{messages.auth.resetTitle}</h1>{params.sent ? <p role="status">{messages.auth.genericRecoverySent}</p> : <><p>{messages.auth.resetIntro}</p><label>{messages.auth.emailLabel}<input name="email" type="email" autoComplete="email" required /></label><SubmitButton pendingLabel={messages.auth.working}>{messages.auth.sendReset}</SubmitButton></>}</form></main>; }
