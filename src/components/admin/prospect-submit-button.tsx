"use client";

import { useFormStatus } from "react-dom";
import { prospectSubmitState } from "@/lib/prospects/save-flow";

export function ProspectSubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  const state = prospectSubmitState(label, pending, pendingLabel);

  return <button type="submit" disabled={state.disabled}>{state.label}</button>;
}
