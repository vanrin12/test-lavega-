const PKCE_KEY = "lavega.auth.pkce.v1";

interface PendingAuth {
  state: string;
  verifier: string;
  createdAt: number;
}

export function clearSession() {
  sessionStorage.removeItem(PKCE_KEY);
}

export function savePendingAuth(pendingAuth: PendingAuth) {
  sessionStorage.setItem(PKCE_KEY, JSON.stringify(pendingAuth));
}

export function loadPendingAuth(): PendingAuth | null {
  const raw = sessionStorage.getItem(PKCE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PendingAuth;
  } catch {
    sessionStorage.removeItem(PKCE_KEY);
    return null;
  }
}

export function clearPendingAuth() {
  sessionStorage.removeItem(PKCE_KEY);
}
