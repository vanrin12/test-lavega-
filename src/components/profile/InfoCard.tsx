import { memo, type ReactNode } from "react";

interface InfoCardProps {
  action?: ReactNode;
  children?: ReactNode;
  icon: ReactNode;
  title: string;
  description: string;
}

function InfoCardComponent({ action, children, description, icon, title }: InfoCardProps) {
  return (
    <article className="info-card">
      <div>
        {icon}
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {action ?? children}
    </article>
  );
}

export const InfoCard = memo(InfoCardComponent);
