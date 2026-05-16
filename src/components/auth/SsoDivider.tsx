import { memo } from "react";

function SsoDividerComponent() {
  return (
    <div className="sso-divider" aria-hidden="true">
      <span />
      <strong>Secure SSO</strong>
      <span />
    </div>
  );
}

export const SsoDivider = memo(SsoDividerComponent);
