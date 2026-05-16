import { getConfig } from "../config";
import { API_ROUTES } from "../constants/apiRoutes";
import type { AuthSession } from "../types/auth";
import { apiRequest, ApiRequestError } from "./apiClient";
import { clearPendingAuth, loadPendingAuth, savePendingAuth } from "./sessionStorage";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const PENDING_AUTH_MAX_AGE_MS = 10 * 60 * 1000;
const EXPIRY_SKEW_MS = 60 * 1000;

export class AuthError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "AuthError";
  }
}

export function isSessionValid(session: AuthSession) {
  return session.expiresAt > Date.now() + EXPIRY_SKEW_MS;
}

export async function startGoogleSignIn() {
  const config = getConfig();
  const state = generateRandomString();
  const verifier = generateCodeVerifier();
  const challenge = await createCodeChallenge(verifier);

  savePendingAuth({ state, verifier, createdAt: Date.now() });

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: config.scopes,
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    access_type: "offline",
    prompt: "consent",
  });

  window.location.assign(`${GOOGLE_AUTH_URL}?${params.toString()}`);
}

export async function completeGoogleSignIn(search: string): Promise<AuthSession> {
  const params = new URLSearchParams(search);
  const error = params.get("error");
  if (error) {
    throw new AuthError(getOAuthErrorMessage(error), error);
  }

  const code = params.get("code");
  const returnedState = params.get("state");
  if (!code) {
    throw new AuthError("Google did not return an authorization code.", "missing_code");
  }

  const pendingAuth = loadPendingAuth();
  clearPendingAuth();

  if (!pendingAuth) {
    throw new AuthError("The sign-in request expired. Please try again.", "missing_pending_auth");
  }

  if (Date.now() - pendingAuth.createdAt > PENDING_AUTH_MAX_AGE_MS) {
    throw new AuthError("The sign-in request expired. Please try again.", "expired_pending_auth");
  }

  if (!returnedState || returnedState !== pendingAuth.state) {
    throw new AuthError("The sign-in response could not be verified.", "invalid_state");
  }

  return exchangeCodeForSession(code, pendingAuth.verifier);
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  try {
    return await apiRequest<AuthSession>(API_ROUTES.authSession);
  } catch (caughtError) {
    if (caughtError instanceof ApiRequestError && caughtError.status === 401) {
      return null;
    }

    throw toAuthError(caughtError, "Could not restore the saved session.", "session_restore_failed");
  }
}

export async function logoutSession() {
  await apiRequest<void>(API_ROUTES.logout, {
    method: "POST",
  });
}

async function exchangeCodeForSession(code: string, verifier: string): Promise<AuthSession> {
  const config = getConfig();

  try {
    return await apiRequest<AuthSession>(API_ROUTES.googleCallback, {
      method: "POST",
      json: {
        code,
        codeVerifier: verifier,
        redirectUri: config.redirectUri,
      },
    });
  } catch (caughtError) {
    throw toAuthError(caughtError, "Google could not complete the token exchange.", "token_exchange_failed");
  }
}

function getOAuthErrorMessage(error: string) {
  if (error === "access_denied") {
    return "Sign-in was cancelled before access was granted.";
  }

  return "Google sign-in failed. Please try again.";
}

function toAuthError(caughtError: unknown, fallbackMessage: string, fallbackCode: string) {
  if (!(caughtError instanceof ApiRequestError)) {
    return new AuthError(fallbackMessage, fallbackCode);
  }

  const apiError = caughtError.payload;
  if (apiError?.error) {
    const description = apiError.error_description ? `: ${apiError.error_description}` : "";
    return new AuthError(`Google OAuth error (${apiError.error})${description}`, apiError.error);
  }

  return new AuthError(`${fallbackMessage} The auth server returned HTTP ${caughtError.status}.`, fallbackCode);
}

function generateCodeVerifier() {
  return base64UrlEncode(crypto.getRandomValues(new Uint8Array(64)));
}

function generateRandomString() {
  return base64UrlEncode(crypto.getRandomValues(new Uint8Array(32)));
}

async function createCodeChallenge(verifier: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64UrlEncode(new Uint8Array(digest));
}

function base64UrlEncode(bytes: Uint8Array) {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
