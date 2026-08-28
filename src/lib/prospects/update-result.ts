export type ProspectUpdateResult = {
  data: { id: string } | null;
  error: unknown | null;
};

/** A Prospect save is successful only when the requested row was returned. */
export function isConfirmedProspectUpdate(id: string, result: ProspectUpdateResult) {
  return result.error === null && result.data?.id === id;
}
