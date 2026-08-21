import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProspectSaveMessage } from "@/components/admin/prospect-save-message";

describe("Research Prospect save success message", () => {
  it("announces successful create and update saves accessibly", () => {
    const markup = renderToStaticMarkup(<ProspectSaveMessage />);

    expect(markup).toContain('role="status"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain("Thanks! Research Prospect saved successfully.");
  });
});
