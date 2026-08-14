import "server-only";
import { createClient } from "@/lib/supabase/server";
import { siteContentDefaults } from "@/messages/en";

export type SiteContent = { -readonly [Key in keyof typeof siteContentDefaults]: string };
export const siteContentFields = Object.keys(siteContentDefaults) as (keyof SiteContent)[];
export const siteContentLimits: Record<keyof SiteContent, number> = { organization_name: 120, footer_text: 240, home_title: 160, home_intro: 1200, home_cta_label: 60, home_secondary_text: 500, contact_title: 160, contact_intro: 1600, contact_privacy_top: 800, contact_privacy_submit: 800, contact_submit_label: 60, success_title: 120, success_message: 800 };

export function mergeSiteContent(value: Partial<SiteContent> | null | undefined): SiteContent {
  const merged: SiteContent = { ...siteContentDefaults };

  for (const field of siteContentFields) {
    const fieldValue = value?.[field];
    if (typeof fieldValue === "string" && fieldValue.trim()) (merged as Record<string, string>)[field] = fieldValue.trim();
  }

  return merged;
}

export async function getPublicSiteContent(): Promise<SiteContent> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("site_settings").select(siteContentFields.join(",")).eq("id", true).maybeSingle();
    return error ? siteContentDefaults : mergeSiteContent(data as Partial<SiteContent> | null);
  } catch {
    return siteContentDefaults;
  }
}

export function validateSiteContent(formData: FormData): { success: true; data: SiteContent } | { success: false } {
  const data: Record<string, string> = {};

  for (const field of siteContentFields) {
    const value = formData.get(field);
    if (typeof value !== "string") return { success: false };

    const normalized = value.trim();
    if (!normalized || normalized.length > siteContentLimits[field] || /[<>]/.test(normalized)) return { success: false };
    data[field] = normalized;
  }

  return { success: true, data: data as SiteContent };
}
