import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

/**
 * Single dashboard for all logged-in users.
 *
 * Sections:
 *  1. "My Appointments"   — visible to everyone (users + owners)
 *  2. "Browse Slots"      — visible to everyone
 *  3. "My Booking Slots"  — owner-only panel, rendered when user.role === "owner"
 *
 * All data below is mock/placeholder — replace with real API calls once
 * the Spring Boot backend is connected.
 */
function Dashboard() {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>

      {/* Page heading */}
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "4px" }}>
          Welcome back, {user?.name}
        </h1>
        <p style={{ color: "#8e8e8e", fontSize: "15px" }}>
          {user?.role === "owner" ? "Owner" : "Student"} · {user?.email}
        </p>
      </div>

      {/* ── Section 1: My Appointments (everyone) ─────────────────────── */}
      <section style={{ marginBottom: "48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "20px", margin: 0 }}>My Appointments</h2>
          <Button variant="primary" size="sm">Book a Slot</Button>
        </div>

        {/* TODO: replace with real BookingSlotCard list from API */}
        <Card>
          <Card.Content>
            <p style={{ color: "#8e8e8e", textAlign: "center", padding: "24px 0" }}>
              You have no upcoming appointments.
            </p>
          </Card.Content>
        </Card>
      </section>

      {/* ── Section 2: Owner Panel (owners only) ──────────────────────── */}
      {user?.role === "owner" && (
        <section style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "20px", margin: 0 }}>My Booking Slots</h2>
            <Button variant="secondary" size="sm">+ Create New Slot</Button>
          </div>

          {/* TODO: replace with real slot list from API */}
          <Card>
            <Card.Content>
              <p style={{ color: "#8e8e8e", textAlign: "center", padding: "24px 0" }}>
                You have not created any booking slots yet.
              </p>
            </Card.Content>
          </Card>
        </section>
      )}

    </div>
  );
}

export default Dashboard;
