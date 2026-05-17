import { getConfig } from "../config";
import { API_ROUTES } from "../constants/apiRoutes";
import type { AuthSession } from "../types/auth";
import { apiRequest, ApiRequestError } from "./apiClient";

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

  try {
    const { authorizationUrl } = await apiRequest<{ authorizationUrl: string }>(API_ROUTES.googleStart, {
      method: "POST",
      json: {
        redirectUri: config.redirectUri,
      },
    });

    window.location.assign(authorizationUrl);
  } catch (caughtError) {
    throw toAuthError(caughtError, "Could not start Google sign-in.", "google_start_failed");
  }
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

  if (!returnedState) {
    throw new AuthError("The sign-in response could not be verified.", "invalid_state");
  }

  return exchangeCodeForSession(code, returnedState);
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

async function exchangeCodeForSession(code: string, state: string): Promise<AuthSession> {
  const config = getConfig();

  try {
    return await apiRequest<AuthSession>(API_ROUTES.googleCallback, {
      method: "POST",
      json: {
        code,
        state,
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
