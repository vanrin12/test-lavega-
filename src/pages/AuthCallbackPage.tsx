import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../constants/routes";
import { completeGoogleSignIn } from "../services/oauth";
import { useAuth } from "../state/AuthContext";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { setAuthenticatedSession } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const hasHandledCallback = useRef(false);

  useEffect(() => {
    if (hasHandledCallback.current) return;
    hasHandledCallback.current = true;

    async function finishSignIn() {
      try {
        const session = await completeGoogleSignIn(window.location.search);
        setAuthenticatedSession(session);
        navigate(APP_ROUTES.profile, { replace: true });
      } catch (caughtError) {
        const message = caughtError instanceof Error ? caughtError.message : "Google sign-in failed.";
        setError(message);
        navigate(APP_ROUTES.login, { replace: true, state: { error: message } });
      }
    }

    void finishSignIn();
  }, [navigate, setAuthenticatedSession]);

  return (
    <main id="main-content" className="page">
      <section className="panel callback-panel" aria-live="polite">
        <div className="spinner" aria-hidden="true" />
        <h1>Completing sign-in</h1>
        <p>{error ?? "Verifying Google response and loading your profile…"}</p>
      </section>
    </main>
  );
}
