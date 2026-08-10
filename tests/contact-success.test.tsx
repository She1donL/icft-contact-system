import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ContactSuccessPage from "@/app/contact/success/page";

describe("contact success page", () => {
  it("reveals only the generic success message", () => {
    const markup = renderToStaticMarkup(<ContactSuccessPage />).toLowerCase();
    expect(markup).toContain("thank you. your information has been submitted successfully.");
    expect(markup).not.toContain("duplicate");
    expect(markup).not.toContain("record id");
    expect(markup).not.toContain("@example");
  });
});
