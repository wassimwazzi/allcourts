export const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, content-type, idempotency-key, stripe-signature, x-request-id, x-stripe-event-id, x-stripe-event-type",
  "access-control-allow-methods": "POST, OPTIONS",
};

type ResponseOptions = {
  headers?: HeadersInit;
  requestId?: string;
};

export class HttpError extends Error {
  status: number;
  code: string;
  details: unknown;

  constructor(status: number, code: string, message: string, details: unknown = null) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function withHeaders(headers?: HeadersInit, requestId?: string): Headers {
  const merged = new Headers(corsHeaders);
  if (headers) {
    new Headers(headers).forEach((value, key) => merged.set(key, value));
  }
  if (requestId) {
    merged.set("x-request-id", requestId);
  }
  return merged;
}

export function json(status: number, body: unknown, options: ResponseOptions = {}): Response {
  const headers = withHeaders(options.headers, options.requestId);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers,
  });
}

export function empty(status = 204, options: ResponseOptions = {}): Response {
  return new Response(null, {
    status,
    headers: withHeaders(options.headers, options.requestId),
  });
}

export function methodNotAllowed(allowed: string[], options: ResponseOptions = {}): Response {
  const headers = withHeaders(options.headers, options.requestId);
  headers.set("allow", allowed.join(", "));
  return new Response("Method not allowed", {
    status: 405,
    headers,
  });
}

export function errorResponse(error: unknown, fallbackStatus = 500, requestId?: string): Response {
  if (error instanceof HttpError) {
    return json(error.status, {
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        requestId,
      },
    }, { requestId });
  }

  console.error(error);

  return json(fallbackStatus, {
    error: {
      code: fallbackStatus >= 500 ? "internal_error" : "request_error",
      message: fallbackStatus >= 500
        ? "Unexpected server error."
        : error instanceof Error
          ? error.message
          : "Unexpected request error.",
      details: null,
      requestId,
    },
  }, { requestId });
}

export function badRequest(message: string, details?: unknown, requestId?: string): Response {
  return errorResponse(new HttpError(400, "bad_request", message, details), 400, requestId);
}

export async function readJson<T>(request: Request): Promise<T> {
  const rawBody = await request.text();
  if (!rawBody.trim()) {
    throw new HttpError(400, "invalid_json", "Expected a JSON request body.");
  }

  try {
    return JSON.parse(rawBody) as T;
  } catch (error) {
    throw new HttpError(400, "invalid_json", "Expected a valid JSON request body.", {
      cause: error instanceof Error ? error.message : null,
    });
  }
}

export function parseJsonObject(rawBody: string): Record<string, unknown> {
  if (!rawBody.trim()) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawBody);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return { value: parsed };
  } catch {
    return { rawPayload: rawBody };
  }
}

export function getBearerToken(request: Request): string | null {
  const header = getTrimmedHeader(request, "authorization");
  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token.trim();
}

export function getTrimmedHeader(request: Request, name: string): string | null {
  const value = request.headers.get(name)?.trim();
  return value ? value : null;
}

export function getRequestId(request: Request): string {
  return getTrimmedHeader(request, "x-request-id") ?? crypto.randomUUID();
}

export function getIdempotencyKey(request: Request): string | null {
  const value = getTrimmedHeader(request, "idempotency-key");
  if (!value) {
    return null;
  }
  if (value.length < 8 || value.length > 255) {
    throw new HttpError(
      400,
      "invalid_idempotency_key",
      "idempotency-key header must be between 8 and 255 characters.",
      { header: "idempotency-key" },
    );
  }
  return value;
}

export async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
