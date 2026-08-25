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
});
