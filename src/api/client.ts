const BASE_URL = "http://localhost:8081"; // LOCALLY-running backend

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.json();
}