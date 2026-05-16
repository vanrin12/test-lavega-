const sessionExpiryFormatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatSessionExpiry(expiresAt: number) {
  return sessionExpiryFormatter.format(new Date(expiresAt));
}
