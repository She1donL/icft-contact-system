const defaultReturnTo = "/admin/prospects";

export function safeProspectReturnTo(value: string | null | undefined) {
  if (!value || !value.startsWith("/admin/") || value.startsWith("//") || value.includes("\\")) return defaultReturnTo;

  const url = new URL(value, "http://localhost");
  return url.origin === "http://localhost" ? `${url.pathname}${url.search}${url.hash}` : defaultReturnTo;
}

function withReturnTo(path: string, returnTo: string | null | undefined) {
  return `${path}${path.includes("?") ? "&" : "?"}returnTo=${encodeURIComponent(safeProspectReturnTo(returnTo))}`;
}

export function prospectSaveSuccessPath(id: string, returnTo: string | null | undefined) {
  return withReturnTo(`/admin/prospects/${id}?saved=prospect`, returnTo);
}

export function prospectSaveFailurePath(id: string, returnTo: string | null | undefined) {
  return withReturnTo(id === "new" ? "/admin/prospects/new?error=save" : `/admin/prospects/${id}?error=save`, returnTo);
}

export function prospectSubmitState(
  label: string,
  pending: boolean,
  pendingLabel = "Saving…",
) {
  return { disabled: pending, label: pending ? pendingLabel : label };
}
