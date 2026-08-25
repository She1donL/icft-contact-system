import { describe, expect, it, vi } from "vitest";

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({ auth: { getUser: vi.fn(async () => ({ data: { user: null } })) } }),
}));

import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

describe("password recovery proxy behavior", () => {
  it("does not redirect an unauthenticated recovery page request", async () => {
    const response = await proxy(new NextRequest("https://icft.world/auth/update-password"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
