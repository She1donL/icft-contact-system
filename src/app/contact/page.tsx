import { ContactForm } from "@/components/contact/contact-form";
import { messages } from "@/messages/en";
import styles from "./page.module.css";

export default function ContactPage() {
  return <main className={styles.page}><section className={styles.card} aria-labelledby="contact-title"><h1 id="contact-title">{messages.contact.title}</h1><p>{messages.contact.introduction}</p><p>{messages.contact.notRegistration}</p><aside>{messages.contact.privacy}</aside><ContactForm /></section></main>;
}
