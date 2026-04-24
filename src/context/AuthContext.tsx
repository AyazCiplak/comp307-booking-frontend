import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export type UserRole = "user" | "owner";

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Derives the user's role from their email domain:
 * @mcgill.ca -> "owner" (professors / TAs who create slots)
 * @mail.mcgill.ca -> "user" (students who book slots)
 *
 * Called at login time once the backend returns the authenticated email.
 */
export function getRoleFromEmail(email: string): UserRole {
  return email.endsWith("@mcgill.ca") && !email.endsWith("@mail.mcgill.ca")
    ? "owner"
    : "user";
}

/**
 * Provides context on user type ("user" vs "owner") based on their email. 
 * Authenticated section is wrapped with this AuthProvider. 
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  
  // Current MOCK DATA -- This is a "user" (student), can swap out to get "owner" pages.
  // Can be removed once real "auth" is implemented via backend.
  const [user, setUser] = useState<AuthUser | null>({
    //name: "Ayaz",
    //email: "ayaz.ciplak@mail.mcgill.ca", // swap to @mcgill.ca to see owner view
    //role: getRoleFromEmail("ayaz.ciplak@mail.mcgill.ca"),

    name: "Joseph Vybihal",
    email: "joseph.vybihal@mcgill.ca", // idk what his actual email is
    role: getRoleFromEmail("joseph.vybihal@mcgill.ca")
  });

  function login(authUser: AuthUser) {
    setUser({ ...authUser, role: getRoleFromEmail(authUser.email) });
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook — import and call this in any component to read the
 * current user or trigger login/logout.
 *
 * Usage:
 * <<< const { user, logout } = useAuth();
 * if (user?.role === "owner") { ... } >>> // To apply user-type-specific actions
 */
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
