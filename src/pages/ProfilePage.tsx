import { useMemo } from "react";
import { Navigate } from "react-router-dom";
import { AccountInfoGrid } from "../components/profile/AccountInfoGrid";
import { ProfileSummaryCard } from "../components/profile/ProfileSummaryCard";
import { SessionDetailsCard } from "../components/profile/SessionDetailsCard";
import { APP_ROUTES } from "../constants/routes";
import { useAuth } from "../state/AuthContext";
import { formatSessionExpiry } from "../utils/date";

export function ProfilePage() {
  const { session, logout } = useAuth();

  if (!session) {
    return <Navigate to={APP_ROUTES.login} replace />;
  }

  const validUntil = useMemo(() => formatSessionExpiry(session.expiresAt), [session.expiresAt]);

  return (
    <main className="page profile-page">
      <div className="profile-layout">
        <ProfileSummaryCard profile={session.profile} onLogout={logout} />
        <section className="details-column" aria-label="Session and account details">
          <SessionDetailsCard validUntil={validUntil} />
          <AccountInfoGrid />
        </section>
      </div>
    </main>
  );
}
