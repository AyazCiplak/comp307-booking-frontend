import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import { meetingSequenceById } from "../../../data/mockSlots";
import type { BookingSlot } from "../../../types/booking";

/**
 * Confirm Group Time page (/owner/confirm-group/:sequenceId) — Owner only.
 *
 * Shows every proposed slot option for a pending group meeting sequence,
 * listing which users marked themselves available for each.
 * The owner picks one slot -> a mailto: is opened with all available attendees pre-filled 
 * -> the sequence is marked finalized (in-memory for the mock layer)
 * and the confirmed meeting will appear in "My Booking Slots".
 *
 * TODO (backend): POST /api/sequences/:id/finalize  { finalizedSlotId }
 *   -> creates BookingSlots for each attendee, sends emails server-side.
 */
function ConfirmGroupTime() {
  const { sequenceId } = useParams<{ sequenceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const sequence = sequenceId ? meetingSequenceById[sequenceId] : undefined;
  const [confirmedSlotId, setConfirmedSlotId] = useState<string | null>(null);

  // Case - Group Meeting NOT FOUND (e.g. backend returns nothing)
  if (!sequence) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
        <Card>
          <Card.Content>
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: "32px", marginBottom: "12px" }}>X</p>
              <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>Sequence Not Found</h2>
              <p style={{ color: "#8e8e8e", fontSize: "15px", marginBottom: "24px" }}>
                This group meeting sequence could not be found.
              </p>
              <Button variant="primary" onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>
    );
  }

  // Handles "pick this time" button click
  function handlePickTime(slotId: string) {
    const slot = sequence!.slots.find((s) => s.id === slotId);
    if (!slot) return;

    const availableEmails = (slot.registeredUserIds ?? []).join(", ");
    const dateLabel = new Date(slot.date).toLocaleDateString("en-CA", {
      weekday: "long", month: "long", day: "numeric",
    });
    const subject = encodeURIComponent(`[${sequence!.name}] Meeting Confirmed`);
    const body = encodeURIComponent(
      `Hi everyone,\n\nThe meeting "${sequence!.name}" has been confirmed for:\n\n` +
      `${dateLabel}, from ${slot.startTime} - ${slot.endTime}\n\n` +
      `Please add this to your calendar.\n\nBest,\n${user?.name ?? sequence!.ownerName}`
    );

    // Mark the sequence as finalized in-memory so the dashboard filters it out on remount.
    // TODO: replace with POST /api/sequences/:id/finalize
    sequence!.finalized = true;
    sequence!.finalizedSlotId = slotId;

    // Open the confirmation email to all available attendees.
    window.open(`mailto:${availableEmails}?subject=${subject}&body=${body}`);

    setConfirmedSlotId(slotId);
  }

  // ── SUCCESS SCREEN ─────────────────────────────────────────────────────────
  const confirmedSlot: BookingSlot | undefined = confirmedSlotId
    ? sequence.slots.find((s) => s.id === confirmedSlotId)
    : undefined;

  if (confirmedSlot) {
    const dateLabel = new Date(confirmedSlot.date).toLocaleDateString("en-CA", {
      weekday: "long", month: "long", day: "numeric",
    });
    const attendees = confirmedSlot.registeredUserIds ?? [];

    return (
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "40px 20px" }}>
        <Card>
          <Card.Content>
            <div style={{ textAlign: "center", padding: "32px 0 24px" }}>
              <h2 style={{ fontSize: "22px", margin: "0 0 8px" }}>Meeting Confirmed!</h2>
              <p style={{ color: "#8e8e8e", fontSize: "15px", marginBottom: "24px" }}>
                <strong>{sequence.name}</strong> has been scheduled for:
              </p>

              {/* Confirmed time card */}
              <div style={{
                background: "#f0f5fb", borderRadius: "12px",
                padding: "16px 20px", marginBottom: "20px", textAlign: "left",
              }}>
                <p style={{ fontWeight: 700, fontSize: "16px", margin: "0 0 4px" }}>{dateLabel}</p>
                <p style={{ color: "#507da7", fontSize: "15px", margin: 0 }}>
                  {confirmedSlot.startTime} – {confirmedSlot.endTime}
                </p>
              </div>

              {/* Attendee list */}
              {attendees.length > 0 && (
                <div style={{ textAlign: "left", marginBottom: "24px" }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#555", marginBottom: "8px" }}>
                    Confirmation email sent to:
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {attendees.map((email) => (
                      <span key={email} style={{
                        fontSize: "13px", padding: "4px 10px",
                        background: "#f7f7f7", borderRadius: "6px", color: "#555",
                      }}>
                        {email}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p style={{ fontSize: "13px", color: "#8e8e8e", marginBottom: "24px" }}>
                This meeting will now appear in your Booking Slots.  
              </p>

              <Button variant="primary" onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>
    );
  }

  // ## Main View ## 
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", margin: "0 0 4px" }}>{sequence.name}</h1>
          <p style={{ color: "#8e8e8e", fontSize: "15px", margin: 0 }}>
            Review availability responses and pick a final time.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          ← Back
        </Button>
      </div>

      {/* Instructions banner */}
      <div style={{
        background: "#e8f0f7", borderRadius: "10px",
        padding: "12px 16px", fontSize: "14px", color: "#507da7",
        marginBottom: "28px", fontWeight: 500,
      }}>
        Each card below shows a proposed time option and who marked themselves available.
        Click <strong>Pick This Time</strong> to confirm the meeting - a notification email will open automatically.
      </div>

      {/* Slot options */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {sequence.slots.map((slot) => {
          const available = slot.registeredUserIds ?? [];
          const dateLabel = new Date(slot.date).toLocaleDateString("en-CA", {
            weekday: "long", month: "long", day: "numeric",
          });

          return (
            <Card key={slot.id}>
              <Card.Header>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "16px", margin: "0 0 2px" }}>{dateLabel}</p>
                    <p style={{ color: "#8e8e8e", fontSize: "14px", margin: 0 }}>
                      {slot.startTime} – {slot.endTime}
                    </p>
                  </div>
                  {/* Availability count badge */}
                  <span style={{
                    fontSize: "13px", fontWeight: 600,
                    padding: "4px 12px", borderRadius: "999px",
                    background: available.length > 0 ? "#e8f0f7" : "#f0f0f0",
                    color: available.length > 0 ? "#507da7" : "#8e8e8e",
                  }}>
                    {available.length} available
                  </span>
                </div>
              </Card.Header>

              <Card.Content>
                {available.length === 0 ? (
                  <p style={{ color: "#8e8e8e", fontSize: "14px", fontStyle: "italic" }}>
                    No one has marked availability for this option yet.
                  </p>
                ) : (
                  <>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "8px" }}>
                      Available:
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {available.map((email) => (
                        <span key={email} style={{
                          fontSize: "12px", padding: "3px 10px",
                          background: "#f0f5fb", borderRadius: "999px",
                          color: "#507da7", fontWeight: 500,
                        }}>
                          {email}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </Card.Content>

              <Card.Footer>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handlePickTime(slot.id)}
                  disabled={available.length === 0}
                >
                  Pick This Time
                </Button>
              </Card.Footer>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default ConfirmGroupTime;
