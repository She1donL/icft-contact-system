"use client";

import { useActionState, useState } from "react";
import { countryRegionOptions, roleOptions } from "@/lib/contacts/options";
import { submitContact } from "@/app/contact/actions";
import { initialContactSubmissionState } from "@/app/contact/action-state";
import { messages } from "@/messages/en";
import { TurnstileWidget } from "./turnstile-widget";
import styles from "./contact-form.module.css";

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p id={id} className={styles.error}>{message}</p> : null;
}

function RequiredMarker() {
  return <span className={styles.asterisk} aria-hidden="true">*</span>;
}

function FieldLabel({ children, required = false }: { children: string; required?: boolean }) {
  return <span>{children}{required && <RequiredMarker />}</span>;
}

export function ContactForm({ privacy, submitLabel }: { privacy?: string; submitLabel?: string }) {
  const [state, formAction, pending] = useActionState(submitContact, initialContactSubmissionState);
  const [hasOtherRole, setHasOtherRole] = useState(false);
  const errors = state?.errors ?? {};
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  return <form action={formAction} className={styles.form} noValidate>
    {errors.form && <p className={styles.error} role="alert">{errors.form}</p>}
    <div className={styles.honeypot} aria-hidden="true"><label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
    <p className={styles.requiredNote}>Fields marked with <span className={styles.asterisk} aria-hidden="true">*</span><span className={styles.srOnly}> an asterisk</span> are required.</p>
    <label><FieldLabel required>First Name</FieldLabel><input name="firstName" required autoComplete="given-name" aria-describedby="firstName-error" /></label><FieldError id="firstName-error" message={errors.firstName} />
    <label><FieldLabel required>Last Name</FieldLabel><input name="lastName" required autoComplete="family-name" aria-describedby="lastName-error" /></label><FieldError id="lastName-error" message={errors.lastName} />
    <label><FieldLabel>Preferred Name</FieldLabel><input name="preferredName" autoComplete="nickname" aria-describedby="preferredName-help preferredName-error" /><span id="preferredName-help" className={styles.help}>The name you would like us to use when communicating with you, if different from your first name.</span></label><FieldError id="preferredName-error" message={errors.preferredName} />
    <label><FieldLabel required>Email Address</FieldLabel><input name="email" type="email" required autoComplete="email" aria-describedby="email-error" /></label><FieldError id="email-error" message={errors.email} />
    <fieldset aria-describedby="roles-error" aria-required="true"><legend>Role(s)<RequiredMarker /></legend>{roleOptions.map((role) => <label className={styles.choice} key={role}><input type="checkbox" name="roles" value={role} onChange={(event) => role === "Other" && setHasOtherRole(event.target.checked)} />{role}</label>)}</fieldset><FieldError id="roles-error" message={errors.roles} />
    {hasOtherRole && <><label><FieldLabel required>Please specify your role.</FieldLabel><input name="otherRole" required aria-describedby="otherRole-error" /></label><FieldError id="otherRole-error" message={errors.otherRole} /></>}
    <label><FieldLabel>Organization or Institution</FieldLabel><input name="organization" autoComplete="organization" aria-describedby="organization-help organization-error" /><span id="organization-help" className={styles.help}>Please leave this blank if you are not currently affiliated with or representing an organization or institution.</span></label><FieldError id="organization-error" message={errors.organization} />
    <label><FieldLabel>Position or Professional Title</FieldLabel><input name="professionalTitle" autoComplete="organization-title" aria-describedby="professionalTitle-help professionalTitle-error" /><span id="professionalTitle-help" className={styles.help}>For example: Professor, Research Associate, Program Director, Graduate Student, or Healthcare Consultant.</span></label><FieldError id="professionalTitle-error" message={errors.professionalTitle} />
    <label><FieldLabel required>Country or Region</FieldLabel><select name="countryRegion" required defaultValue="" aria-describedby="countryRegion-error"><option value="" disabled>Select a country or region</option>{countryRegionOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}</select></label><FieldError id="countryRegion-error" message={errors.countryRegion} />
    <label><FieldLabel>Professional Interest</FieldLabel><input name="generalField" aria-describedby="generalField-help generalField-error" /><span id="generalField-help" className={styles.help}>Please provide a broad professional interest, such as Forestry, Public Health, Medicine, Psychology, Tourism, or Education.</span></label><FieldError id="generalField-error" message={errors.generalField} />
    <label><FieldLabel>Specify Professional Interest</FieldLabel><textarea name="specificResearchArea" rows={5} aria-describedby="specificResearchArea-help specificResearchArea-error" /><span id="specificResearchArea-help" className={styles.help}>Please briefly describe your professional focus or topic of interest.</span></label><FieldError id="specificResearchArea-error" message={errors.specificResearchArea} />
    <fieldset aria-describedby="conferenceUpdatesConsent-error"><legend>Would you like to receive conference announcements and related updates by email?<RequiredMarker /></legend><label className={styles.choice}><input type="radio" name="conferenceUpdatesConsent" value="yes" required />Yes</label><label className={styles.choice}><input type="radio" name="conferenceUpdatesConsent" value="no" required />No</label></fieldset><FieldError id="conferenceUpdatesConsent-error" message={errors.conferenceUpdatesConsent} />
    <p className={styles.privacy}>{privacy ?? messages.contact.privacy}</p>
    <TurnstileWidget siteKey={siteKey} resetSignal={errors.form} />
    <button type="submit" disabled={pending || !siteKey} aria-disabled={pending || !siteKey}>{pending ? messages.contact.submitting : submitLabel ?? messages.contact.submit}</button>
  </form>;
}
