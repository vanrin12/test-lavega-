import type { ReactNode } from "react";

function Icon({ children, className = "ui-icon", viewBox = "0 0 24 24" }: { children: ReactNode; className?: string; viewBox?: string }) {
  return <svg className={className} viewBox={viewBox} aria-hidden="true">{children}</svg>;
}

export function GoogleIcon() {
  return (
    <svg className="google-icon" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285f4" d="M17.64 9.2c0-.64-.06-1.26-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.58 2.68-3.9 2.68-6.62z" />
      <path fill="#34a853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.33-1.58-5.04-3.72H.94v2.33A9 9 0 0 0 9 18z" />
      <path fill="#fbbc05" d="M3.96 10.7A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.16.28-1.7V4.97H.94A9 9 0 0 0 0 9c0 1.45.34 2.82.94 4.03l3.02-2.33z" />
      <path fill="#ea4335" d="M9 3.58c1.32 0 2.5.45 3.43 1.34l2.59-2.58A8.66 8.66 0 0 0 9 0 9 9 0 0 0 .94 4.97L3.96 7.3C4.67 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

export function ShieldIcon() {
  return (
    <Icon className="security-icon" viewBox="0 0 18 20">
      <path d="M9 1.6 15.5 4v5.1c0 4.1-2.65 7.75-6.5 9.05-3.85-1.3-6.5-4.95-6.5-9.05V4L9 1.6z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="m6.4 9.7 1.7 1.7 3.6-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function PencilIcon() {
  return <Icon className="avatar-icon"><path d="M16.8 4.7 19.3 7.2 8.8 17.7 5.5 18.5l.8-3.3L16.8 4.7z" /></Icon>;
}

export function GearIcon() {
  return <Icon><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm8 3.5-2.1-.7-.5-1.2 1-2-2.4-2.4-2 1-1.2-.5L12 4h-3l-.7 2.2-1.2.5-2-1-2.4 2.4 1 2-.5 1.2L1 12v3l2.2.7.5 1.2-1 2 2.4 2.4 2-1 1.2.5L9 23h3l.8-2.2 1.2-.5 2 1 2.4-2.4-1-2 .5-1.2L20 15v-3z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
}

export function LogoutIcon() {
  return <Icon><path d="M10 17 15 12l-5-5M15 12H3M12 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
}

export function TerminalIcon() {
  return <Icon><path d="m5 8 4 4-4 4M11 16h8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
}

export function KeyIcon() {
  return <Icon><path d="M7.5 14a3.5 3.5 0 1 1 3.1-5.1L22 8v3h-3v3h-3v2h-3.4A3.5 3.5 0 0 1 7.5 14z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
}

export function ClockIcon() {
  return <Icon><path d="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
}

export function TokenIcon() {
  return <Icon><path d="M8 3h8l4 4v14H8V3zM16 3v5h4M4 7v14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
}

export function HistoryIcon() {
  return <Icon className="info-icon blue"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 7v6l4 2" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
}

export function ShieldStatusIcon() {
  return <Icon className="info-icon amber"><path d="M12 2.5 19 5v6.1c0 4.4-2.8 8.3-7 9.7-4.2-1.4-7-5.3-7-9.7V5l7-2.5z" fill="none" stroke="currentColor" strokeWidth="1.9" /><path d="m8.8 11.8 2 2 4.4-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
}

export function CheckIcon() {
  return <Icon className="check-icon"><path d="m7 12 3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
}
