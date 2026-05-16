interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: BodyInit | null;
  json?: unknown;
}

export interface ApiErrorPayload {
  error?: string;
  error_description?: string;
  message?: string;
}

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload: ApiErrorPayload | null,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export async function apiRequest<TResponse>(url: string, options: ApiRequestOptions = {}): Promise<TResponse> {
  const { headers, json, ...requestOptions } = options;
  const response = await fetch(url, {
    credentials: "include",
    ...requestOptions,
    headers: buildHeaders(headers, json),
    body: json === undefined ? requestOptions.body : JSON.stringify(json),
  });

  if (!response.ok) {
    throw await createApiRequestError(response);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}

function buildHeaders(headers: HeadersInit | undefined, json: unknown) {
  if (json === undefined) {
    return headers;
  }

  return {
    "Content-Type": "application/json",
    ...headers,
  };
}

async function createApiRequestError(response: Response) {
  const payload = await readApiErrorPayload(response);
  const apiMessage = payload?.message ?? payload?.error_description ?? payload?.error;
  const message = apiMessage ?? `Request failed with HTTP ${response.status}.`;

  return new ApiRequestError(message, response.status, payload);
}

async function readApiErrorPayload(response: Response): Promise<ApiErrorPayload | null> {
  try {
    const data = await response.json() as ApiErrorPayload;
    if (!data.error && !data.error_description && !data.message) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}
