import { memo } from "react";
import { AppButton } from "../ui/AppButton";
import { GearIcon, LogoutIcon, PencilIcon } from "../ui/icons";
import type { UserProfile } from "../../types/auth";

interface ProfileSummaryCardProps {
  profile: UserProfile;
  onLogout: () => void;
}

function ProfileSummaryCardComponent({ onLogout, profile }: ProfileSummaryCardProps) {
  return (
    <section className="profile-card" aria-labelledby="profile-title">
      <div className="avatar-frame">
        <img className="avatar" src={profile.picture} alt={`${profile.name}'s profile`} />
        <span className="avatar-action" aria-hidden="true">
          <PencilIcon />
        </span>
      </div>
      <h1 id="profile-title">{profile.name}</h1>
      <p>{profile.email}</p>
      <div className="profile-actions">
        <AppButton variant="secondary" icon={<GearIcon />}>
          Edit Account
        </AppButton>
        <AppButton variant="danger" icon={<LogoutIcon />} onClick={onLogout}>
          Logout
        </AppButton>
      </div>
    </section>
  );
}

export const ProfileSummaryCard = memo(ProfileSummaryCardComponent);
