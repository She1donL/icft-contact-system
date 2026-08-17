import { ContactForm } from "@/components/contact/contact-form";
import { messages } from "@/messages/en";
import { getPublicSiteContent } from "@/lib/site-content";
import styles from "./page.module.css";

export default async function ContactPage() { const content = await getPublicSiteContent();
  return <main className={styles.page}><section className={styles.card} aria-labelledby="contact-title"><header className={styles.introduction}><h1 id="contact-title">{content.contact_title}</h1>{content.contact_intro.split(/\n\s*\n/).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<p className={styles.note}><strong>Please note:</strong> {messages.contact.notRegistration}</p><aside>{content.contact_privacy_top}</aside></header><ContactForm privacy={content.contact_privacy_submit} submitLabel={content.contact_submit_label} /></section></main>;
}
