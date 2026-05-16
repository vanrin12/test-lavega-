import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

dotenv.config();

const app = express();
const port = Number(process.env.AUTH_SERVER_PORT || 8787);
const sessionCookieName = "lavega_session";
const sessions = new Map();

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
const EXPIRY_SKEW_MS = 60 * 1000;

app.use(express.json());
app.use(cookieParser());

app.post("/api/auth/google/callback", async (req, res) => {
  try {
    const { code, codeVerifier, redirectUri } = req.body ?? {};
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret || !process.env.VITE_GOOGLE_REDIRECT_URI) {
      return res.status(500).json({ error: "server_config_missing" });
    }

    if (!code || !codeVerifier || redirectUri !== process.env.VITE_GOOGLE_REDIRECT_URI) {
      return res.status(400).json({ error: "invalid_callback_payload" });
    }

    const tokenResponse = await exchangeCodeForTokens({
      clientId,
      clientSecret,
      code,
      codeVerifier,
      redirectUri,
    });
    const profile = await fetchUserProfile(tokenResponse.access_token);
    const expiresAt = Date.now() + tokenResponse.expires_in * 1000;
    const sessionId = randomUUID();

    sessions.set(sessionId, {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      expiresAt,
      profile,
    });

    setSessionCookie(res, sessionId, expiresAt);
    res.json(toPublicSession({ expiresAt, profile, refreshToken: tokenResponse.refresh_token }));
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.code || "google_auth_failed",
      error_description: error.message || "Google sign-in failed.",
    });
  }
});

app.get("/api/auth/session", async (req, res) => {
  const sessionId = req.cookies[sessionCookieName];
  const session = sessionId ? sessions.get(sessionId) : null;

  if (!sessionId || !session) {
    return res.status(401).json({ error: "no_session" });
  }

  if (session.expiresAt <= Date.now() + EXPIRY_SKEW_MS) {
    if (!session.refreshToken) {
      sessions.delete(sessionId);
      clearSessionCookie(res);
      return res.status(401).json({ error: "session_expired" });
    }

    try {
      const refreshed = await refreshAccessToken(session.refreshToken);
      session.accessToken = refreshed.access_token;
      session.expiresAt = Date.now() + refreshed.expires_in * 1000;
      setSessionCookie(res, sessionId, session.expiresAt);
    } catch {
      sessions.delete(sessionId);
      clearSessionCookie(res);
      return res.status(401).json({ error: "refresh_failed" });
    }
  }

  res.json(toPublicSession(session));
});

app.post("/api/auth/logout", (req, res) => {
  const sessionId = req.cookies[sessionCookieName];
  if (sessionId) sessions.delete(sessionId);
  clearSessionCookie(res);
  res.status(204).end();
});

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "api_route_not_found" });
});

const distPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");
app.use(express.static(distPath));
app.use((_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`Auth server listening on http://localhost:${port}`);
});

async function exchangeCodeForTokens({ clientId, clientSecret, code, codeVerifier, redirectUri }) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      code_verifier: codeVerifier,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw await createGoogleError(response);
  }

  return response.json();
}

async function refreshAccessToken(refreshToken) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.VITE_GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw await createGoogleError(response);
  }

  return response.json();
}

async function fetchUserProfile(accessToken) {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new HttpError("profile_fetch_failed", "Could not load the signed-in user's profile.", 502);
  }

  const data = await response.json();

  return {
    id: data.sub,
    name: data.name,
    email: data.email,
    picture: data.picture,
  };
}

async function createGoogleError(response) {
  try {
    const data = await response.json();
    return new HttpError(
      data.error || "google_token_error",
      data.error_description || "Google rejected the token request.",
      response.status,
    );
  } catch {
    return new HttpError("google_token_error", "Google rejected the token request.", response.status);
  }
}

function toPublicSession(session) {
  return {
    expiresAt: session.expiresAt,
    profile: session.profile,
    hasRefreshToken: Boolean(session.refreshToken),
  };
}

function setSessionCookie(res, sessionId, expiresAt) {
  res.cookie(sessionCookieName, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(expiresAt),
    path: "/",
  });
}

function clearSessionCookie(res) {
  res.clearCookie(sessionCookieName, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

class HttpError extends Error {
  constructor(code, message, statusCode) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}
