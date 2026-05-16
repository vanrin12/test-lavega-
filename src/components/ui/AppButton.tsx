import { memo, type ButtonHTMLAttributes, type ReactNode } from "react";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  variant: "google" | "secondary" | "danger";
}

const buttonClassByVariant = {
  google: "google-button",
  secondary: "secondary-button",
  danger: "logout-button",
};

function AppButtonComponent({ children, className, icon, variant, ...props }: AppButtonProps) {
  const resolvedClassName = [buttonClassByVariant[variant], className].filter(Boolean).join(" ");

  return (
    <button className={resolvedClassName} type="button" {...props}>
      {icon}
      {children}
    </button>
  );
}

export const AppButton = memo(AppButtonComponent);
