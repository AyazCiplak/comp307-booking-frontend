// Programmed by Ayaz Ciplak
import { apiFetch } from "./client";

/** POST /api/account/register - creates a new account and returns a LoggedInResponse. */
export const apiRegister = (
  email: string,
  password: string,
  department = "",
  title = "",
) =>
  apiFetch("/api/account/register", {
    method: "POST",
    body: JSON.stringify({ email, password, department, title }),
  });

/** POST /api/account/login - verifies credentials and returns a LoggedInResponse. */
export const apiLogin = (email: string, password: string) =>
  apiFetch("/api/account/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

/** POST /api/account/logout - invalidates the server-side token. */
export const apiLogout = (token: string) =>
  apiFetch("/api/account/logout", {
    method: "POST",
    body: JSON.stringify(token),
  });
