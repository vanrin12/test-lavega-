import { memo, type ReactNode } from "react";

interface DetailFieldProps {
  icon: ReactNode;
  label: string;
  value: string;
  wide?: boolean;
}

function DetailFieldComponent({ icon, label, value, wide }: DetailFieldProps) {
  return (
    <div className={wide ? "detail-field detail-field-wide" : "detail-field"}>
      <dt>{label}</dt>
      <dd>
        {icon}
        <span>{value}</span>
      </dd>
    </div>
  );
}

export const DetailField = memo(DetailFieldComponent);
