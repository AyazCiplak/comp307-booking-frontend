import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { meetingSequenceById } from "../../data/mockSlots";
import { useAuth } from "../../context/AuthContext";
import type { BookingSlot } from "../../types/booking";

/**
 * Group Availability page (/invite/:sequenceId).
 * Reached by clicking an owner-generated invite URL (Type 2 meeting sequence).
 * Shows all proposed time slot options for the sequence and lets users mark
 * which ones they are available for (when2meet style).
 * The owner then reviews availability and picks a final time on the dashboard.
 *
 * sequenceId comes from the URL param — e.g. /invite/seq-1
 */
function GroupBooking() {
  const { sequenceId } = useParams<{ sequenceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const sequence = sequenceId ? meetingSequenceById[sequenceId] : undefined;

  // Local slot state so we can reflect availability changes immediately in the UI.
  // TODO: replace with real API calls when backend is connected.
  const [slots, setSlots] = useState<BookingSlot[]>(sequence?.slots ?? []);

  function handleMarkAvailable(slotId: string) {
    if (!user) return;
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id !== slotId) return s;
        const updatedIds = [...(s.registeredUserIds ?? []), user.email];
        const isFull = updatedIds.length >= (s.maxUsers ?? Infinity);
        return {
          ...s,
          registeredUserIds: updatedIds,
          status: isFull ? ("booked" as const) : ("available" as const),
        };
      })
    );
    // TODO: POST /api/group-slots/:slotId/availability
    console.log("Marked available for slot:", slotId, "as", user.email);
  }

  // Case: Sequence not found
  if (!sequence) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
        <Card>
          <Card.Content>
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: "32px", marginBottom: "12px" }}>❌</p>
              <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>Invite Link Not Found</h2>
              <p style={{ color: "#8e8e8e", fontSize: "15px", marginBottom: "24px" }}>
                This invite link may be invalid or has expired.
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

  function isMarkedAvailable(slot: BookingSlot) {
    return (slot.registeredUserIds ?? []).includes(user?.email ?? "");
  }

  function isFull(slot: BookingSlot) {
    return (slot.registeredUserIds?.length ?? 0) >= (slot.maxUsers ?? Infinity);
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>

      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "28px", margin: "0 0 4px" }}>{sequence.name}</h1>
        <p style={{ color: "#8e8e8e", fontSize: "15px", margin: "0 0 12px" }}>
          Hosted by {sequence.ownerName} · {sequence.ownerEmail}
        </p>
        <div style={{
          display: "inline-flex", gap: "12px",
          background: "#f7f7f7", borderRadius: "8px",
          padding: "8px 14px", fontSize: "14px", color: "#555",
        }}>
          <span>👥 Max {sequence.userCeiling} per option</span>
          <span>·</span>
          <span>📅 {slots.length} time option{slots.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Instructions banner */}
      <div style={{
        background: "#e8f0f7", borderRadius: "10px",
        padding: "12px 16px", fontSize: "14px", color: "#507da7",
        marginBottom: "24px", fontWeight: 500,
      }}>
        📌 Mark all the time options you are available for. The organiser will pick a final time based on responses.
      </div>

      {/* Slot list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
        {slots.map((slot) => {
          const registered = slot.registeredUserIds?.length ?? 0;
          const ceiling = slot.maxUsers ?? sequence.userCeiling;
          const full = isFull(slot);
          const alreadyMarked = isMarkedAvailable(slot);

          const dateLabel = new Date(slot.date).toLocaleDateString("en-CA", {
            weekday: "long", month: "long", day: "numeric",
          });

          // Fill bar percentage
          const fillPct = Math.min((registered / ceiling) * 100, 100);

          return (
            <Card key={slot.id}>
              <Card.Content>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>

                  {/* Date + time */}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: "16px", margin: "0 0 4px" }}>{dateLabel}</p>
                    <p style={{ color: "#8e8e8e", fontSize: "14px", margin: "0 0 12px" }}>
                      {slot.startTime} – {slot.endTime}
                    </p>

                    {/* Availability fill bar */}
                    <div style={{ marginBottom: "6px" }}>
                      <div style={{
                        height: "6px", borderRadius: "999px",
                        background: "#e8e8e8", overflow: "hidden",
                        width: "100%", maxWidth: "200px",
                      }}>
                        <div style={{
                          height: "100%",
                          width: `${fillPct}%`,
                          background: full ? "#bd271d" : "#507da7",
                          borderRadius: "999px",
                          transition: "width 0.3s",
                        }} />
                      </div>
                      <p style={{ fontSize: "12px", color: "#8e8e8e", margin: "4px 0 0" }}>
                        {registered} / {ceiling} available
                      </p>
                    </div>
                  </div>

                  {/* Action */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {alreadyMarked ? (
                      <span style={{
                        fontSize: "13px", fontWeight: 600,
                        padding: "6px 14px", borderRadius: "999px",
                        background: "#e8f0f7", color: "#507da7",
                      }}>
                        ✓ Available
                      </span>
                    ) : full ? (
                      <span style={{
                        fontSize: "13px", fontWeight: 600,
                        padding: "6px 14px", borderRadius: "999px",
                        background: "#fbeaea", color: "#bd271d",
                      }}>
                        Full
                      </span>
                    ) : (
                      <Button variant="primary" size="sm" onClick={() => handleMarkAvailable(slot.id)}>
                        Mark Available
                      </Button>
                    )}
                  </div>
                </div>
              </Card.Content>
            </Card>
          );
        })}
      </div>

      {/* Footer actions */}
      <div style={{ display: "flex", gap: "12px" }}>
        <Button variant="primary" onClick={() => navigate("/dashboard")}>
          Done — Go to Dashboard
        </Button>
        <Button
          variant="ghost"
          onClick={() => window.open(`mailto:${sequence.ownerEmail}`)}
        >
          Email {sequence.ownerName}
        </Button>
      </div>

    </div>
  );
}

export default GroupBooking;
