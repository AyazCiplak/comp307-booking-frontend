// Programmed by Ayaz Ciplak
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import BookingSlotCard from "../../components/calendar/BookingSlotCard";
import {
  apiGetMyBookings,
  apiUnbook,
  apiGetMyRequests,
  apiCancelRequest,
  apiGetOwnerOwnedSlots,
  apiGetSlotBookingCounts,
  apiGetSlotBookers,
  apiCancelSlot,
  apiGetPendingRequests,
  apiAcceptRequest,
  apiDeclineRequest,
  mapBackendSlot,
  apiGetMyGroupInstances,
  apiGetAllOfficeHourSlotBookings,
} from "../../api/booking";
import type {
  BackendBooking,
  BackendRequest,
  BackendBookingSlot,
  BackendGroupMeetingInstance,
} from "../../api/booking";
import type { BookingSlot } from "../../types/booking";

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
 *  1. "My Appointments" -> all users: confirmed office-hour bookings + accepted requests
 *  2. "Find a Slot" -> all users: CTA to browse owners
 *  3. "Pending Requests" -> OWNERS ONLY: incoming Type 1 requests to accept / decline
 *  4. "My Booking Slots" -> OWNERS ONLY: office-hour slots they created (Type 3)
 *  5. "My Pending Group Meetings" -> OWNERS ONLY: Type 2 placeholder (wired in next sprint)
 */
function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isOwner = user?.role === "owner";

  // ### DATA STATE ###
  const [myBookings, setMyBookings] = useState<BackendBooking[]>([]);
  const [myRequests, setMyRequests] = useState<BackendRequest[]>([]); // user's outgoing pending requests
  const [ownerSlots, setOwnerSlots] = useState<BookingSlot[]>([]);
  const [pendingRequests, setPendingRequests] = useState<BackendRequest[]>([]);
  const [groupMeetings, setGroupMeetings] = useState<BackendGroupMeetingInstance[]>([]);
  // Map of slotId -> all Bookings for every OFFICE_HOURS slot (owner-only)
  const [allOfficeHourBookings, setAllOfficeHourBookings] = useState<Record<string, BackendBooking[]>>({});
  // Registrants modal state
  const [registrantsModal, setRegistrantsModal] = useState<{ slot: BookingSlot; bookers: BackendBooking[] } | null>(null);

  // ### UI STATE ###
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // ### FETCH ON MOUNT ###
  useEffect(() => {
    if (!user?.token) return;

    const fetchBookings = apiGetMyBookings(user.token);
    const fetchMyReqs = apiGetMyRequests(user.token);  // outgoing pending requests (all users)
    const fetchSlots = isOwner
      ? apiGetOwnerOwnedSlots(user.token)
      : Promise.resolve([] as BackendBookingSlot[]);
    const fetchCounts = isOwner
      ? apiGetSlotBookingCounts(user.token)
      : Promise.resolve({} as Record<string, number>);
    const fetchBookers = isOwner
      ? apiGetSlotBookers(user.token)
      : Promise.resolve({} as Record<string, BackendBooking>);
    const fetchRequests = isOwner
      ? apiGetPendingRequests(user.token)
      : Promise.resolve([] as BackendRequest[]);
    const fetchGroupMeetings = isOwner
      ? apiGetMyGroupInstances(user.token)
      : Promise.resolve([] as BackendGroupMeetingInstance[]);
    const fetchOfficeHourBookings = isOwner
      ? apiGetAllOfficeHourSlotBookings(user.token)
      : Promise.resolve({} as Record<string, BackendBooking[]>);

    Promise.all([fetchBookings, fetchMyReqs, fetchSlots, fetchCounts, fetchBookers, fetchRequests, fetchGroupMeetings, fetchOfficeHourBookings])
      .then(([bookings, myReqs, slots, counts, bookers, requests, groups, officeHourBookings]) => {
        setMyBookings(bookings);
        setMyRequests(myReqs);
        // Merge booking counts + booker info into each mapped slot
        // Exclude GROUP_PROPOSAL slots from "My Booking Slots" - those belong in
        // "My Pending Group Meetings" until the owner confirms a final time.
        // GROUP_SELECTED (confirmed) slots DO appear here.
        setOwnerSlots(
          (slots as BackendBookingSlot[])
            .filter((s) => s.slotType !== "GROUP_PROPOSAL")
            .map((s) => {
              const mapped = mapBackendSlot(s);
              const count = (counts  as Record<string, number>)[String(s.bookingSlotID)] ?? 0;
              const booker = (bookers as Record<string, BackendBooking>)[String(s.bookingSlotID)];
              return {
                ...mapped,
                registeredCount: count,
                bookedByUserName: booker
                  ? `${booker.reservee.firstName} ${booker.reservee.lastName}`
                  : undefined,
                bookedByUserEmail: booker?.reservee.email,
              };
            }),
        );
        setPendingRequests(requests);
        setGroupMeetings(groups as BackendGroupMeetingInstance[]);
        setAllOfficeHourBookings(officeHourBookings as Record<string, BackendBooking[]>);
      })
      .catch((err: unknown) => {
        setLoadError(
          err instanceof Error ? err.message : "Failed to load dashboard data.",
        );
      })
      .finally(() => setIsLoading(false));
  }, [user?.token, isOwner]);

  // ### HANDLERS ###

  async function handleUnbook(bookingId: string) {
    if (!user?.token) return;
    setActionError(null);
    try {
      await apiUnbook(Number(bookingId), user.token);
      setMyBookings((prev) => prev.filter((b) => String(b.bookingID) !== bookingId));
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to cancel booking.");
    }
  }

  async function handleCancelSlot(slotId: string) {
    if (!user?.token) return;
    setActionError(null);
    try {
      // Fire a cancellation mailto to all registered users + the owner before cancelling
      const registrants = allOfficeHourBookings[slotId] ?? [];
      const slot = ownerSlots.find((s) => s.id === slotId);
      const allEmails = [
        ...registrants.map((b) => b.reservee.email),
        ...(user.email ? [user.email] : []),
      ];
      if (allEmails.length > 0 && slot) {
        const dateLabel = new Date(slot.date).toLocaleDateString("en-CA", {
          weekday: "long", month: "long", day: "numeric",
        });
        const subject = encodeURIComponent(
          `[BookSoCS] Slot Cancelled: ${slot.title || "Office Hours"}`,
        );
        const body = encodeURIComponent(
          `Hi everyone,\n\n` +
          `The office hours slot "${slot.title || "Office Hours"}" scheduled for ` +
          `${dateLabel}, ${slot.startTime} – ${slot.endTime} has been cancelled.\n\n` +
          `We apologize for any inconvenience.\n\n` +
          `Best,\n${user.name}`,
        );
        window.open(`mailto:${allEmails.join(",")}?subject=${subject}&body=${body}`);
      }
      await apiCancelSlot(Number(slotId), user.token);
      setOwnerSlots((prev) => prev.filter((s) => s.id !== slotId));
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to cancel slot.");
    }
  }

  async function handleAcceptRequest(req: BackendRequest) {
    if (!user?.token) return;
    setActionError(null);
    try {
      await apiAcceptRequest(req.id, user.token);
      setPendingRequests((prev) => prev.filter((r) => r.id !== req.id));

      // Re-fetch slots + bookers so the new MEETING slot appears immediately
      // without requiring a page reload.
      const token = user.token;
      const [newSlots, newCounts, newBookers] = await Promise.all([
        apiGetOwnerOwnedSlots(token),
        apiGetSlotBookingCounts(token),
        apiGetSlotBookers(token),
      ]);
      setOwnerSlots(
        (newSlots as BackendBookingSlot[])
          .filter((s) => s.slotType !== "GROUP_PROPOSAL")
          .map((s) => {
            const mapped = mapBackendSlot(s);
            const count = (newCounts  as Record<string, number>)[String(s.bookingSlotID)] ?? 0;
            const booker = (newBookers as Record<string, BackendBooking>)[String(s.bookingSlotID)];
            return {
              ...mapped,
              registeredCount: count,
              bookedByUserName: booker
                ? `${booker.reservee.firstName} ${booker.reservee.lastName}`
                : undefined,
              bookedByUserEmail: booker?.reservee.email,
            };
          }),
      );

      // Notify requester via mailto:
      const date = new Date(req.requestedStart).toLocaleDateString("en-CA", {
        weekday: "short", month: "short", day: "numeric",
      });
      const time = new Date(req.requestedStart).toLocaleTimeString("en-US", {
        hour: "numeric", minute: "2-digit", hour12: true,
      });
      window.open(
        `mailto:${req.requester.email}?subject=Meeting Request Accepted&body=Hi ${req.requester.firstName},%0A%0AYour meeting request for ${date} at ${time} has been accepted!%0A%0ABest,%0A${user.name}`,
      );
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to accept request.");
    }
  }

  async function handleDeclineRequest(req: BackendRequest) {
    if (!user?.token) return;
    setActionError(null);
    try {
      await apiDeclineRequest(req.id, user.token);
      setPendingRequests((prev) => prev.filter((r) => r.id !== req.id));
      // Notify requester via mailto:
      window.open(
        `mailto:${req.requester.email}?subject=Meeting Request&body=Hi ${req.requester.firstName},%0A%0AUnfortunately your meeting request could not be accommodated at this time.%0A%0ABest,%0A${user.name}`,
      );
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to decline request.");
    }
  }

  /** Requester cancels their own outgoing pending request. */
  async function handleCancelRequest(requestId: number) {
    if (!user?.token) return;
    setActionError(null);
    try {
      await apiCancelRequest(requestId, user.token);
      setMyRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to cancel request.");
    }
  }

  // ### FORMAT HELPERS ###
  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-CA", {
      weekday: "short", month: "short", day: "numeric", year: "numeric",
    });
  }
  function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric", minute: "2-digit", hour12: true,
    });
  }

  // ### STYLE HELPERS ###
  const sectionHeading: React.CSSProperties = { fontSize: "20px", margin: "0 0 16px" };
  const sectionRow: React.CSSProperties     = {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: "16px",
  };
  const emptyNote = (msg: string) => (
    <Card>
      <Card.Content>
        <p style={{ color: "#8e8e8e", textAlign: "center", padding: "24px 0" }}>{msg}</p>
      </Card.Content>
    </Card>
  );

  // ### LOADING / ERROR SCREENS ###
  if (isLoading) {
    return (
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>
        <p style={{ color: "#8e8e8e", textAlign: "center", paddingTop: "60px" }}>
          Loading dashboard...
        </p>
      </div>
    );
  }
  if (loadError) {
    return (
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ background: "#fbeaea", color: "#3a1f1f", borderRadius: "10px", padding: "16px 20px" }}>
          {loadError}
        </div>
      </div>
    );
  }

  // ### MAIN CONTENT ###
  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>

      {/* Page heading */}
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "4px" }}>
          Welcome back, {user?.name}
        </h1>
        <p style={{ color: "#8e8e8e", fontSize: "15px" }}>
          {isOwner ? "Owner" : "Student"} · {user?.email}
        </p>
      </div>

      {/* Action error banner */}
      {actionError && (
        <div style={{
          background: "#fbeaea", color: "#3a1f1f", borderRadius: "10px",
          padding: "14px 18px", fontSize: "0.95rem", marginBottom: "24px",
        }}>
          {actionError}
        </div>
      )}

      {/* Section 1: My Appointments (all users) */}
      <section style={{ marginBottom: "48px" }}>
        <h2 style={sectionHeading}>My Appointments</h2>

        {myRequests.length === 0 && myBookings.filter((b) => b.bookingSlot.slotType !== "GROUP_PROPOSAL").length === 0 ? (
          emptyNote("You have no upcoming appointments.")
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* Pending 1:1 meeting requests sent by this user (awaiting owner response) */}
            {myRequests.map((req) => (
              <Card key={`req-${req.id}`}>
                <Card.Content>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "flex-start", gap: "16px", flexWrap: "wrap",
                  }}>
                    <div>
                      {/* Pending badge */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <p style={{ fontWeight: 600, fontSize: "15px", margin: 0 }}>
                          Meeting Request — {req.owner.firstName} {req.owner.lastName}
                        </p>
                        <span style={{
                          fontSize: "11px", fontWeight: 700, padding: "2px 9px",
                          borderRadius: "999px", background: "#fff8e1", color: "#b78800",
                          whiteSpace: "nowrap",
                        }}>
                          Pending
                        </span>
                      </div>
                      <p style={{ color: "#555", fontSize: "14px", margin: "0 0 2px" }}>
                        📅&nbsp;{fmtDate(req.requestedStart)}&nbsp;·&nbsp;
                        {fmtTime(req.requestedStart)} – {fmtTime(req.requestedEnd)}
                      </p>
                      {req.message && (
                        <p style={{ color: "#8e8e8e", fontSize: "13px", margin: "4px 0 0", fontStyle: "italic" }}>
                          "{req.message}"
                        </p>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "8px", flexShrink: 0, alignItems: "center" }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`mailto:${req.owner.email}`)}
                      >
                        Email Owner
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancelRequest(req.id)}
                      >
                        Cancel Request
                      </Button>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            ))}

            {/* Confirmed bookings (office hours + accepted 1:1s + confirmed group meetings).
                GROUP_PROPOSAL bookings are hidden until the owner selects a time (-> GROUP_SELECTED). */}
            {myBookings
              .filter((b) => b.bookingSlot.slotType !== "GROUP_PROPOSAL")
              .map((booking) => {
              const slot  = booking.bookingSlot;
              const owner = slot.owner;
              return (
                <Card key={booking.bookingID}>
                  <Card.Content>
                    <div style={{
                      display: "flex", justifyContent: "space-between",
                      alignItems: "flex-start", gap: "16px", flexWrap: "wrap",
                    }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: "15px", margin: "0 0 4px" }}>
                          {slot.title || "Office Hours"}
                        </p>
                        <p style={{ color: "#555", fontSize: "14px", margin: "0 0 2px" }}>
                          📅&nbsp;{fmtDate(slot.startDateTime)}&nbsp;·&nbsp;
                          {fmtTime(slot.startDateTime)} – {fmtTime(slot.endDateTime)}
                        </p>
                        <p style={{ color: "#8e8e8e", fontSize: "13px", margin: 0 }}>
                          {owner.firstName} {owner.lastName}
                          &nbsp;·&nbsp;{owner.title || owner.department || owner.email}
                        </p>
                      </div>

                      <div style={{ display: "flex", gap: "8px", flexShrink: 0, alignItems: "center" }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `mailto:${owner.email}?subject=Regarding my booking: ${slot.title || "Office Hours"}`,
                            )
                          }
                        >
                          Email Owner
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleUnbook(String(booking.bookingID))}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              );
            })}

          </div>
        )}
      </section>

      {/* Section 2: Find a Slot (all users) */}
      <section style={{ marginBottom: "48px" }}>
        <h2 style={sectionHeading}>Find a Slot</h2>
        <Card>
          <Card.Content>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", gap: "24px", flexWrap: "wrap", padding: "8px 0",
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

      {/* ## Owner-only sections ## */}
      {isOwner && (
        <>
          {/* Section 3: Pending Requests (Type 1) */}
          <section style={{ marginBottom: "48px" }}>
            <h2 style={sectionHeading}>Pending Requests</h2>

            {pendingRequests.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {pendingRequests.map((req) => (
                  <Card key={req.id}>
                    <Card.Header>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: "16px", margin: "0 0 2px" }}>
                            {req.requester.firstName} {req.requester.lastName}
                          </p>
                          <p style={{ color: "#8e8e8e", fontSize: "13px", margin: 0 }}>
                            {req.requester.email}
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
                        📅&nbsp;{fmtDate(req.requestedStart)}&nbsp;·&nbsp;
                        {fmtTime(req.requestedStart)} – {fmtTime(req.requestedEnd)}
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
                        <Button variant="primary" size="sm" onClick={() => handleAcceptRequest(req)}>
                          Accept
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDeclineRequest(req)}>
                          Decline
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`mailto:${req.requester.email}`)}
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

          {/* Section 4: My Booking Slots (Type 3 office hours + any accepted Type 1 slots) */}
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

            {ownerSlots.filter((s) => s.status !== "cancelled").length > 0 ? (
              <div style={GRID}>
                {ownerSlots
                  .filter((s) => s.status !== "cancelled")
                  .map((slot) => (
                    <BookingSlotCard
                      key={slot.id}
                      slot={slot}
                      onDelete={handleCancelSlot}
                      onViewRegistrants={(sid) => {
                        const bookers = allOfficeHourBookings[sid] ?? [];
                        const s = ownerSlots.find((os) => os.id === sid);
                        if (s) setRegistrantsModal({ slot: s, bookers });
                      }}
                    />
                  ))}
              </div>
            ) : (
              emptyNote("You have not created any booking slots yet.")
            )}
          </section>

          {/* Section 5: My Pending Group Meetings (Type 2) */}
          <section style={{ marginBottom: "48px" }}>
            <div style={sectionRow}>
              <h2 style={{ fontSize: "20px", margin: 0 }}>My Pending Group Meetings</h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate("/owner/create-slot", { state: { kind: "group" } })}
              >
                + Create Group Meeting
              </Button>
            </div>

            {groupMeetings.length === 0 ? (
              emptyNote(
                "No group meetings yet. Use \"Create Group Meeting\" to set one up " +
                "and share an invite link with participants.",
              )
            ) : (
              <div style={GRID}>
                {groupMeetings.map((gm) => {
                  const inviteUrl = `${window.location.origin}/invite/${gm.inviteToken}`;
                  return (
                    <Card key={gm.groupMeetingInstanceID}>
                      <Card.Header>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <p style={{ fontWeight: 700, fontSize: "15px", margin: 0 }}>
                            {gm.name}
                          </p>
                          <span style={{
                            fontSize: "11px", fontWeight: 700, padding: "2px 9px",
                            borderRadius: "999px", background: "#e8f0f7", color: "#507da7",
                            whiteSpace: "nowrap", marginLeft: "8px",
                          }}>
                            👥 Max {gm.maxUsers}
                          </span>
                        </div>
                      </Card.Header>
                      <Card.Content>
                        {/* Invite URL row */}
                        <div style={{
                          display: "flex", alignItems: "center", gap: "8px",
                          background: "#f7f7f7", borderRadius: "8px",
                          padding: "8px 10px", marginBottom: "12px",
                        }}>
                          <span style={{
                            flex: 1, fontSize: "12px", color: "#507da7",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {inviteUrl}
                          </span>
                          <button
                            style={{
                              background: "none", border: "none", cursor: "pointer",
                              fontSize: "12px", color: "#507da7", fontWeight: 600,
                              padding: "2px 6px", fontFamily: "inherit", flexShrink: 0,
                            }}
                            onClick={() => navigator.clipboard.writeText(inviteUrl)}
                          >
                            Copy
                          </button>
                        </div>
                      </Card.Content>
                      <Card.Footer>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/owner/confirm-group/${gm.groupMeetingInstanceID}`)}
                        >
                          Confirm Time
                        </Button>
                      </Card.Footer>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {/* Registrants modal */}
      {registrantsModal && (
        <div
          onClick={() => setRegistrantsModal(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          }}
        >
          {/* Stop clicks inside the panel from closing the modal */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: "16px", padding: "28px 32px",
              width: "100%", maxWidth: "500px", maxHeight: "80vh", overflowY: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "18px", margin: "0 0 4px" }}>Registered Users</h2>
                <p style={{ color: "#8e8e8e", fontSize: "13px", margin: 0 }}>
                  {registrantsModal.slot.title || "Office Hours"}&nbsp;·&nbsp;
                  {new Date(registrantsModal.slot.date).toLocaleDateString("en-CA", {
                    weekday: "short", month: "short", day: "numeric",
                  })}&nbsp;·&nbsp;
                  {registrantsModal.slot.startTime} – {registrantsModal.slot.endTime}
                </p>
              </div>
              <button
                onClick={() => setRegistrantsModal(null)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: "22px", color: "#8e8e8e", padding: "0 4px",
                  lineHeight: 1, fontFamily: "inherit",
                }}
              >×</button>
            </div>

            {/* Body */}
            {registrantsModal.bookers.length === 0 ? (
              <p style={{ color: "#8e8e8e", textAlign: "center", padding: "20px 0", fontSize: "14px" }}>
                No one has registered for this slot yet.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {registrantsModal.bookers.map((b) => (
                  <div key={b.bookingID} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 14px", background: "#f7f7f7", borderRadius: "10px",
                  }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: "14px", margin: "0 0 2px" }}>
                        {b.reservee.firstName} {b.reservee.lastName}
                      </p>
                      <p style={{ color: "#8e8e8e", fontSize: "13px", margin: 0 }}>
                        {b.reservee.email}
                      </p>
                    </div>
                    <button
                      onClick={() => window.open(`mailto:${b.reservee.email}`)}
                      style={{
                        background: "none", border: "1px solid #e0e0e0", borderRadius: "8px",
                        cursor: "pointer", fontSize: "12px", color: "#507da7",
                        padding: "4px 10px", fontFamily: "inherit",
                      }}
                    >
                      Email
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div style={{ marginTop: "20px", textAlign: "right" }}>
              <Button variant="ghost" size="sm" onClick={() => setRegistrantsModal(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;
