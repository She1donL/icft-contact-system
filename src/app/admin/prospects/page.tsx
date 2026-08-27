import Link from "next/link";
import { ProspectSubmitButton } from "@/components/admin/prospect-submit-button";
import { requireApprovedAdmin } from "@/lib/auth/admin";
import { countryRegionOptions } from "@/lib/contacts/options";
import { getProspects } from "@/lib/prospects/admin-data";
import { prospectPriorities, prospectReviewStatuses } from "@/lib/prospects/options";
import styles from "./prospects.module.css";

type Params = Record<string, string | string[] | undefined>;

function href(filters: Record<string, string | number>, page: number) {
  const params = new URLSearchParams();
  Object.entries({ ...filters, page }).forEach(([key, value]) => {
    if (value) params.set(key, String(value));
  });
  return `/admin/prospects?${params}`;
}

function exportHref(filters: Record<string, string>) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return `/admin/prospects/export${query ? `?${query}` : ""}`;
}

function date(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value))
    : "—";
}

export default async function ProspectsPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  await requireApprovedAdmin();
  const params = await searchParams;
  const { prospects, total, filters, error } = await getProspects(params);
  const values = {
    q: filters.query,
    priority: filters.priority,
    status: filters.status,
    country: filters.country,
    emailVerified: filters.emailVerified,
    discoveryBatch: filters.discoveryBatch,
  };
  const returnTo = href(values, filters.page);
  const pages = Math.max(1, Math.ceil(total / 25));
  const imported =
    typeof params.imported === "string" && /^\d+$/u.test(params.imported)
      ? Number(params.imported)
      : null;
  const hasFilters = Object.values(values).some(Boolean);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <Link className={styles.backLink} href="/admin">
            ← Contact dashboard
          </Link>
          <h1>Research Prospects</h1>
          <p>
            Externally researched professional candidates. Public email is not
            communication consent.
          </p>
        </div>
        <form action="/admin/logout" method="post">
          <button className={styles.signOut} type="submit">
            Sign out
          </button>
        </form>
      </header>

      {params.deleted === "1" ? (
        <div className={styles.successNotice} role="status" aria-live="polite">
          <span aria-hidden="true">✓</span>
          <div>
            <strong>Prospect deleted</strong>
            <p>Research Prospect deleted successfully.</p>
          </div>
        </div>
      ) : imported !== null ? (
        <div className={styles.successNotice} role="status" aria-live="polite">
          <span aria-hidden="true">✓</span>
          <div>
            <strong>Import complete</strong>
            <p>
              {imported} Research Prospect{imported === 1 ? "" : "s"} imported
              successfully.
            </p>
          </div>
        </div>
      ) : null}

      <nav className={styles.actionBar} aria-label="Prospect actions">
        <Link
          className={styles.primaryAction}
          href={`/admin/prospects/new?returnTo=${encodeURIComponent(returnTo)}`}
        >
          <span aria-hidden="true">＋</span>
          Add prospect
        </Link>
        <Link className={styles.secondaryAction} href="/admin/prospects/import">
          Import CSV
        </Link>
        <Link className={styles.secondaryAction} href={exportHref(values)}>
          Export CSV
        </Link>
      </nav>

      <form className={styles.filters}>
        <div className={styles.filterHeader}>
          <div>
            <h2>Find prospects</h2>
            <p>Narrow the list using one or more filters.</p>
          </div>
          {hasFilters ? <span className={styles.activeFilter}>Filters active</span> : null}
        </div>

        <label className={styles.searchField}>
          Search
          <input
            name="q"
            defaultValue={filters.query}
            placeholder="Name, organization, email…"
          />
        </label>
        <label>
          Priority
          <select name="priority" defaultValue={filters.priority}>
            <option value="">All priorities</option>
            {prospectPriorities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          Review status
          <select name="status" defaultValue={filters.status}>
            <option value="">All statuses</option>
            {prospectReviewStatuses.map((item) => (
              <option key={item} value={item}>
                {item.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label>
          Country
          <select name="country" defaultValue={filters.country}>
            <option value="">All countries</option>
            {countryRegionOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Email
          <select name="emailVerified" defaultValue={filters.emailVerified}>
            <option value="">All email states</option>
            <option value="yes">Verified</option>
            <option value="no">Unverified</option>
          </select>
        </label>
        <label>
          Discovery batch
          <input name="discoveryBatch" defaultValue={filters.discoveryBatch} />
        </label>
        <div className={styles.filterActions}>
          <ProspectSubmitButton label="Apply filters" pendingLabel="Applying…" />
          {hasFilters ? <Link href="/admin/prospects">Clear filters</Link> : null}
        </div>
      </form>

      {error ? (
        <p className={styles.error} role="alert">
          Research Prospects could not be loaded. Please try again.
        </p>
      ) : (
        <>
          <div className={styles.listHeading}>
            <div>
              <h2>Prospect list</h2>
              <p>
                {total} matching prospect{total === 1 ? "" : "s"}
              </p>
            </div>
            <span>
              Page {filters.page} of {pages}
            </span>
          </div>

          {prospects.length ? (
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Organization</th>
                    <th>Country</th>
                    <th>Position</th>
                    <th>Public email</th>
                    <th>Priority</th>
                    <th>Review</th>
                    <th>Verification</th>
                    <th>Last verified</th>
                  </tr>
                </thead>
                <tbody>
                  {prospects.map((prospect) => {
                    const verificationCount = [
                      prospect.identity_verified,
                      prospect.affiliation_verified,
                      prospect.relevance_verified,
                      prospect.email_verified,
                    ].filter(Boolean).length;

                    return (
                      <tr key={prospect.id}>
                        <td data-label="Name">
                          <Link
                            className={styles.prospectLink}
                            href={`/admin/prospects/${prospect.id}?returnTo=${encodeURIComponent(returnTo)}`}
                          >
                            {prospect.first_name} {prospect.last_name}
                          </Link>
                        </td>
                        <td data-label="Organization">{prospect.organization ?? "—"}</td>
                        <td data-label="Country">{prospect.country_region ?? "—"}</td>
                        <td data-label="Position">{prospect.position_title ?? "—"}</td>
                        <td data-label="Public email" className={styles.emailCell}>
                          {prospect.public_email ?? "—"}
                        </td>
                        <td data-label="Priority">
                          <span className={styles.badge} data-priority={prospect.priority}>
                            {prospect.priority}
                          </span>
                        </td>
                        <td data-label="Review">
                          <span className={styles.badge} data-status={prospect.review_status}>
                            {prospect.review_status.replaceAll("_", " ")}
                          </span>
                        </td>
                        <td data-label="Verification">
                          <div className={styles.verification}>
                            <progress
                              max={4}
                              value={verificationCount}
                              aria-label={`${verificationCount} of 4 checks verified`}
                            />
                            <span>{verificationCount}/4</span>
                          </div>
                        </td>
                        <td data-label="Last verified">
                          {date(prospect.last_verified_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <strong>No matching prospects</strong>
              <p>Try changing or clearing the current filters.</p>
            </div>
          )}

          <nav className={styles.pagination} aria-label="Prospect list pagination">
            <div>
              {filters.page > 1 ? (
                <Link href={href(values, filters.page - 1)}>← Previous</Link>
              ) : (
                <span aria-hidden="true" />
              )}
              <span>
                Page {filters.page} of {pages}
              </span>
              {filters.page < pages ? (
                <Link href={href(values, filters.page + 1)}>Next →</Link>
              ) : (
                <span aria-hidden="true" />
              )}
            </div>
          </nav>
        </>
      )}
    </main>
  );
}
