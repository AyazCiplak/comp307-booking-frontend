// Programmed by Ayaz Ciplak
const BASE_URL = "http://localhost:8081"; // locally-running backend

/**
 * Thin fetch wrapper used by all API modules.
 *
 * Error handling:
 *  - Network down / CORS preflight blocked -> "Cannot connect" message
 *  - HTTP error with Spring JSON body -> extracts the "message" field
 *  - HTTP error with plain-text body -> uses the raw text
 *  - Fallback -> "HTTP <status>" string
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
      const serverMsg = typeof json.message === "string" ? json.message.trim() : "";
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

    throw new Error(message);
  }

  return res.json();
}
