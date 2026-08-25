import { describe, expect, it } from "vitest";
import {
  passwordRecoveryCallbackUrl,
  passwordRecoveryDestination,
  safeRecoveryNextPath,
} from "@/lib/auth/password-recovery";

describe("password recovery flow", () => {
  it("sends recovery emails to the PKCE callback with the update-password destination", () => {
    expect(passwordRecoveryCallbackUrl("https://icft.world/")).toBe(
      "https://icft.world/auth/callback?next=%2Fauth%2Fupdate-password",
    );
  });

  it("normalizes the development base URL without changing the recovery destination", () => {
    expect(passwordRecoveryCallbackUrl("http://localhost:3000")).toBe(
      "http://localhost:3000/auth/callback?next=%2Fauth%2Fupdate-password",
    );
  });

  it("never lets recovery links redirect outside the password-update page", () => {
    expect(safeRecoveryNextPath("/auth/update-password")).toBe("/auth/update-password");
    expect(safeRecoveryNextPath("/admin")).toBe("/auth/update-password");
    expect(safeRecoveryNextPath("https://evil.example")).toBe("/auth/update-password");
    expect(safeRecoveryNextPath("//evil.example")).toBe("/auth/update-password");
  });

  it("keeps invalid recovery links on the update-password page with a safe error", () => {
    expect(passwordRecoveryDestination(false)).toBe("/auth/update-password?error=recovery");
    expect(passwordRecoveryDestination(true)).toBe("/auth/update-password");
  });
});
