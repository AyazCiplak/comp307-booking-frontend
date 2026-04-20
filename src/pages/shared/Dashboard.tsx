import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import BookingSlotCard from "../../components/calendar/BookingSlotCard";
import { myAppointments, ownerSlots } from "../../data/mockSlots";

// TODO: Make sure this grid is flexible for different media types (e.g. laptop vs tablet)
const GRID: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "20px",
};

/**
 * Single dashboard for all logged-in users.
 *
 * Sections:
 *  1. "My Appointments" - users and owners: slots the user has already booked
 *  2. "Find a Slot" - users and owners: Button that navigates to the owner directory (/browse), (BROWSE NOT YET IMPL)
 *  3. "My Booking Slots" —  owners: slots the owner has created, with management actions
 *
 * All data is mock/placeholder - will replace with real API calls once the
 * java / spring boot backend is connected
 */
function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Stub handlers — TODO: replace with real API calls when backend is ready
  function handleCancel(slotId: string) { console.log("Cancel booking:", slotId); }
  function handleDelete(slotId: string) { console.log("Delete slot:", slotId); }

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

      {/* Section 1: My Appointments (users and owners) */}
      <section style={{ marginBottom: "48px" }}>
        <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>My Appointments</h2>

        {myAppointments.length > 0 ? (
          <div style={GRID}>
            {myAppointments.map((slot) => (
              <BookingSlotCard
                key={slot.id}
                slot={slot}
                onCancel={handleCancel}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <Card>
            <Card.Content>
              <p style={{ color: "#8e8e8e", textAlign: "center", padding: "24px 0" }}>
                You have no upcoming appointments.
              </p>
            </Card.Content>
          </Card>
        )}
      </section>

      {/* Section 2: Find a Slot (users and owners) */}
      <section style={{ marginBottom: "48px" }}>
        <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>Find a Slot</h2>
        <Card>
          <Card.Content>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "24px",
              flexWrap: "wrap",
              padding: "8px 0",
            }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: "16px", marginBottom: "6px" }}>
                  Looking for a booking slot?
                </p>
                <p style={{ color: "#8e8e8e", fontSize: "14px" }}>
                  Browse professors and TAs who have active office hours or meeting slots available.
                </p>
              </div>
              <Button variant="primary" onClick={() => navigate("/browse")}>
                Browse Owners
              </Button>
            </div>
          </Card.Content>
        </Card>
      </section>

      {/* Section 3: My Booking Slots (owners only) */}
      {user?.role === "owner" && (
        <section style={{ marginBottom: "48px" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}>
            <h2 style={{ fontSize: "20px", margin: 0 }}>My Booking Slots</h2>
            <Button variant="secondary" size="sm" onClick={() => navigate("/owner/create-slot")}>
              + Create New Slot
            </Button>
          </div>

          {ownerSlots.length > 0 ? (
            <div style={GRID}>
              {ownerSlots.map((slot) => (
                <BookingSlotCard key={slot.id} slot={slot} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <Card>
              <Card.Content>
                <p style={{ color: "#8e8e8e", textAlign: "center", padding: "24px 0" }}>
                  You have not created any booking slots yet.
                </p>
              </Card.Content>
            </Card>
          )}
        </section>
      )}

    </div>
  );
}

export default Dashboard;
