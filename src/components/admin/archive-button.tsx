"use client";
import { useFormStatus } from "react-dom";
export function ArchiveButton({ archived }: { archived: boolean }) { const { pending } = useFormStatus(); return <button type="submit" onClick={(event) => { if (!archived && !window.confirm("Archive this contact? It can be restored later.")) event.preventDefault(); }} disabled={pending}>{pending ? "Saving…" : archived ? "Restore contact" : "Archive contact"}</button>; }
