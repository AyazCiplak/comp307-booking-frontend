// Programmed by Ayaz Ciplak
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import {
  apiGetGroupInstanceByID,
  apiGetGroupProposals,
  apiGetAllProposalBookers,
  apiSelectGroupProposalSlot,
} from "../../../api/booking";
import type {
  BackendGroupMeetingInstance,
  BackendBookingSlot,
  BackendBooking,
} from "../../../api/booking";

/**
 * Confirm Group Time page (/owner/confirm-group/:groupMeetingInstanceID) — Owner only.
 *
 * Flow:
 *  1. apiGetGroupInstanceByID -> instance name / owner info
 *  2. apiGetGroupProposals -> all GROUP_PROPOSAL slots
 *  3. apiGetAllProposalBookers -> map slotID -> Booking[] (who marked available)
 *  4. "Pick This Time" -> apiSelectGroupProposalSlot (PATCH)
 *     - Backend marks chosen slot as GROUP_SELECTED, deletes other proposals + their bookings
 *     - Frontend opens a mailto: to all attendees, shows success screen
 */
function ConfirmGroupTime() {
  const { groupMeetingInstanceID } = useParams<{ groupMeetingInstanceID: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ### STATE ###
  const [instance, setInstance] = useState<BackendGroupMeetingInstance | null>(null);
  const [slots, setSlots] = useState<BackendBookingSlot[]>([]);
  // Map of bookingSlotID (string) -> array of Booking objects (who marked available)
  const [bookers, setBookers] = useState<Record<string, BackendBooking[]>>({});

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<number | null>(null); // slotID being confirmed
  const [actionError, setActionError] = useState<string | null>(null);

  // Confirmed slot (post-selection success state)
  const [confirmedSlot, setConfirmedSlot] = useState<BackendBookingSlot | null>(null);
  const [confirmedAttendees, setConfirmedAttendees] = useState<string[]>([]);

  // ### FETCH ###
  useEffect(() => {
    if (!groupMeetingInstanceID || !user?.token) return;
    const id = Number(groupMeetingInstanceID);
    const tok = user.token;

    Promise.all([
      apiGetGroupInstanceByID(id),
      apiGetGroupProposals(id, tok),
      apiGetAllProposalBookers(id, tok),
    ])
      .then(([inst, proposalSlots, proposalBookers]) => {
        setInstance(inst as BackendGroupMeetingInstance);
        setSlots(proposalSlots as BackendBookingSlot[]);
        setBookers(proposalBookers as Record<string, BackendBooking[]>);
      })
      .catch((err: unknown) => {
        setLoadError(err instanceof Error ? err.message : "Failed to load group meeting.");
      })
      .finally(() => setIsLoading(false));
  }, [groupMeetingInstanceID, user?.token]);

  // ### CONFIRM HANDLER ###
  async function handlePickTime(slot: BackendBookingSlot) {
    if (!user?.token) return;
    setActionError(null);
    setConfirming(slot.bookingSlotID);

    try {
      await apiSelectGroupProposalSlot(slot.bookingSlotID, user.token);

      // Collect attendee emails for the confirmation email
      const attendeeBookings = bookers[String(slot.bookingSlotID)] ?? [];
      // Include the owner themselves in the notification email
      const emails = [
        ...attendeeBookings.map((b) => b.reservee.email),
        ...(user?.email ? [user.email] : []),
      ];
      setConfirmedAttendees(emails);
      setConfirmedSlot(slot);

      // Open mailto: to all attendees
      const dateLabel = new Date(slot.startDateTime).toLocaleDateString("en-CA", {
        weekday: "long", month: "long", day: "numeric",
      });
      const startTime = new Date(slot.startDateTime).toLocaleTimeString("en-US", {
        hour: "numeric", minute: "2-digit", hour12: true,
      });
      const endTime = new Date(slot.endDateTime).toLocaleTimeString("en-US", {
        hour: "numeric", minute: "2-digit", hour12: true,
      });
      const subject = encodeURIComponent(`[${instance?.name ?? "Group Meeting"}] Meeting Confirmed`);
      const body = encodeURIComponent(
        `Hi everyone,\n\n` +
        `The meeting "${instance?.name ?? "Group Meeting"}" has been confirmed for:\n\n` +
        `${dateLabel}, from ${startTime} – ${endTime}\n\n` +
        `Please add this to your calendar.\n\n` +
        `Best,\n${user.name}`,
      );
      if (emails.length > 0) {
        window.open(`mailto:${emails.join(",")}?subject=${subject}&body=${body}`);
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to confirm time slot.");
    } finally {
      setConfirming(null);
    }
  }

  // ### FORMAT HELPERS ###
  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-CA", {
      weekday: "long", month: "long", day: "numeric",
    });
  }
  function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric", minute: "2-digit", hour12: true,
    });
  }

  // ### LOADING ###
  if (isLoading) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px", textAlign: "center" }}>
        <p style={{ color: "#8e8e8e", paddingTop: "60px" }}>Loading group meeting...</p>
      </div>
    );
  }

  // ### NOT FOUND ###
  if (loadError || !instance) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
        <Card>
          <Card.Content>
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: "32px", marginBottom: "12px" }}>❌</p>
              <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>Group Meeting Not Found</h2>
              <p style={{ color: "#8e8e8e", fontSize: "15px", marginBottom: "24px" }}>
                {loadError ?? "This group meeting could not be found."}
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

  // ### SUCCESS SCREEN ###
  if (confirmedSlot) {
    return (
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "40px 20px" }}>
        <Card>
          <Card.Content>
            <div style={{ textAlign: "center", padding: "32px 0 24px" }}>
              <p style={{ fontSize: "40px", marginBottom: "12px" }}>✅</p>
              <h2 style={{ fontSize: "22px", margin: "0 0 8px" }}>Meeting Confirmed!</h2>
              <p style={{ color: "#8e8e8e", fontSize: "15px", marginBottom: "24px" }}>
                <strong>{instance.name}</strong> has been scheduled for:
              </p>

              {/* Confirmed time */}
              <div style={{
                background: "#f0f5fb", borderRadius: "12px",
                padding: "16px 20px", marginBottom: "20px", textAlign: "left",
              }}>
                <p style={{ fontWeight: 700, fontSize: "16px", margin: "0 0 4px" }}>
                  {fmtDate(confirmedSlot.startDateTime)}
                </p>
                <p style={{ color: "#507da7", fontSize: "15px", margin: 0 }}>
                  {fmtTime(confirmedSlot.startDateTime)} – {fmtTime(confirmedSlot.endDateTime)}
                </p>
              </div>

              {/* Attendee list */}
              {confirmedAttendees.length > 0 ? (
                <div style={{ textAlign: "left", marginBottom: "24px" }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#555", marginBottom: "8px" }}>
                    Confirmation email sent to:
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {confirmedAttendees.map((email) => (
                      <span key={email} style={{
                        fontSize: "13px", padding: "4px 10px",
                        background: "#f7f7f7", borderRadius: "6px", color: "#555",
                      }}>
                        {email}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ color: "#8e8e8e", fontSize: "14px", marginBottom: "24px" }}>
                  No participants had marked availability for this slot.
                </p>
              )}

              <p style={{ fontSize: "13px", color: "#8e8e8e", marginBottom: "24px" }}>
                This meeting will now appear in your Booking Slots on the dashboard.
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

  // ### MAIN VIEW ###
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>

      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "32px",
      }}>
        <div>
          <h1 style={{ fontSize: "28px", margin: "0 0 4px" }}>{instance.name}</h1>
          <p style={{ color: "#8e8e8e", fontSize: "15px", margin: 0 }}>
            Review availability responses and pick a final time.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          ← Back
        </Button>
      </div>

      {/* Instructions */}
      <div style={{
        background: "#e8f0f7", borderRadius: "10px",
        padding: "12px 16px", fontSize: "14px", color: "#507da7",
        marginBottom: "28px", fontWeight: 500,
      }}>
        Each card shows a proposed time option and who marked themselves available.
        Click <strong>Pick This Time</strong> to confirm — a notification email will open automatically.
      </div>

      {/* Action error */}
      {actionError && (
        <div style={{
          background: "#fbeaea", color: "#3a1f1f", borderRadius: "10px",
          padding: "12px 16px", fontSize: "14px", marginBottom: "20px",
        }}>
          {actionError}
        </div>
      )}

      {/* Slot cards */}
      {slots.length === 0 ? (
        <Card>
          <Card.Content>
            <p style={{ color: "#8e8e8e", textAlign: "center", padding: "24px 0" }}>
              No proposal slots found for this meeting.
            </p>
          </Card.Content>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {slots.map((slot) => {
            const available  = bookers[String(slot.bookingSlotID)] ?? [];
            const isConfirming = confirming === slot.bookingSlotID;

            return (
              <Card key={slot.bookingSlotID}>
                <Card.Header>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: "16px", margin: "0 0 2px" }}>
                        {fmtDate(slot.startDateTime)}
                      </p>
                      <p style={{ color: "#8e8e8e", fontSize: "14px", margin: 0 }}>
                        {fmtTime(slot.startDateTime)} – {fmtTime(slot.endDateTime)}
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
                        {available.map((b) => (
                          <span key={b.bookingID} style={{
                            fontSize: "12px", padding: "3px 10px",
                            background: "#f0f5fb", borderRadius: "999px",
                            color: "#507da7", fontWeight: 500,
                          }}>
                            {b.reservee.firstName} {b.reservee.lastName}
                            &nbsp;·&nbsp;{b.reservee.email}
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
                    onClick={() => handlePickTime(slot)}
                    disabled={isConfirming || available.length === 0}
                  >
                    {isConfirming ? "Confirming..." : "Pick This Time"}
                  </Button>
                </Card.Footer>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ConfirmGroupTime;
