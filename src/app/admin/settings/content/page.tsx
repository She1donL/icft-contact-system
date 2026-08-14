import Link from "next/link";
import { requireApprovedAdmin } from "@/lib/auth/admin";
import { getPublicSiteContent, siteContentLimits } from "@/lib/site-content";
import { resetSiteContentToDefaults, saveSiteContent } from "./actions";
import styles from "../../admin.module.css";

type SearchParams = Promise<{ saved?: string; reset?: string; error?: string }>;

const sections = [
  { title: "General", description: "These values identify ICFT on the public site.", fields: [["organization_name", "Organization display name", "input"], ["footer_text", "Short footer text", "textarea"]] },
  { title: "Home page", description: "Changes affect the public home page immediately after saving.", fields: [["home_title", "Main title", "input"], ["home_intro", "Subtitle / introduction", "textarea"], ["home_cta_label", "Primary CTA label", "input"], ["home_secondary_text", "Secondary informational text", "textarea"]] },
  { title: "Contact form page", description: "Privacy text is shown near the top of the form and again near submit.", fields: [["contact_title", "Page title", "input"], ["contact_intro", "Introductory paragraph", "textarea"], ["contact_privacy_top", "Privacy notice near the top", "textarea"], ["contact_privacy_submit", "Privacy reminder near submit", "textarea"], ["contact_submit_label", "Submit button label", "input"]] },
  { title: "Success page", description: "This is the confirmation shown after a successful form submission.", fields: [["success_title", "Success title", "input"], ["success_message", "Success message", "textarea"]] },
] as const;

export default async function SiteContentSettingsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireApprovedAdmin();
  const [content, query] = await Promise.all([getPublicSiteContent(), searchParams]);

  return <main className={styles.page}>
    <header className={styles.header}><div><Link href="/admin">← Contact dashboard</Link><h1>Public site content</h1><p>Changes affect the live public website. Text is plain text only.</p></div><form action="/admin/logout" method="post"><button>Sign out</button></form></header>
    {query.saved && <p className={styles.notice} role="status">Public content changes saved.</p>}
    {query.reset && <p className={styles.notice} role="status">Public content was reset to the English defaults.</p>}
    {query.error && <p className={styles.error} role="alert">Content could not be saved. Check that every field contains plain text within its limit.</p>}
    <form action={saveSiteContent} className={`${styles.form} ${styles.settingsForm}`}>
      {sections.map((section) => <fieldset className={styles.settingsSection} key={section.title}><legend>{section.title}</legend><p>{section.description}</p>
        {section.fields.map(([name, label, control]) => <label className={styles.full} key={name}>{label}
          {control === "textarea" ? <textarea name={name} defaultValue={content[name]} maxLength={siteContentLimits[name]} required /> : <input name={name} defaultValue={content[name]} maxLength={siteContentLimits[name]} required />}
          <small>Maximum {siteContentLimits[name]} characters.</small>
        </label>)}
      </fieldset>)}
      <div className={`${styles.mutations} ${styles.full}`}><button type="submit">Save Changes</button></div>
    </form>
    <form action={resetSiteContentToDefaults} className={styles.resetForm}><button type="submit">Reset all fields to defaults</button></form>
  </main>;
}
