import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentSession, logoutSession } from "../services/oauth";
import { clearSession } from "../services/sessionStorage";
import type { AuthSession } from "../types/auth";

type AuthStatus = "checking" | "authenticated" | "anonymous" | "logging_out";

interface AuthContextValue {
  error: string | null;
  status: AuthStatus;
  session: AuthSession | null;
  setAuthenticatedSession: (session: AuthSession) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [session, setSession] = useState<AuthSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const savedSession = await getCurrentSession();
        if (isMounted) {
          setError(null);
          setSession((currentSession) => currentSession ?? savedSession);
          setStatus((currentStatus) => {
            if (currentStatus === "authenticated" && !savedSession) {
              return currentStatus;
            }

            return savedSession ? "authenticated" : "anonymous";
          });
        }
      } catch {
        clearSession();
        if (isMounted) {
          setError("Could not restore the saved session. Please sign in again.");
          setSession(null);
          setStatus("anonymous");
        }
      }
    }

    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const setAuthenticatedSession = useCallback((nextSession: AuthSession) => {
    setError(null);
    setSession(nextSession);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    setStatus("logging_out");

    try {
      await logoutSession();
      clearSession();
      setSession(null);
      setStatus("anonymous");
    } catch {
      setError("Could not log out. Please check your connection and try again.");
      setStatus(session ? "authenticated" : "anonymous");
    }
  }, [session]);

  const value = useMemo(
    () => ({ error, status, session, setAuthenticatedSession, logout }),
    [error, logout, session, setAuthenticatedSession, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
