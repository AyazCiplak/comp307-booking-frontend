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

  function handleLogout() {
    logout();
    // TODO: also clear the backend auth token/session when connected
    navigate("/");
  }

  return (
    <nav style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 32px",
      borderBottom: "1px solid #e0e0e0",
      backgroundColor: "#ffffff",
    }}>
      {/* Left — logo + app name */}
      <Link
        to="/dashboard"
        style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}
      >
        <img src="/logo.png" alt="BookSoCS" style={{ height: "36px" }} />
        <span style={{ fontWeight: 600, fontSize: "20px", color: "#507da7" }}>BookSoCS</span>
      </Link>

      {/* Right — greeting + role-aware actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ color: "#8e8e8e", fontSize: "15px" }}>
          Hello, {user?.name ?? "Guest"}
        </span>

        {/* Owners get a shortcut to create a new booking slot */}
        {user?.role === "owner" && (
          <Button variant="secondary" size="sm" onClick={() => navigate("/owner/create-slot")}>
            + Create Slot
          </Button>
        )}

        <Button variant="ghost" size="sm" onClick={() => navigate("/browse")}>
          Browse Owners
        </Button>

        <Button variant="primary" size="sm" onClick={() => navigate("/dashboard")}>
          My Bookings
        </Button>

        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </nav>
  );
}

export default Navbar;
