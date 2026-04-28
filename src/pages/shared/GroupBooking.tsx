
// Programmed by Ayaz Ciplak
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import {
  apiGetGroupInstanceByInviteToken,
  apiGetGroupProposals,
  apiGetGroupProposalCounts,
  apiGetMyBookings,
  apiMarkAvailabilityForProposal,
} from "../../api/booking";
import type {
  BackendGroupMeetingInstance,
  BackendBookingSlot,
} from "../../api/booking";

/**
 * Group Availability page (/invite/:inviteToken).
 * Reached by clicking an owner-generated invite URL (Type 2 meeting sequence).
 *
 * Flow:
 *  1. Resolve inviteToken -> GroupMeetingInstance (GET /api/groupMeetingInstances/inviteToken)
 *  2. Fetch all GROUP_PROPOSAL slots for the instance
 *  3. Fetch per-slot availability counts
 *  4. Fetch current user's own bookings to know which slots they already marked
 *  5. "Mark Available" -> POST /api/booking/markAvailabilityForProposal
 */
function GroupBooking() {
  const { inviteToken } = useParams<{ inviteToken: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ### STATE ###
  const [instance, setInstance] = useState<BackendGroupMeetingInstance | null>(null);
  const [slots, setSlots] = useState<BackendBookingSlot[]>([]);
  // Map of bookingSlotID (string) -> count of users who marked available
  const [counts, setCounts] = useState<Record<string, number>>({});
  // Set of bookingSlotIDs the current user has already marked
  const [markedIds, setMarkedIds] = useState<Set<number>>(new Set());

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [marking, setMarking] = useState<number | null>(null); // slotID being marked

  // ### FETCH ON MOUNT ###
  useEffect(() => {
    if (!inviteToken || !user?.token) return;

    // Step 1: resolve invite token -> instance
    apiGetGroupInstanceByInviteToken(inviteToken)
      .then((inst) => {
        setInstance(inst);
        const id = inst.groupMeetingInstanceID;
        const tok = user.token;

        // Steps 2-4 in parallel
        return Promise.all([
          apiGetGroupProposals(id, tok),
          apiGetGroupProposalCounts(id, tok),
          apiGetMyBookings(tok),
        ]).then(([proposalSlots, proposalCounts, myBookings]) => {
          setSlots(proposalSlots as BackendBookingSlot[]);
          setCounts(proposalCounts as Record<string, number>);

          // Any of the user's bookings whose slot belongs to this instance = already marked
          const alreadyMarked = new Set<number>(
            (myBookings as { bookingID: number; bookingSlot: BackendBookingSlot }[])
              .filter(
                (b) =>
                  b.bookingSlot.slotType === "GROUP_PROPOSAL" &&
                  proposalSlots.some(
                    (s: BackendBookingSlot) => s.bookingSlotID === b.bookingSlot.bookingSlotID,
                  ),
              )
              .map((b) => b.bookingSlot.bookingSlotID),
          );
          setMarkedIds(alreadyMarked);
        });
      })
      .catch((err: unknown) => {
        setLoadError(err instanceof Error ? err.message : "Failed to load invite page.");
      })
      .finally(() => setIsLoading(false));
  }, [inviteToken, user?.token]);

  // ### MARK AVAILABLE ###
  async function handleMarkAvailable(slotId: number) {
    if (!user?.token) return;
    setActionError(null);
    setMarking(slotId);
    try {
      await apiMarkAvailabilityForProposal(slotId, user.token);
      // Optimistically update UI: mark the slot + bump its count
      setMarkedIds((prev) => new Set([...prev, slotId]));
      setCounts((prev) => ({
        ...prev,
        [String(slotId)]: (prev[String(slotId)] ?? 0) + 1,
      }));
      // Also update the slot's status if it's now full
      setSlots((prev) =>
        prev.map((s) => {
          if (s.bookingSlotID !== slotId) return s;
          const newCount = (counts[String(slotId)] ?? 0) + 1;
          return {
            ...s,
            slotStatus:
              newCount >= s.maxUsers
                ? ("BOOKED" as const)
                : s.slotStatus,
          };
        }),
      );
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : "Failed to mark availability.",
      );
    } finally {
      setMarking(null);
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

  // ### LOADING / ERROR ###
  if (isLoading) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px", textAlign: "center" }}>
        <p style={{ color: "#8e8e8e", paddingTop: "60px" }}>Loading invite...</p>
      </div>
    );
  }

  if (loadError || !instance) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
        <Card>
          <Card.Content>
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: "32px", marginBottom: "12px" }}>❌</p>
              <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>Invite Link Not Found</h2>
              <p style={{ color: "#8e8e8e", fontSize: "15px", marginBottom: "24px" }}>
                {loadError ?? "This invite link may be invalid or has expired."}
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

  // ### FINALIZED SCREEN (invite URL is no longer active) ###
  if (instance.finalized) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
        <Card>
          <Card.Content>
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: "40px", marginBottom: "12px" }}>🔒</p>
              <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>Meeting Already Confirmed</h2>
              <p style={{ color: "#8e8e8e", fontSize: "15px", marginBottom: "8px" }}>
                <strong>{instance.name}</strong> has been finalized by {instance.owner.firstName} {instance.owner.lastName}.
              </p>
              <p style={{ color: "#8e8e8e", fontSize: "14px", marginBottom: "24px" }}>
                This invite link is no longer active. If you were marked as available, the
                confirmed meeting should appear in your <strong>My Appointments</strong> on the dashboard.
              </p>
              <Button variant="primary" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>
    );
  }

  // ### MAIN VIEW ###
  const isOwnLink = user?.email === instance.owner.email;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>

      {/* Owner preview banner */}
      {isOwnLink && (
        <div style={{
          background: "#fff8e1", border: "1px solid #ffe082", borderRadius: "10px",
          padding: "12px 16px", fontSize: "14px", color: "#7a6000",
          marginBottom: "24px", fontWeight: 500,
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          <span>🔒</span>
          <span>
            This is your own invite link. Share it with participants so they can mark their
            availability - you cannot mark availability on your own meeting.
          </span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "28px", margin: "0 0 4px" }}>{instance.name}</h1>
        <p style={{ color: "#8e8e8e", fontSize: "15px", margin: "0 0 12px" }}>
          Hosted by {instance.owner.firstName} {instance.owner.lastName}&nbsp;·&nbsp;{instance.owner.email}
        </p>
        <div style={{
          display: "inline-flex", gap: "12px",
          background: "#f7f7f7", borderRadius: "8px",
          padding: "8px 14px", fontSize: "14px", color: "#555",
        }}>
          <span>👥 Max {instance.maxUsers} per option</span>
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
        Mark all the time options you are available for. The organizer will pick a final time based on responses.
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

      {/* Slot list */}
      {slots.length === 0 ? (
        <Card>
          <Card.Content>
            <p style={{ color: "#8e8e8e", textAlign: "center", padding: "24px 0" }}>
              No time slots have been added to this meeting yet.
            </p>
          </Card.Content>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
          {slots.map((slot) => {
            const count     = counts[String(slot.bookingSlotID)] ?? 0;
            const ceiling   = slot.maxUsers;
            const isFull    = slot.slotStatus === "BOOKED";
            const alreadyMarked = markedIds.has(slot.bookingSlotID);
            const fillPct   = Math.min((count / Math.max(ceiling, 1)) * 100, 100);
            const isMarking = marking === slot.bookingSlotID;

            return (
              <Card key={slot.bookingSlotID}>
                <Card.Content>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "flex-start", gap: "16px", flexWrap: "wrap",
                  }}>

                    {/* Date + time + fill bar */}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: "16px", margin: "0 0 4px" }}>
                        {fmtDate(slot.startDateTime)}
                      </p>
                      <p style={{ color: "#8e8e8e", fontSize: "14px", margin: "0 0 12px" }}>
                        {fmtTime(slot.startDateTime)} – {fmtTime(slot.endDateTime)}
                      </p>

                      {/* Fill bar */}
                      <div style={{ marginBottom: "6px" }}>
                        <div style={{
                          height: "6px", borderRadius: "999px",
                          background: "#e8e8e8", overflow: "hidden",
                          width: "100%", maxWidth: "200px",
                        }}>
                          <div style={{
                            height: "100%",
                            width: `${fillPct}%`,
                            background: isFull ? "#bd271d" : "#507da7",
                            borderRadius: "999px",
                            transition: "width 0.3s",
                          }} />
                        </div>
                        <p style={{ fontSize: "12px", color: "#8e8e8e", margin: "4px 0 0" }}>
                          {count} / {ceiling} marked available
                        </p>
                      </div>
                    </div>

                    {/* Action button */}
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {isOwnLink ? (
                        <span style={{
                          fontSize: "13px", fontWeight: 600,
                          padding: "6px 14px", borderRadius: "999px",
                          background: "#fff8e1", color: "#7a6000",
                        }}>
                          Your slot
                        </span>
                      ) : alreadyMarked ? (
                        <span style={{
                          fontSize: "13px", fontWeight: 600,
                          padding: "6px 14px", borderRadius: "999px",
                          background: "#e8f0f7", color: "#507da7",
                        }}>
                          Available!
                        </span>
                      ) : isFull ? (
                        <span style={{
                          fontSize: "13px", fontWeight: 600,
                          padding: "6px 14px", borderRadius: "999px",
                          background: "#fbeaea", color: "#bd271d",
                        }}>
                          Full
                        </span>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleMarkAvailable(slot.bookingSlotID)}
                          disabled={isMarking}
                        >
                          {isMarking ? "Saving..." : "Mark Available"}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card.Content>
              </Card>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", gap: "12px" }}>
        <Button variant="primary" onClick={() => navigate("/dashboard")}>
          Done - Go to Dashboard
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            window.open(
              `mailto:${instance.owner.email}?subject=Re: ${encodeURIComponent(instance.name)}`,
            )
          }
        >
          Email {instance.owner.firstName}
        </Button>
      </div>

    </div>
  );
}

export default GroupBooking;
