// Programmed by Ayaz Ciplak
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import BookingSlotCard from "../../components/calendar/BookingSlotCard";
import { useAuth } from "../../context/AuthContext";
import type { OwnerInfo } from "../../api/account";
import { apiGetOwnerSlots, apiBookSlot, apiListUserBookings } from "../../api/booking";
import type { BookingSlot } from "../../types/booking";

/**
 * Owner Appointments page (/browse/:ownerUsername).
 * Shows a specific owner's AVAILABLE slots and a "Request a Meeting" CTA.
 *
 * Owner info is passed as React Router navigation state from BrowseOwners
 * (so we avoid another API call just to get the name/title/dept).
 * If navigated to directly (e.g. via shared URL), falls back gracefully.
 */
function OwnerAppointments() {
  const { ownerUsername } = useParams<{ ownerUsername: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Owner profile - injected by BrowseOwners via nav state; null if navigated directly.
  const ownerInfo = location.state as OwnerInfo | null;

  // Owners are always @mcgill.ca (only mcgill.ca accounts can create slots).
  const ownerEmail = `${ownerUsername}@mcgill.ca`;
  const ownerName  = ownerInfo
    ? `${ownerInfo.firstName} ${ownerInfo.lastName}`
    : ownerEmail; // safe fallback

  // Slot state
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Track which slots the current user has just booked (local session only).
  // Type-3 (office-hour) slots stay AVAILABLE in the DB after booking, so we
  // keep a local set so the UI can reflect "you already booked this".
  const [bookedIds, setBookedIds] = useState<Set<string>>(new Set());

  // Per-slot booking feedback: maps slotId -> "success" | "error message"
  const [bookFeedback, setBookFeedback] = useState<Record<string, string>>({});

  // Fetch owner's available slots AND the user's existing bookings in parallel.
  // The bookings are used to pre-mark already-booked slots so the Book button
  // appears disabled immediately on load (not just after clicking).
  useEffect(() => {
    if (!user?.token) return;

    Promise.all([
      apiGetOwnerSlots(ownerEmail, user.token),
      apiListUserBookings(user.token),
    ])
      .then(([fetchedSlots, userBookings]) => {
        setSlots(fetchedSlots);
        // Items with a bookingSlotID are BookingSlot entities (not Request entities).
        const preBooked = new Set<string>(
          userBookings
            .filter((item) => item.bookingSlotID != null)
            .map((item) => String(item.bookingSlotID)),
        );
        setBookedIds(preBooked);
      })
      .catch((err: unknown) => {
        setFetchError(
          err instanceof Error ? err.message : "Failed to load slots.",
        );
      })
      .finally(() => setIsLoading(false));
  }, [ownerEmail, user?.token]);

  // Book a slot 
  async function handleBook(slotId: string) {
    if (!user?.token) return;

    try {
      await apiBookSlot(Number(slotId), user.token);
      setBookedIds((prev) => new Set([...prev, slotId]));
      setBookFeedback((prev) => ({ ...prev, [slotId]: "✓ Booked!" }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Booking failed.";
      setBookFeedback((prev) => ({ ...prev, [slotId]: `⚠ ${msg}` }));
    }
  }

  // Split into available / "already booked by me"
  const availableSlots = slots.filter((s) => s.status === "available");

  // Render 
  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>

      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => navigate("/browse")} style={{ marginBottom: "24px" }}>
        ← Back to Browse
      </Button>

      {/* Owner header */}
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "28px", margin: "0 0 4px" }}>{ownerName}</h1>
        <p style={{ color: "#8e8e8e", fontSize: "15px", margin: 0 }}>
          {ownerInfo?.title}
          {ownerInfo?.title && ownerInfo?.department ? " · " : ""}
          {ownerInfo?.department}
          {(ownerInfo?.title || ownerInfo?.department) ? " · " : ""}
          {ownerEmail}
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
                  Send {ownerName} a meeting request and they will respond with a confirmed time.
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => navigate(`/browse/${ownerUsername}/request`, { state: ownerInfo })}
              >
                Request a Meeting
              </Button>
            </div>
          </Card.Content>
        </Card>
      </section>

      {/* Available office-hour slots */}
      <section>
        <h2 style={{ fontSize: "20px", margin: "0 0 16px" }}>Available Slots</h2>

        {/* Loading */}
        {isLoading && (
          <Card>
            <Card.Content>
              <p style={{ color: "#8e8e8e", textAlign: "center", padding: "24px 0" }}>
                Loading slots...
              </p>
            </Card.Content>
          </Card>
        )}

        {/* Fetch error */}
        {!isLoading && fetchError && (
          <Card>
            <Card.Content>
              <p style={{ color: "#c0392b", textAlign: "center", padding: "24px 0" }}>
                {fetchError}
              </p>
            </Card.Content>
          </Card>
        )}

        {/* Slots grid */}
        {!isLoading && !fetchError && (
          availableSlots.length > 0 ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
            }}>
              {availableSlots.map((slot) => {
                const alreadyBooked = bookedIds.has(slot.id);
                const feedback      = bookFeedback[slot.id];

                return (
                  <div key={slot.id}>
                    <BookingSlotCard
                      slot={alreadyBooked ? { ...slot, status: "booked" } : slot}
                      onBook={alreadyBooked ? undefined : handleBook}
                    />
                    {/* Inline booking feedback */}
                    {feedback && (
                      <p style={{
                        marginTop: "6px",
                        fontSize: "13px",
                        color: feedback.startsWith("✓") ? "#2e7d32" : "#c0392b",
                        textAlign: "center",
                      }}>
                        {feedback}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <Card>
              <Card.Content>
                <p style={{ color: "#8e8e8e", textAlign: "center", padding: "24px 0" }}>
                  No available slots at the moment. Try sending a meeting request instead.
                </p>
              </Card.Content>
            </Card>
          )
        )}
      </section>

    </div>
  );
}

export default OwnerAppointments;
