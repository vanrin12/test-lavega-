import { apiRequest, ApiRequestError } from "./apiClient";

describe("api client", () => {
  it("sends JSON requests with credentials included by default", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiRequest<{ ok: boolean }>("/api/test", {
      method: "POST",
      json: { name: "Lavega" },
    })).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledWith("/api/test", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Lavega" }),
    });
  });

  it("returns undefined for empty successful responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));

    await expect(apiRequest<void>("/api/logout", { method: "POST" })).resolves.toBeUndefined();
  });

  it("throws typed API errors with parsed response payloads", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        error: "invalid_request",
        error_description: "Missing required field.",
      }), { status: 400 }),
    ));

    await expect(apiRequest("/api/test")).rejects.toMatchObject({
      name: "ApiRequestError",
      status: 400,
      payload: {
        error: "invalid_request",
        error_description: "Missing required field.",
      },
    });
  });
});
