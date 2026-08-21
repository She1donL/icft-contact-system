import { getCurrentAdminAccess } from "@/lib/auth/admin";
import { getProspectsForExport } from "@/lib/prospects/admin-data";
import { prospectsToCsv } from "@/lib/prospects/export";

export async function GET(request: Request) {
  const { isApproved } = await getCurrentAdminAccess();
  if (!isApproved) return new Response("Not authorized", { status: 403 });
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const { rows, error } = await getProspectsForExport(params);
  if (error) return new Response("Export unavailable", { status: 500 });
  const date = new Date().toISOString().slice(0, 10);
  return new Response(prospectsToCsv(rows), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename=ICFT_Research_Prospects_${date}.csv`, "Cache-Control": "no-store" } });
}
