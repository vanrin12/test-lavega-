import "@testing-library/jest-dom/vitest";

import { API_ROUTES } from "../constants/apiRoutes";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);

    if (url === API_ROUTES.authSession) {
      return new Response(JSON.stringify({ error: "no_session" }), { status: 401 });
    }

    if (url === API_ROUTES.logout) {
      return new Response(null, { status: 204 });
    }

    return new Response(JSON.stringify({ error: "not_mocked" }), { status: 500 });
  }));
});
