import Link from "next/link";
import { messages } from "@/messages/en";
export default function NotAuthorizedPage() { return <main className="auth-page"><section className="auth-card"><h1>{messages.auth.notAuthorizedTitle}</h1><p>{messages.auth.notAuthorizedBody}</p><Link href="/admin/login">{messages.auth.returnToLogin}</Link></section></main>; }
