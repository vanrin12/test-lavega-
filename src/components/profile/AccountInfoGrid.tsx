import { memo } from "react";
import { CheckIcon, HistoryIcon, ShieldStatusIcon } from "../ui/icons";
import { InfoCard } from "./InfoCard";

function AccountInfoGridComponent() {
  return (
    <div className="info-grid">
      <InfoCard
        icon={<HistoryIcon />}
        title="Login History"
        description="Recent access attempts and IP addresses recorded for this profile."
        action={<a href="/">View all logs →</a>}
      />
      <InfoCard
        icon={<ShieldStatusIcon />}
        title="2FA Status"
        description="Your account is currently protected by Google account authentication."
      >
        <strong><CheckIcon /> Enabled</strong>
      </InfoCard>
    </div>
  );
}

export const AccountInfoGrid = memo(AccountInfoGridComponent);
