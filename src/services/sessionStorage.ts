const PKCE_KEY = "lavega.auth.pkce.v1";

export function clearSession() {
  sessionStorage.removeItem(PKCE_KEY);
}
