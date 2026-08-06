import { requireApprovedAdmin } from "@/lib/auth/admin";
import { messages } from "@/messages/en";

export default async function AdminPage() { await requireApprovedAdmin(); return <main className="auth-page"><section className="auth-card"><h1>{messages.auth.adminTitle}</h1><p>{messages.auth.adminPlaceholder}</p><form action="/admin/logout" method="post"><button type="submit">{messages.auth.signOut}</button></form></section></main>; }
