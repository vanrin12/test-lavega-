import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentSession, logoutSession } from "../services/oauth";
import { clearSession } from "../services/sessionStorage";
import type { AuthSession } from "../types/auth";

type AuthStatus = "checking" | "authenticated" | "anonymous";

interface AuthContextValue {
  status: AuthStatus;
  session: AuthSession | null;
  setAuthenticatedSession: (session: AuthSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const savedSession = await getCurrentSession();
        if (isMounted) {
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
    setSession(nextSession);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(() => {
    void logoutSession();
    clearSession();
    setSession(null);
    setStatus("anonymous");
  }, []);

  const value = useMemo(
    () => ({ status, session, setAuthenticatedSession, logout }),
    [logout, session, setAuthenticatedSession, status],
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
