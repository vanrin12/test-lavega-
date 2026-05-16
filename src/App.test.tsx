import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { App } from "./App";
import { API_ROUTES } from "./constants/apiRoutes";
import { APP_ROUTES, withSearch } from "./constants/routes";
import { savePendingAuth } from "./services/sessionStorage";
import { futureSession, renderWithRoute } from "./test/testUtils";

describe("App auth flow", () => {
  it("shows the login screen when no session exists", async () => {
    renderWithRoute(<App />, APP_ROUTES.login);

    expect(await screen.findByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in with google/i })).toBeEnabled();
  });

  it("shows a configuration error when Google OAuth env is missing", async () => {
    const user = userEvent.setup();
    vi.stubEnv("VITE_GOOGLE_CLIENT_ID", "");
    vi.stubEnv("VITE_GOOGLE_REDIRECT_URI", "");

    renderWithRoute(<App />, APP_ROUTES.login);

    await user.click(await screen.findByRole("button", { name: /sign in with google/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Missing Google OAuth configuration");
  });

  it("restores a valid saved session and displays the profile", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => futureSession,
    }));

    renderWithRoute(<App />, APP_ROUTES.profile);

    expect(await screen.findByRole("heading", { name: /lavega tester/i })).toBeInTheDocument();
    expect(screen.getByText("Lavega Tester")).toBeInTheDocument();
    expect(screen.getByText("tester@example.com")).toBeInTheDocument();
  });

  it("clears the saved session on logout", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === API_ROUTES.authSession) {
        return new Response(JSON.stringify(futureSession), { status: 200 });
      }

      return new Response(null, { status: 204 });
    }));

    renderWithRoute(<App />, APP_ROUTES.profile);
    await user.click(await screen.findByRole("button", { name: /logout/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    });
    expect(sessionStorage.length).toBe(0);
  });

  it("keeps the user signed in when backend logout fails", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === API_ROUTES.authSession) {
        return new Response(JSON.stringify(futureSession), { status: 200 });
      }

      return new Response(JSON.stringify({ error: "logout_failed" }), { status: 500 });
    }));

    renderWithRoute(<App />, APP_ROUTES.profile);
    await user.click(await screen.findByRole("button", { name: /logout/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not log out");
    expect(screen.getByRole("heading", { name: /lavega tester/i })).toBeInTheDocument();
  });

  it("shows cancellation errors returned to the callback route", async () => {
    renderWithRoute(<App />, withSearch(APP_ROUTES.authCallback, "error=access_denied&state=test"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Sign-in was cancelled before access was granted.",
    );
  });

  it("completes the callback once when rendered in React StrictMode", async () => {
    vi.stubEnv("VITE_GOOGLE_CLIENT_ID", "client-id.apps.googleusercontent.com");
    vi.stubEnv("VITE_GOOGLE_REDIRECT_URI", "http://localhost:5173/auth/callback");
    vi.stubEnv("VITE_GOOGLE_SCOPES", "openid email profile");
    savePendingAuth({ state: "expected-state", verifier: "verifier", createdAt: Date.now() });
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === API_ROUTES.googleCallback) {
        return new Response(JSON.stringify(futureSession), { status: 200 });
      }

      return new Response(JSON.stringify({ error: "no_session" }), { status: 401 });
    }));

    renderWithRoute(
      <StrictMode>
        <App />
      </StrictMode>,
      withSearch(APP_ROUTES.authCallback, "code=abc&state=expected-state"),
    );

    expect(await screen.findByRole("heading", { name: /lavega tester/i })).toBeInTheDocument();
    expect(screen.getByText("Lavega Tester")).toBeInTheDocument();
  });
});
