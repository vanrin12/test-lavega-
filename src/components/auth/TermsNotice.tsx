import { memo } from "react";

function TermsNoticeComponent() {
  return (
    <p className="terms-copy">
      By continuing, you agree to our <a href="/">Terms of Service</a> and{" "}
      <a href="/">Privacy Policy</a>.
    </p>
  );
}

export const TermsNotice = memo(TermsNoticeComponent);
