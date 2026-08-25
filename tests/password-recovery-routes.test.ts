import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  getUser: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn(async () => ({ auth })) }));
vi.mock("next/navigation", () => ({ redirect: vi.fn((path: string) => { throw new Error(`redirect:${path}`); }) }));
vi.mock("next/server", () => ({
  NextResponse: { redirect: (url: URL) => new Response(null, { status: 307, headers: { location: url.toString() } }) },
}));

import { GET as callback } from "@/app/auth/callback/route";
import { requestPasswordReset } from "@/app/auth/forgot-password/actions";
import { updatePassword } from "@/app/auth/update-password/actions";

describe("password recovery routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.exchangeCodeForSession.mockResolvedValue({ error: null });
    auth.getUser.mockResolvedValue({ data: { user: { id: "user-id" } } });
    auth.updateUser.mockResolvedValue({ error: null });
    process.env.NEXT_PUBLIC_APP_URL = "https://connect.icft.world";
  });

  it("requests a reset email with the default hosted template PKCE callback destination", async () => {
    const formData = new FormData();
    formData.set("email", "admin@icft.world");

    await expect(requestPasswordReset(formData)).rejects.toThrow("redirect:/auth/forgot-password?sent=1");
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith("admin@icft.world", {
      redirectTo: "https://connect.icft.world/auth/callback?next=%2Fauth%2Fupdate-password",
    });
  });

  it("exchanges the default hosted template PKCE code before redirecting to update-password", async () => {
    const response = await callback(new Request("https://connect.icft.world/auth/callback?code=recovery-code&next=/auth/update-password"));

    expect(auth.exchangeCodeForSession).toHaveBeenCalledWith("recovery-code");
    expect(response.headers.get("location")).toBe("https://connect.icft.world/auth/update-password");
  });

  it("does not let a PKCE callback redirect recovery users externally", async () => {
    const response = await callback(new Request("https://connect.icft.world/auth/callback?code=recovery-code&next=https://evil.example"));

    expect(response.headers.get("location")).toBe("https://connect.icft.world/admin");
  });

  it("fails a rejected PKCE recovery code at the password-update page", async () => {
    auth.exchangeCodeForSession.mockResolvedValue({ error: { code: "pkce_code_verifier_not_found" } });
    const response = await callback(new Request("https://connect.icft.world/auth/callback?code=expired&next=/auth/update-password"));

    expect(response.headers.get("location")).toBe("https://connect.icft.world/auth/update-password?error=pkce");
  });

  it("updates only an authenticated user password and returns to login", async () => {
    const formData = new FormData();
    formData.set("password", "a-safe-new-password");

    await expect(updatePassword(formData)).rejects.toThrow("redirect:/admin/login?reset=1");
    expect(auth.updateUser).toHaveBeenCalledWith({ password: "a-safe-new-password" });
  });

  it("rejects a password update when the recovery session is missing", async () => {
    auth.getUser.mockResolvedValue({ data: { user: null } });
    const formData = new FormData();
    formData.set("password", "a-safe-new-password");

    await expect(updatePassword(formData)).rejects.toThrow("redirect:/auth/update-password?error=missing-session");
    expect(auth.updateUser).not.toHaveBeenCalled();
  });
});
