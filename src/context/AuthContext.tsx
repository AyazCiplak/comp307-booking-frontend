// Programmed by Ayaz Ciplak
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { apiLogout } from "../api/auth";

export type UserRole = "user" | "owner";

/** Frontend user object stored in context + localStorage. */
export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
  token: string; // opaque bearer token; sent with every protected API call
}

/**
 * Shape of the JSON body returned by POST /api/account/login
 * and POST /api/account/register (LoggedInResponse on the backend).
 */
export interface LoggedInResponse {
  email: string;
  firstName: string;
  lastName: string;
  owner: boolean;   // Jackson serialises isOwner() → "owner" (drops the "is" prefix)
  department: string;
  title: string;
  accessToken: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (response: LoggedInResponse) => void;
  logout: () => void;
}

// localStorage key - Saves user data in browser memory 
const STORAGE_KEY = "booksocs_user";

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Derives the user's role from their email domain:
 * @mcgill.ca -> "owner" (professors / TAs who create slots)
 * @mail.mcgill.ca -> "user" (students who book slots)
 */
export function getRoleFromEmail(email: string): UserRole {
  return email.endsWith("@mcgill.ca") && !email.endsWith("@mail.mcgill.ca")
    ? "owner"
    : "user";
}

/** Try to restore a previously logged-in session from browser's localStorage. */
function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

/**
 * Wraps the entire authenticated section of the app.
 * Provides current user info and login / logout actions to all children.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // Restore from localStorage so a page refresh doesn't log the user out.
  const [user, setUser] = useState<AuthUser | null>(loadStoredUser);

  /** Called right after a successful login or register API response. */
  function login(response: LoggedInResponse) {
    const authUser: AuthUser = {
      name: `${response.firstName} ${response.lastName}`,
      email: response.email,
      // Use the backend's isOwner flag directly; fall back to email heuristic.
      role: response.owner ? "owner" : "user",
      token: response.accessToken,
    };
    setUser(authUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
  }

  /**
   * Logs out — invalidates the token on the backend (best-effort) then
   * clears state and localStorage regardless of whether the API call succeeds.
   */
  async function logout() {
    if (user?.token) {
      try {
        await apiLogout(user.token);
      } catch {
        // Silently ignore network errors — always clear locally.
      }
    }
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook - can be imported and Called
 * in any component to read the current user or trigger login / logout.
 *
 * Usage:
 *   const { user, logout } = useAuth();
 *   if (user?.role === "owner") { ... }
 */
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
