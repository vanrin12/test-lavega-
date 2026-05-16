import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { AuthSession } from "../types/auth";

export const futureSession: AuthSession = {
  expiresAt: Date.now() + 60 * 60 * 1000,
  hasRefreshToken: true,
  profile: {
    id: "user-1",
    name: "Lavega Tester",
    email: "tester@example.com",
    picture: "https://example.com/avatar.png",
  },
};

export function renderWithRoute(ui: React.ReactElement, route = "/") {
  window.history.pushState({}, "Test page", route);

  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>,
  );
}
