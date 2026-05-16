import { memo } from "react";
import { Alert } from "../ui/Alert";
import { AppButton } from "../ui/AppButton";
import { GearIcon, LogoutIcon, PencilIcon } from "../ui/icons";
import type { UserProfile } from "../../types/auth";

interface ProfileSummaryCardProps {
  error: string | null;
  isLoggingOut: boolean;
  profile: UserProfile;
  onLogout: () => Promise<void>;
}

function ProfileSummaryCardComponent({ error, isLoggingOut, onLogout, profile }: ProfileSummaryCardProps) {
  return (
    <section className="profile-card" aria-labelledby="profile-title">
      <div className="avatar-frame">
        <img className="avatar" src={profile.picture} alt={`${profile.name}'s profile`} width="128" height="128" />
        <span className="avatar-action" aria-hidden="true">
          <PencilIcon />
        </span>
      </div>
      <h1 id="profile-title">{profile.name}</h1>
      <p>{profile.email}</p>
      {error ? <Alert>{error}</Alert> : null}
      <div className="profile-actions">
        <AppButton variant="secondary" icon={<GearIcon />}>
          Edit Account
        </AppButton>
        <AppButton
          variant="danger"
          icon={<LogoutIcon />}
          onClick={onLogout}
          disabled={isLoggingOut}
          aria-busy={isLoggingOut}
        >
          {isLoggingOut ? "Logging out…" : "Logout"}
        </AppButton>
      </div>
    </section>
  );
}

export const ProfileSummaryCard = memo(ProfileSummaryCardComponent);
