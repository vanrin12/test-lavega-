import { memo } from "react";

function AlertComponent({ children }: { children: string }) {
  return <div className="alert error" role="alert">{children}</div>;
}

export const Alert = memo(AlertComponent);
