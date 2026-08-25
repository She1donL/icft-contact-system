import { describe, expect, it } from "vitest";
import { passwordValidationCategory, recoveryFailureCategory } from "@/lib/auth/recovery-diagnostics";

describe("password recovery diagnostics", () => {
  it("classifies PKCE verifier failures without exposing the provider error", () => {
    expect(recoveryFailureCategory({ code: "pkce_code_verifier_not_found" })).toBe("pkce");
    expect(recoveryFailureCategory({ code: "bad_code_verifier" })).toBe("pkce");
  });

  it("classifies expired recovery links separately from other code exchanges", () => {
    expect(recoveryFailureCategory({ code: "otp_expired" })).toBe("invalid-link");
    expect(recoveryFailureCategory({ code: "unexpected_failure" })).toBe("exchange");
    expect(recoveryFailureCategory(null)).toBe("exchange");
  });

  it("uses only the project password policy categories", () => {
    expect(passwordValidationCategory("")).toBe("password-required");
    expect(passwordValidationCategory("short")).toBe("password-too-short");
    expect(passwordValidationCategory("a-safe-new-password")).toBeNull();
  });
});
