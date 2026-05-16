import { completeGoogleSignIn, getCurrentSession, isSessionValid, logoutSession } from "./oauth";
import { API_ROUTES } from "../constants/apiRoutes";
import { savePendingAuth } from "./sessionStorage";
import { futureSession } from "../test/testUtils";

describe("oauth service", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_GOOGLE_CLIENT_ID", "client-id.apps.googleusercontent.com");
    vi.stubEnv("VITE_GOOGLE_REDIRECT_URI", "http://localhost:5173/auth/callback");
    vi.stubEnv("VITE_GOOGLE_SCOPES", "openid email profile");
  });

  it("validates sessions with a one-minute expiry skew", () => {
    expect(isSessionValid({ ...futureSession, expiresAt: Date.now() + 90_000 })).toBe(true);
    expect(isSessionValid({ ...futureSession, expiresAt: Date.now() + 30_000 })).toBe(false);
  });

  it("handles user cancellation from Google", async () => {
    await expect(completeGoogleSignIn("?error=access_denied")).rejects.toMatchObject({
      code: "access_denied",
      message: "Sign-in was cancelled before access was granted.",
    });
  });

  it("rejects missing pending auth state", async () => {
    await expect(completeGoogleSignIn("?code=abc&state=state")).rejects.toMatchObject({
      code: "missing_pending_auth",
    });
  });

  it("rejects invalid returned state", async () => {
    savePendingAuth({ state: "expected-state", verifier: "verifier", createdAt: Date.now() });

    await expect(completeGoogleSignIn("?code=abc&state=wrong-state")).rejects.toMatchObject({
      code: "invalid_state",
    });
  });

  it("exchanges a valid code for a backend session", async () => {
    savePendingAuth({ state: "expected-state", verifier: "verifier", createdAt: Date.now() });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => futureSession,
    });

    vi.stubGlobal("fetch", fetchMock);

    const session = await completeGoogleSignIn("?code=abc&state=expected-state");

    expect(session).toEqual(futureSession);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(API_ROUTES.googleCallback);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: "POST",
      credentials: "include",
    });
  });

  it("surfaces backend Google token errors safely", async () => {
    savePendingAuth({ state: "expected-state", verifier: "verifier", createdAt: Date.now() });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        error: "invalid_grant",
        error_description: "Bad Request",
      }),
    }));

    await expect(completeGoogleSignIn("?code=abc&state=expected-state")).rejects.toMatchObject({
      code: "invalid_grant",
      message: "Google OAuth error (invalid_grant): Bad Request",
    });
  });

  it("includes the HTTP status when the auth server returns a non-json error", async () => {
    savePendingAuth({ state: "expected-state", verifier: "verifier", createdAt: Date.now() });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Proxy error", { status: 500 })));

    await expect(completeGoogleSignIn("?code=abc&state=expected-state")).rejects.toMatchObject({
      code: "token_exchange_failed",
      message: "Google could not complete the token exchange. The auth server returned HTTP 500.",
    });
  });

  it("restores the current backend session", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => futureSession,
    }));

    await expect(getCurrentSession()).resolves.toEqual(futureSession);
  });

  it("returns null when no backend session exists", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      status: 401,
      ok: false,
      json: async () => ({ error: "no_session" }),
    }));

    await expect(getCurrentSession()).resolves.toBeNull();
  });

  it("calls the backend logout endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
    });
    vi.stubGlobal("fetch", fetchMock);

    await logoutSession();

    expect(fetchMock).toHaveBeenCalledWith(API_ROUTES.logout, {
      method: "POST",
      credentials: "include",
    });
  });
});
