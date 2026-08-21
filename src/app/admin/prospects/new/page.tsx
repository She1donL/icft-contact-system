import Link from "next/link";
import { requireApprovedAdmin } from "@/lib/auth/admin";
import { createProspect } from "../actions";
import { ProspectForm } from "../prospect-form";
import styles from "../../admin.module.css";
export default async function NewProspectPage({ searchParams }: { searchParams: Promise<{ error?: string; returnTo?: string }> }) { await requireApprovedAdmin(); const query = await searchParams; return <main className={styles.page}><header className={styles.header}><div><Link href="/admin/prospects">← Research Prospects</Link><h1>Add Research Prospect</h1><p>This dataset is externally researched and is never treated as consent.</p></div></header>{query.error && <p className={styles.error}>Please review the fields and try again.</p>}<ProspectForm action={createProspect} submit="Create prospect" returnTo={query.returnTo}/></main>; }
