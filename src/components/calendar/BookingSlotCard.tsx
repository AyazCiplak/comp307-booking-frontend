// Programmed by Ayaz Ciplak
import type { BookingSlot } from "../../types/booking";
import { useAuth } from "../../context/AuthContext";
import Card from "../ui/Card";
import Button from "../ui/Button";

interface BookingSlotCardProps {
  slot: BookingSlot;
  onBook?: (slotId: string) => void;
  onCancel?: (slotId: string) => void;
  onDelete?: (slotId: string) => void;
  /** Owner only — called when the "X registered" badge is clicked on an office-hour slot. */
  onViewRegistrants?: (slotId: string) => void;
}

// Colour-coded badge for the slot status
const STATUS_STYLES: Record<BookingSlot["status"], { label: string; color: string; bg: string }> = {
  available: { label: "Available", color: "#507da7", bg: "#e8f0f7" }, // Blue (from colour palette)
  booked: { label: "Booked", color: "#8e8e8e", bg: "#f0f0f0" }, // Grey (from colour palette)
  cancelled: { label: "Cancelled", color: "#bd271d", bg: "#fbeaea" }, // Red (from colour palette)
  pending: { label: "Pending", color: "#d6be46", bg: "#eaf2ff" }, // Yellow (outside colour palette, but should be fine) 
};

// Human-readable slot type pill
const TYPE_LABEL: Record<BookingSlot["type"], string> = {
  "office-hour": "Office Hour",
  "meeting": "Personal Meeting",
  "group": "Group",
};

function BookingSlotCard({ slot, onBook, onCancel, onDelete, onViewRegistrants }: BookingSlotCardProps) {
  const { user } = useAuth();
  const status = STATUS_STYLES[slot.status];

  // True only if the logged-in user is the owner of THIS slot.
  // This ensures owners see "Book" on other owners' slots, not management controls.
  const isOwner = user?.email === slot.ownerEmail;
  const isBookedByMe = slot.bookedByUserEmail === user?.email;

  // Format date: e.g. "Mon, Jan 20"
  const dateLabel = new Date(slot.date).toLocaleDateString("en-CA", {
    weekday: "short", month: "short", day: "numeric",
  });

  return (
    <Card>
      <Card.Header>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          {/* Slot title */}
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 600 }}>
              {slot.title ?? TYPE_LABEL[slot.type]}
            </h3>
            {/* Only show owner title when the viewer is NOT the owner
                (e.g. in "My Appointments" - the slot belongs to someone else).
                In "My Booking Slots" the owner is always the logged-in user, so it's redundant. */}
            {!isOwner && (
              <span style={{ fontSize: "13px", color: "#8e8e8e" }}>
                {slot.ownerName} · {slot.ownerEmail}
              </span>
            )}
          </div>

          {/* Status badge */}
          <span style={{
            fontSize: "12px", fontWeight: 600, padding: "3px 10px",
            borderRadius: "999px", color: status.color, background: status.bg,
          }}>
            {status.label}
          </span>
        </div>
      </Card.Header>

      <Card.Content>
        {/* Date + time */}
        <p style={{ marginBottom: "6px", fontSize: "15px" }}>
          {dateLabel} &nbsp;·&nbsp; {slot.startTime} - {slot.endTime}
        </p>

        {/* Slot type pill */}
        <span style={{
          fontSize: "12px", padding: "2px 8px", borderRadius: "999px",
          background: "#e0e0e0", color: "#505050",
        }}>
          {TYPE_LABEL[slot.type]}
        </span>

        {/* Who booked it - visible to owners */}
        {isOwner && slot.bookedByUserName && (
          <p style={{ marginTop: "10px", fontSize: "14px", color: "#8e8e8e" }}>
            Booked by: <strong>{slot.bookedByUserName}</strong> ({slot.bookedByUserEmail})
          </p>
        )}
      </Card.Content>

      <Card.Footer>
        <div style={{ display: "flex", gap: "8px" }}>

          {/* USER actions */}
          {!isOwner && slot.status === "available" && (
            <Button variant="primary" size="sm" onClick={() => onBook?.(slot.id)}>
              Book
            </Button>
          )}
          {!isOwner && isBookedByMe && (
            <>
              <Button variant="secondary" size="sm"
                onClick={() => window.open(`mailto:${slot.ownerEmail}`)}>
                Email Owner
              </Button>
              <Button variant="danger" size="sm" onClick={() => onCancel?.(slot.id)}>
                Deregister
              </Button>
            </>
          )}

          {/* OWNER actions */}
          {/* Personal meeting (Type 1): show Email Booker button */}
          {isOwner && slot.type === "meeting" && slot.bookedByUserEmail && (
            <Button variant="secondary" size="sm"
              onClick={() => window.open(`mailto:${slot.bookedByUserEmail}`)}>
              Email Booker
            </Button>
          )}
          {/* Office hours (Type 3): clickable registered-count badge */}
          {isOwner && slot.type === "office-hour" && (
            <button
              onClick={() => onViewRegistrants?.(slot.id)}
              title="View registered users"
              style={{
                background: "none", border: "none", cursor: onViewRegistrants ? "pointer" : "default",
                fontSize: "13px", color: "#507da7", fontWeight: 600, padding: 0,
                alignSelf: "center", fontFamily: "inherit",
                textDecoration: onViewRegistrants ? "underline dotted" : "none",
              }}
            >
              👥 {slot.registeredCount ?? 0} registered
            </button>
          )}
          {isOwner && (
            <Button variant="danger" size="sm" onClick={() => onDelete?.(slot.id)}>
              Delete Slot
            </Button>
          )}

        </div>
      </Card.Footer>
    </Card>
  );
}

export default BookingSlotCard;