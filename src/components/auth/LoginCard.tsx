import { memo } from "react";
import { Alert } from "../ui/Alert";
import { AppButton } from "../ui/AppButton";
import { GoogleIcon } from "../ui/icons";
import { AuthHero } from "./AuthHero";
import { SecurityProtocolCard } from "./SecurityProtocolCard";
import { SsoDivider } from "./SsoDivider";
import { TermsNotice } from "./TermsNotice";

interface LoginCardProps {
  error: string | null;
  isLoading: boolean;
  onSignIn: () => void;
}

function LoginCardComponent({ error, isLoading, onSignIn }: LoginCardProps) {
  return (
    <section className="auth-card" aria-labelledby="login-title">
      <AuthHero />
      <div className="auth-content">
        <div className="auth-intro">
          <h1 id="login-title">Welcome Back</h1>
          <p className="lead">
            Your unified gateway for professional technical assessment and secure access management.
          </p>
        </div>

        {error ? <Alert>{error}</Alert> : null}

        <AppButton
          variant="google"
          icon={<GoogleIcon />}
          onClick={onSignIn}
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? "Redirecting…" : "Sign in with Google"}
        </AppButton>

        <SsoDivider />
        <SecurityProtocolCard />
        <TermsNotice />
      </div>
    </section>
  );
}

export const LoginCard = memo(LoginCardComponent);
