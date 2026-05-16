import { useCallback, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LoginCard } from "../components/auth/LoginCard";
import { getConfig } from "../config";
import { APP_ROUTES } from "../constants/routes";
import { startGoogleSignIn } from "../services/oauth";
import { useAuth } from "../state/AuthContext";

export function LoginPage() {
  const { session, status } = useAuth();
  const location = useLocation();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(location.state?.error ?? null);

  if (status === "authenticated" && session) {
    return <Navigate to={APP_ROUTES.profile} replace />;
  }

  const handleSignIn = useCallback(async () => {
    setError(null);
    setIsStarting(true);

    try {
      getConfig();
      await startGoogleSignIn();
    } catch (caughtError) {
      setIsStarting(false);
      setError(caughtError instanceof Error ? caughtError.message : "Could not start Google sign-in.");
    }
  }, []);

  return (
    <main className="page auth-page">
      <LoginCard error={error} isLoading={isStarting} onSignIn={handleSignIn} />
    </main>
  );
}
