import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBoundary } from "./ErrorBoundary";

function BrokenComponent() {
  throw new Error("Render failed");
  return null;
}

describe("ErrorBoundary", () => {
  it("renders a safe fallback when a child throws", () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
    expect(screen.getByText(/tokens and session details were not printed/i)).toBeInTheDocument();
  });

  it("can reset the fallback", async () => {
    const user = userEvent.setup();

    function RecoverableChild() {
      if (!window.sessionStorage.getItem("healthy")) {
        throw new Error("First render failed");
      }

      return <p>Recovered UI</p>;
    }

    render(
      <ErrorBoundary>
        <RecoverableChild />
      </ErrorBoundary>,
    );

    window.sessionStorage.setItem("healthy", "true");
    await user.click(screen.getByRole("button", { name: /try again/i }));

    expect(screen.getByText("Recovered UI")).toBeInTheDocument();
  });
});
