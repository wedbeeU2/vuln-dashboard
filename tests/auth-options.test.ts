import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {}
}));

vi.mock("@next-auth/prisma-adapter", () => ({
  PrismaAdapter: vi.fn(() => ({ adapter: "prisma" }))
}));

describe("authOptions", () => {
  it("uses Google database sessions and adds the user id to the session", async () => {
    vi.resetModules();
    process.env.GOOGLE_CLIENT_ID = "google-client-id";
    process.env.GOOGLE_CLIENT_SECRET = "google-client-secret";

    const { authOptions } = await import("@/lib/auth");
    const sessionCallback = authOptions.callbacks?.session;

    expect(authOptions.session?.strategy).toBe("database");
    expect(authOptions.pages?.signIn).toBe("/");
    expect(authOptions.providers).toHaveLength(1);
    expect(authOptions.providers[0].id).toBe("google");
    expect(sessionCallback).toBeDefined();

    const session = await sessionCallback?.({
      session: {
        user: {
          email: "user@example.com",
          image: null,
          name: "Example User"
        },
        expires: new Date("2030-01-01").toISOString()
      },
      user: {
        email: "user@example.com",
        emailVerified: null,
        id: "user_123",
        image: null,
        name: "Example User"
      },
      newSession: undefined,
      trigger: "update"
    });

    expect(session?.user?.id).toBe("user_123");
  });
});
