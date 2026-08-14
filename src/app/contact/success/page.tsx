import { getPublicSiteContent } from "@/lib/site-content";
import styles from "../page.module.css";

export default async function ContactSuccessPage() { const content = await getPublicSiteContent();
  return <main className={styles.page}><section className={styles.card}><h1>{content.success_title}</h1><p>{content.success_message}</p></section></main>;
}
