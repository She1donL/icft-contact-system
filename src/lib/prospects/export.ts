import { parseProspectListParams } from "./admin";

export type ProspectExportRow = {
  first_name: string; last_name: string; preferred_name: string | null; organization: string | null; position_title: string | null; country_region: string | null; public_email: string | null; priority: string; review_status: string; identity_verified: boolean; affiliation_verified: boolean; relevance_verified: boolean; email_verified: boolean; discovery_batch: string | null; last_verified_at: string | null; created_at: string; updated_at: string;
  tags: string[]; flags: string[]; sources: { source_url: string; source_type: string | null; source_title: string | null }[];
};

const columns: [string, (row: ProspectExportRow) => unknown][] = [
  ["First Name", row => row.first_name], ["Last Name", row => row.last_name], ["Preferred Name", row => row.preferred_name], ["Organization / Institution", row => row.organization], ["Position / Professional Title", row => row.position_title], ["Country / Region", row => row.country_region], ["Public Email", row => row.public_email], ["Priority", row => row.priority], ["Review Status", row => row.review_status], ["Identity Verified", row => row.identity_verified], ["Affiliation Verified", row => row.affiliation_verified], ["Relevance Verified", row => row.relevance_verified], ["Email Verified", row => row.email_verified], ["Discovery Batch", row => row.discovery_batch], ["Last Verified At", row => row.last_verified_at], ["Created At", row => row.created_at], ["Updated At", row => row.updated_at], ["Tags", row => row.tags.join("; ")], ["Flags", row => row.flags.join("; ")], ["Sources", row => row.sources.map(source => `${source.source_type ?? "source"}${source.source_title ? `: ${source.source_title}` : ""} (${source.source_url})`).join("; ")],
];

function cell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value).replace(/[\r\n]+/g, " ");
  const safe = /^\s*[=+\-@]/u.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function prospectsToCsv(rows: ProspectExportRow[]) {
  const header = columns.map(([name]) => name).join(",");
  const body = rows.map(row => columns.map(([, get]) => cell(get(row))).join(","));
  return `\uFEFF${header}\r\n${body.join("\r\n")}\r\n`;
}

export function filterProspectExportRows(params: Record<string, string | string[] | undefined>) {
  return { ...parseProspectListParams(params), page: 1 };
}
