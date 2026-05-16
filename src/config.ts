export interface AppConfig {
  clientId: string;
  redirectUri: string;
  scopes: string;
}

export function getConfig(): AppConfig {
  const config = {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/callback`,
    scopes: import.meta.env.VITE_GOOGLE_SCOPES || "openid email profile",
  };

  if (!config.clientId || !config.redirectUri) {
    throw new Error("Missing Google OAuth configuration. Check your .env file.");
  }

  return config;
}
