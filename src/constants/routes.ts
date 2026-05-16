export const APP_ROUTES = {
  root: "/",
  login: "/login",
  authCallback: "/auth/callback",
  profile: "/profile",
  wildcard: "*",
} as const;

export function withSearch(path: string, search: string) {
  return `${path}${search.startsWith("?") ? search : `?${search}`}`;
}
