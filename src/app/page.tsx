import Image from "next/image";
import Link from "next/link";
import { messages } from "@/messages/en";
import { getPublicSiteContent } from "@/lib/site-content";
import styles from "./page.module.css";

export default async function Home() { const content = await getPublicSiteContent();
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="page-title">
        <p className={styles.eyebrow}>{content.organization_name}</p>
        <Image className={styles.logo} src="/icft-logo.jpg" alt="International Council of Forest Therapy logo" width={1254} height={1254} priority />
        <h1 id="page-title">{content.home_title}</h1>
        <p className={styles.introduction}>{content.home_intro}</p>
        <Link className={styles.cta} href="/contact">{content.home_cta_label}</Link>
        <p className={styles.availabilityNote}>{content.home_secondary_text}</p>
      </section>
      <section className={styles.details} aria-label="Contact and privacy information">
        <div><h2>{messages.landing.privacyTitle}</h2><p>{messages.landing.privacyStatement}</p></div>
        <div><h2>{messages.landing.contactTitle}</h2><p>{messages.landing.contactPlaceholder}</p></div>
      </section>
      <footer className={styles.footer}>{content.footer_text}</footer>
    </main>
  );
}
