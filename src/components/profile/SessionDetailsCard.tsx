import { memo } from "react";
import { ClockIcon, KeyIcon, TerminalIcon, TokenIcon } from "../ui/icons";
import { DetailField } from "./DetailField";

interface SessionDetailsCardProps {
  validUntil: string;
}

function SessionDetailsCardComponent({ validUntil }: SessionDetailsCardProps) {
  return (
    <article className="session-card">
      <header className="section-header">
        <div>
          <TerminalIcon />
          <h2>Session Details</h2>
        </div>
        <span>Active</span>
      </header>
      <div className="session-grid">
        <DetailField label="Auth Scope" value="Profile, Email, OpenID" icon={<KeyIcon />} />
        <DetailField label="Valid Until" value={validUntil} icon={<ClockIcon />} />
        <DetailField label="Session Store" value="HttpOnly cookie, tokens held server-side" icon={<TokenIcon />} wide />
      </div>
    </article>
  );
}

export const SessionDetailsCard = memo(SessionDetailsCardComponent);
