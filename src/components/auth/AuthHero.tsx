import { memo } from "react";

function AuthHeroComponent() {
  return (
    <div className="auth-hero" aria-hidden="true">
      <div className="auth-hero-pattern" />
      <div className="auth-hero-lock" />
    </div>
  );
}

export const AuthHero = memo(AuthHeroComponent);
