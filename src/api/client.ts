// Programmed by Ayaz Ciplak
const BASE_URL =
  "https://railway.com/project/ec71e01a-f840-4a96-b767-ad3827edf4c6?"; // locally-running backend

/**
 * Thin fetch wrapper used by all API modules.
 *
 * Error handling:
 *  - Network down / CORS preflight blocked -> "Cannot connect" message
 *  - HTTP error with Spring JSON body -> extracts the "message" field
 *  - HTTP error with plain-text body -> uses the raw text
 *  - Fallback -> "HTTP <status>" string
 *
 * NOTE on Content-Type:
 *  The default is application/json. If `options.headers` is provided it
 *  REPLACES the default (object spread is a shallow merge), so callers can
 *  override the content type by including a `headers` object in options.
 */
export async function apiFetch(path: string, options?: RequestInit) {
  let res: Response;

  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    // fetch() itself threw — either the server is down or CORS blocked the preflight.
    throw new Error(
      "Cannot connect to the server. Please make sure the backend is running.",
    );
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = `Request failed (HTTP ${res.status})`;

    try {
      // Spring Boot error body: { timestamp, status, error, message, path }
      // "message" is populated when server.error.include-message=always is set.
      const json = JSON.parse(text) as Record<string, unknown>;
      const serverMsg =
        typeof json.message === "string" ? json.message.trim() : "";
      if (serverMsg) {
        message = serverMsg;
      } else {
        // Fall back to the HTTP reason phrase (e.g. "Not Found", "Bad Request")
        const reason = typeof json.error === "string" ? json.error : "";
        message = reason || `HTTP ${res.status}`;
      }
    } catch {
      // Body wasn't JSON — use the raw text if there is any.
      message = text.trim() || `HTTP ${res.status}`;
    }

    // 401 means the stored token is invalid or the backend restarted and wiped its DB.
    // Auto-clear localStorage and send the user back to the login page.
    if (res.status === 401) {
      localStorage.removeItem("booksocs_user");
      window.location.href = "/auth/login";
    }

    throw new Error(message);
  }

  // 204 No Content (or any empty body) — don't try to parse JSON.
  // JSON.parse returns `any`, so the overall return type stays `any` for callers.
  const text = await res.text();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return text ? JSON.parse(text) : null;
}

/**
 * Sends a bearer token as a raw text/plain body.
 *
 * Use this helper for every POST endpoint whose entire body is just a token,
 * since Spring's StringHttpMessageConverter has issues reading raw bytes with quotes.
 */
export function tokenFetch(path: string, token: string): Promise<unknown> {
  return apiFetch(path, {
    method: "POST",
    body: token,
    headers: { "Content-Type": "text/plain" }, // overrides the application/json default
  });
}
