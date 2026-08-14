import { ContactForm } from "@/components/contact/contact-form";
import { messages } from "@/messages/en";
import { getPublicSiteContent } from "@/lib/site-content";
import styles from "./page.module.css";

export default async function ContactPage() { const content = await getPublicSiteContent();
  return <main className={styles.page}><section className={styles.card} aria-labelledby="contact-title"><h1 id="contact-title">{content.contact_title}</h1><p>{content.contact_intro}</p><p>{messages.contact.notRegistration}</p><aside>{content.contact_privacy_top}</aside><ContactForm privacy={content.contact_privacy_submit} submitLabel={content.contact_submit_label} /></section></main>;
}
