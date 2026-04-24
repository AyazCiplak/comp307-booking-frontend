import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import BookingSlotCard from "../../components/calendar/BookingSlotCard";
import {
  myAppointments,
  ownerSlots,
  ownerMeetingSequences,
  pendingRequests,
} from "../../data/mockSlots"; // Temp mock data import
import type { PendingRequest, MeetingSequence } from "../../types/booking";

// TODO: Make sure this grid is flexible for different media types (e.g. laptop vs tablet)
const GRID: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "20px",
};

/**
 * Single dashboard for all logged-in users.
 *
 * Sections (in order):
 *  1. "My Appointments" -> all users: slots already booked (confirmed)
 *  2. "Find a Slot" -> all users: call-to-action (button) to browse owners list
 *  3. "Pending Requests" -> OWNERS ONLY: incoming Type 1 requests to accept/decline
 *  4. "My Booking Slots" -> OWNERS ONLY: type 3 office-hour slots they created
 *  5. "My Meeting Sequences" -> OWNERS ONLY: Type 2 group sequences + copyable invite links (URLs)
 *
 * ALL DATA CURRENTLY MOCKED — will be replaced with real API calls once the "real" backend is connected.
 */
function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ## Local state for mock interactions ## 
  const [requests, setRequests] = useState<PendingRequest[]>(pendingRequests);
  const [sequences] = useState<MeetingSequence[]>(ownerMeetingSequences);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ## Stub handlers (replace with API calls when backend is ready) ## 
  function handleCancel(slotId: string) {
    console.log("Cancel booking:", slotId);
    // TODO: DELETE /api/bookings/:slotId → send mailto: to owner
  }

  function handleDelete(slotId: string) {
    console.log("Delete slot:", slotId);
    // TODO: DELETE /api/slots/:slotId → send mailto: to booker if booked
  }

  function handleAcceptRequest(req: PendingRequest) {
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
    // TODO: POST /api/requests/:id/accept → creates BookingSlot + sends mailto: to requester
    window.open(
      `mailto:${req.requesterEmail}?subject=Meeting Request Accepted&body=Hi ${req.requesterName},%0A%0AYour meeting request for ${req.requestedDate.toLocaleDateString()} at ${req.requestedStartTime} has been accepted!%0A%0ABest,%0A${user?.name}`,
    );
  }

  function handleDeclineRequest(req: PendingRequest) {
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
    // TODO: POST /api/requests/:id/decline → sends mailto: to requester
    window.open(
      `mailto:${req.requesterEmail}?subject=Meeting Request Declined&body=Hi ${req.requesterName},%0A%0AUnfortunately your meeting request for ${req.requestedDate.toLocaleDateString()} at ${req.requestedStartTime} could not be accommodated at this time.%0A%0ABest,%0A${user?.name}`,
    );
  }

  function handleCopyLink(seq: MeetingSequence) {
    navigator.clipboard.writeText(seq.inviteUrl).then(() => {
      setCopiedId(seq.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  // ### HELPERS 
  const sectionHeading: React.CSSProperties = {
    fontSize: "20px",
    marginBottom: "16px",
    margin: "0 0 16px 0",
  };

  const sectionRow: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  };

  const emptyNote = (msg: string) => (
    <Card>
      <Card.Content>
        <p style={{ color: "#8e8e8e", textAlign: "center", padding: "24px 0" }}>{msg}</p>
      </Card.Content>
    </Card>
  );

  // ### CONTENT ### 
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

      {/* Section 1: My Appointments (all users) */}
      <section style={{ marginBottom: "48px" }}>
        <h2 style={sectionHeading}>My Appointments</h2>

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
          emptyNote("You have no upcoming appointments.")
        )}
      </section>

      {/* Section 2: Find a Slot (all users) */}
      <section style={{ marginBottom: "48px" }}>
        <h2 style={sectionHeading}>Find a Slot</h2>
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

      {/* ### Owner-only sections ### */}
      {user?.role === "owner" && (
        <>
          {/* Section 3: Pending Requests (Type 1) */}
          <section style={{ marginBottom: "48px" }}>
            <h2 style={sectionHeading}>Pending Requests</h2>

            {requests.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {requests.map((req) => (
                  <Card key={req.id}>
                    <Card.Header>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: "16px", margin: "0 0 2px" }}>
                            {req.requesterName}
                          </p>
                          <p style={{ color: "#8e8e8e", fontSize: "13px", margin: 0 }}>
                            {req.requesterEmail}
                          </p>
                        </div>
                        <span style={{
                          fontSize: "12px", fontWeight: 600,
                          padding: "3px 10px", borderRadius: "999px",
                          background: "#fff8e1", color: "#b78800",
                        }}>
                          Pending
                        </span>
                      </div>
                    </Card.Header>

                    <Card.Content>
                      <p style={{ fontSize: "15px", marginBottom: "6px" }}>
                        📅&nbsp;
                        {new Date(req.requestedDate).toLocaleDateString("en-CA", {
                          weekday: "short", month: "short", day: "numeric",
                        })}
                        &nbsp;·&nbsp;{req.requestedStartTime} – {req.requestedEndTime}
                      </p>
                      {req.message && (
                        <p style={{
                          fontSize: "14px", color: "#555",
                          background: "#f7f7f7", borderRadius: "8px",
                          padding: "10px 12px", margin: "8px 0 0",
                          fontStyle: "italic",
                        }}>
                          "{req.message}"
                        </p>
                      )}
                    </Card.Content>

                    <Card.Footer>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAcceptRequest(req)}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeclineRequest(req)}
                        >
                          Decline
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`mailto:${req.requesterEmail}`)}
                        >
                          Email
                        </Button>
                      </div>
                    </Card.Footer>
                  </Card>
                ))}
              </div>
            ) : (
              emptyNote("No pending meeting requests.")
            )}
          </section>

          {/* Section 4: My Booking Slots (Type 3) */}
          <section style={{ marginBottom: "48px" }}>
            <div style={sectionRow}>
              <h2 style={{ fontSize: "20px", margin: 0 }}>My Booking Slots</h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate("/owner/create-slot")}
              >
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
              emptyNote("You have not created any booking slots yet.")
            )}
          </section>

          {/* Section 5: My Meeting Sequences (Type 2) */}
          <section style={{ marginBottom: "48px" }}>
            <div style={sectionRow}>
              <h2 style={{ fontSize: "20px", margin: 0 }}>My Meeting Sequences</h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate("/owner/create-slot")}
              >
                + Create Sequence
              </Button>
            </div>

            {sequences.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {sequences.map((seq) => {
                  const filledSlots = seq.slots.filter(
                    (s) => (s.registeredUserIds?.length ?? 0) > 0,
                  ).length;

                  return (
                    <Card key={seq.id}>
                      <Card.Header>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: "16px", margin: "0 0 2px" }}>
                              {seq.name}
                            </p>
                            <p style={{ color: "#8e8e8e", fontSize: "13px", margin: 0 }}>
                              Created&nbsp;
                              {new Date(seq.createdAt).toLocaleDateString("en-CA", {
                                month: "short", day: "numeric", year: "numeric",
                              })}
                            </p>
                          </div>
                          <span style={{
                            fontSize: "12px", fontWeight: 600,
                            padding: "3px 10px", borderRadius: "999px",
                            background: "#e8f0f7", color: "#507da7",
                          }}>
                            {seq.slots.length} slot{seq.slots.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </Card.Header>

                      <Card.Content>
                        <div style={{
                          display: "flex", gap: "24px", fontSize: "14px", color: "#555",
                          marginBottom: "12px",
                        }}>
                          <span>👥 Max {seq.userCeiling} per slot</span>
                          <span>📋 {filledSlots}/{seq.slots.length} slots with sign-ups</span>
                        </div>

                        {/* Invite URL row */}
                        <div style={{
                          display: "flex", alignItems: "center", gap: "8px",
                          background: "#f7f7f7", borderRadius: "8px",
                          padding: "8px 12px",
                        }}>
                          <span style={{
                            flex: 1, fontSize: "13px", color: "#507da7",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {seq.inviteUrl}
                          </span>
                          <Button
                            variant={copiedId === seq.id ? "ghost" : "secondary"}
                            size="sm"
                            onClick={() => handleCopyLink(seq)}
                          >
                            {copiedId === seq.id ? "✓ Copied!" : "Copy Link"}
                          </Button>
                        </div>
                      </Card.Content>
                    </Card>
                  );
                })}
              </div>
            ) : (
              emptyNote("You have not created any meeting sequences yet.")
            )}
          </section>
        </>
      )}

    </div>
  );
}

export default Dashboard;
