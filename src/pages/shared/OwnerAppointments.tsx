import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import BookingSlotCard from "../../components/calendar/BookingSlotCard";
import { mockOwners, slotsByOwner } from "../../data/mockSlots";
import type { BookingSlot } from "../../types/booking";

/**
 * Owner Appointments page (/browse/:ownerUsername).
 * Shows a specific owner's available Type 3 (office-hour) slots and a
 * "Request a Meeting" call-to-action for Type 1 meeting requests.
 *
 * ownerUsername is the part before @ in the owner's @mcgill.ca email,
 * e.g. /browse/joseph.vybihal → joseph.vybihal@mcgill.ca
 */
function OwnerAppointments() {
  const { ownerUsername } = useParams<{ ownerUsername: string }>();
  const navigate = useNavigate();

  const ownerEmail = `${ownerUsername}@mcgill.ca`;
  const owner = mockOwners.find((o) => o.email === ownerEmail);
  const [slots, setSlots] = useState<BookingSlot[]>(slotsByOwner[ownerEmail] ?? []);

  // Mock book handler - marks slot as "booked" in local state.
  // TODO: replace with POST /api/bookings when backend is connected.
  function handleBook(slotId: string) {
    setSlots((prev) =>
      prev.map((s) =>
        s.id === slotId ? { ...s, status: "booked" as const } : s
      )
    );
  }

  // Case: Owner not found in directory
  if (!owner) {
    return (
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>
        <Button variant="ghost" size="sm" onClick={() => navigate("/browse")} style={{ marginBottom: "24px" }}>
          ← Back to Browse
        </Button>
        <Card>
          <Card.Content>
            <p style={{ color: "#8e8e8e", textAlign: "center", padding: "32px 0" }}>
              Owner not found.
            </p>
          </Card.Content>
        </Card>
      </div>
    );
  }

  const availableSlots = slots.filter((s) => s.status === "available");
  const bookedSlots = slots.filter((s) => s.status !== "available");

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>

      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => navigate("/browse")} style={{ marginBottom: "24px" }}>
        ← Back to Browse
      </Button>

      {/* Owner header */}
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "28px", margin: "0 0 4px" }}>{owner.name}</h1>
        <p style={{ color: "#8e8e8e", fontSize: "15px", margin: 0 }}>
          {owner.title}{owner.department ? ` · ${owner.department}` : ""} · {owner.email}
        </p>
      </div>

      {/* Request a Meeting call-to-action (Type 1) */}
      <section style={{ marginBottom: "48px" }}>
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
                  Can't find a suitable slot?
                </p>
                <p style={{ color: "#8e8e8e", fontSize: "14px" }}>
                  Send {owner.name} a meeting request and they will respond with a confirmed time.
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => navigate(`/browse/${ownerUsername}/request`)}
              >
                Request a Meeting
              </Button>
            </div>
          </Card.Content>
        </Card>
      </section>

      {/* Available office-hour slots (Type 3) */}
      <section style={{ marginBottom: "48px" }}>
        <h2 style={{ fontSize: "20px", margin: "0 0 16px" }}>Available Slots</h2>

        {availableSlots.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}>
            {availableSlots.map((slot) => (
              <BookingSlotCard key={slot.id} slot={slot} onBook={handleBook} />
            ))}
          </div>
        ) : (
          <Card>
            <Card.Content>
              <p style={{ color: "#8e8e8e", textAlign: "center", padding: "24px 0" }}>
                No available slots at the moment. Try sending a meeting request instead.
              </p>
            </Card.Content>
          </Card>
        )}
      </section>

      {/* Already-booked slots (informational) */}
      {bookedSlots.length > 0 && (
        <section>
          <h2 style={{ fontSize: "20px", margin: "0 0 16px", color: "#8e8e8e" }}>Already Booked</h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}>
            {bookedSlots.map((slot) => (
              <BookingSlotCard key={slot.id} slot={slot} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

export default OwnerAppointments;
