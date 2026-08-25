import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import UpdatePasswordPage from "@/app/auth/update-password/page";

describe("update-password page errors", () => {
  it("does not render an error before the callback or form action supplies one", async () => {
    const markup = renderToStaticMarkup(await UpdatePasswordPage({ searchParams: Promise.resolve({}) }));

    expect(markup).not.toContain("role=\"alert\"");
  });

  it("turns an unrecognized error query into an exchange-safe diagnostic", async () => {
    const markup = renderToStaticMarkup(await UpdatePasswordPage({ searchParams: Promise.resolve({ error: "unexpected" }) }));

    expect(markup).toContain("We could not establish a password recovery session.");
    expect(markup).not.toContain("We could not complete that request.");
  });

  it("uses the password field required by the server action", async () => {
    const markup = renderToStaticMarkup(await UpdatePasswordPage({ searchParams: Promise.resolve({}) }));

    expect(markup).toContain('name="password"');
    expect(markup).toContain('minLength="8"');
  });

  it("shows the matching safe message for each enforced password rule", async () => {
    const requiredMarkup = renderToStaticMarkup(await UpdatePasswordPage({ searchParams: Promise.resolve({ error: "password-required" }) }));
    const tooShortMarkup = renderToStaticMarkup(await UpdatePasswordPage({ searchParams: Promise.resolve({ error: "password-too-short" }) }));

    expect(requiredMarkup).toContain("Enter a new password.");
    expect(tooShortMarkup).toContain("Use a password with at least 8 characters.");
  });
});
