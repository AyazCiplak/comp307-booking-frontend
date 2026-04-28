import { apiFetch } from "./client";

export const apiRegister = (email: string, password: string) =>
  apiFetch("/api/account/register", { method: "POST", body: JSON.stringify({ email, password }) });

export const apiLogin = (email: string, password: string) =>
  apiFetch("/api/account/login", { method: "POST", body: JSON.stringify({ email, password }) });

export const apiLogout = (token: string) =>
  apiFetch("/api/account/logout", { method: "POST", body: JSON.stringify(token) });