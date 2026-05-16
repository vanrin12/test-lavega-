import { memo } from "react";
import { ShieldIcon } from "../ui/icons";

function SecurityProtocolCardComponent() {
  return (
    <aside className="security-card" aria-label="Security protocol">
      <ShieldIcon />
      <div>
        <h2>Security Protocol</h2>
        <p>
          We utilize <code>PKCE-based OAuth2</code> for enhanced security. No credentials are stored locally.
        </p>
      </div>
    </aside>
  );
}

export const SecurityProtocolCard = memo(SecurityProtocolCardComponent);
