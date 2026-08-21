"use client";

import { useFormStatus } from "react-dom";
import { prospectSubmitState } from "@/lib/prospects/save-flow";

export function ProspectSubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  const state = prospectSubmitState(label, pending);

  return <button type="submit" disabled={state.disabled}>{state.label}</button>;
}
