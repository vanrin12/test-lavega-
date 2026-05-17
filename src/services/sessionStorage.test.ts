import { clearSession } from "./sessionStorage";

describe("sessionStorage service", () => {
  it("clears legacy pending auth state", () => {
    sessionStorage.setItem("lavega.auth.pkce.v1", "legacy-pending-auth");

    clearSession();

    expect(sessionStorage.getItem("lavega.auth.pkce.v1")).toBeNull();
  });
});
