import { messages } from "@/messages/en";
import styles from "../page.module.css";

export default function ContactSuccessPage() {
  return <main className={styles.page}><section className={styles.card}><p>{messages.contact.success}</p></section></main>;
}
