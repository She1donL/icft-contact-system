"use client";
import { useFormStatus } from "react-dom";
export function DeleteProspectButton() { const { pending } = useFormStatus(); return <button type="submit" onClick={(event) => { if (!window.confirm("Delete this Research Prospect and its sources, tags, and flags? This cannot be undone.")) event.preventDefault(); }} disabled={pending}>{pending ? "Deleting…" : "Delete Research Prospect"}</button>; }
