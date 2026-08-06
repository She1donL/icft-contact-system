import { messages } from "@/messages/en";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="page-title">
        <p className={styles.eyebrow}>{messages.landing.eyebrow}</p>
        <div className={styles.logoPlaceholder} aria-label={messages.landing.logoAlt}>ICFT</div>
        <h1 id="page-title">{messages.landing.title}</h1>
        <p className={styles.introduction}>{messages.landing.introduction}</p>
        <button className={styles.cta} type="button" disabled>{messages.landing.submitButton}</button>
        <p className={styles.availabilityNote}>{messages.landing.availabilityNote}</p>
      </section>
      <section className={styles.details} aria-label="Contact and privacy information">
        <div><h2>{messages.landing.privacyTitle}</h2><p>{messages.landing.privacyStatement}</p></div>
        <div><h2>{messages.landing.contactTitle}</h2><p>{messages.landing.contactPlaceholder}</p></div>
      </section>
    </main>
  );
}
