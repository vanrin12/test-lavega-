import {
  clearPendingAuth,
  clearSession,
  loadPendingAuth,
  savePendingAuth,
} from "./sessionStorage";

describe("sessionStorage service", () => {
  it("clears pending auth state", () => {
    savePendingAuth({ state: "state", verifier: "verifier", createdAt: Date.now() });

    clearSession();

    expect(loadPendingAuth()).toBeNull();
  });

  it("saves and clears pending PKCE auth state", () => {
    const pendingAuth = { state: "state", verifier: "verifier", createdAt: Date.now() };

    savePendingAuth(pendingAuth);
    expect(loadPendingAuth()).toEqual(pendingAuth);

    clearPendingAuth();
    expect(loadPendingAuth()).toBeNull();
  });
});
