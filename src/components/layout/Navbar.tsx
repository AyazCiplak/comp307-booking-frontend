// Programmed by Ayaz Ciplak
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";

/**
 * Top navigation bar — rendered on all authenticated pages via AuthLayout.
 *
 * Reads the current user directly from AuthContext, so no props are needed.
 * Owners get an extra "Create Slot" button; both roles see "My Bookings" and Logout.
 */
function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // mobile menu state

  // close mobile menu function
  function closeMenu() {
    setIsMenuOpen(false);
  }

  function handleNavigate(path: string) {
    closeMenu(); // close mobile menu when navigating to a new page
    navigate(path);
  }

  function handleLogout() {
    logout();
    closeMenu();
    // TODO: also clear the backend auth token/session when connected
    navigate("/");
  }

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      {/* Left — logo + app name */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-8">
        <Link
          to="/dashboard"
          onClick={closeMenu}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
          <img src="/logo.png" alt="BookSoCS" style={{ height: "36px" }} />
          <span style={{ fontWeight: 600, fontSize: "20px", color: "#507da7" }}>
            BookSoCS
          </span>
        </Link>

        {/* Right(laptop)— greeting + role-aware actions */}
        <div className="hidden items-center gap-3 md:flex">
          <span style={{ color: "#8e8e8e", fontSize: "15px" }}>
            Hello, {user?.name ?? "Guest"}
          </span>

          {user?.role === "owner" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/owner/create-slot")}
            >
              + Create Slot
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigate("/browse")}
          >
            Browse Owners
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleNavigate("/dashboard")}
          >
            My Bookings
          </Button>

          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen((prev: boolean) => !prev)}
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation menu"
            className="px-3 py-2"
          >
            <span
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <span
                style={{
                  width: "20px",
                  height: "2px",
                  backgroundColor: "currentColor",
                  borderRadius: "999px",
                }}
              />
              <span
                style={{
                  width: "20px",
                  height: "2px",
                  backgroundColor: "currentColor",
                  borderRadius: "999px",
                }}
              />
              <span
                style={{
                  width: "20px",
                  height: "2px",
                  backgroundColor: "currentColor",
                  borderRadius: "999px",
                }}
              />
            </span>
          </Button>
        </div>
      </div>

      {/* Mobile navbar view  */}
      {isMenuOpen && (
        <div className="border-t border-light-grey bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <span style={{ color: "#8e8e8e", fontSize: "15px" }}>
              Hello, {user?.name ?? "Guest"}
            </span>

            {user?.role === "owner" && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleNavigate("/owner/create-slot")}
              >
                + Create Slot
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigate("/browse")}
            >
              Browse Owners
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => handleNavigate("/dashboard")}
            >
              My Bookings
            </Button>

            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
