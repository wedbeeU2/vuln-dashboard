import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {}
}));

vi.mock("@next-auth/prisma-adapter", () => ({
  PrismaAdapter: vi.fn(() => ({ adapter: "prisma" }))
}));

describe("authOptions", () => {
  const originalGoogleClientId = process.env.GOOGLE_CLIENT_ID;
  const originalGoogleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    restoreEnvValue("GOOGLE_CLIENT_ID", originalGoogleClientId);
    restoreEnvValue("GOOGLE_CLIENT_SECRET", originalGoogleClientSecret);
  });

  it("uses Google database sessions and adds the user id to the session", async () => {
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

  it("fails clearly when Google OAuth credentials are missing", async () => {
    delete process.env.GOOGLE_CLIENT_ID;
    process.env.GOOGLE_CLIENT_SECRET = "google-client-secret";

    await expect(import("@/lib/auth")).rejects.toThrow(
      "Missing required environment variable: GOOGLE_CLIENT_ID"
    );
  });
});

function restoreEnvValue(key: "GOOGLE_CLIENT_ID" | "GOOGLE_CLIENT_SECRET", value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}
