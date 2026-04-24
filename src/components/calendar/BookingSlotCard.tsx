import type { BookingSlot } from "../../types/booking";
import { useAuth } from "../../context/AuthContext";
import Card from "../ui/Card";
import Button from "../ui/Button";

interface BookingSlotCardProps {
  slot: BookingSlot;
  onBook?:   (slotId: string) => void;
  onCancel?: (slotId: string) => void;
  onDelete?: (slotId: string) => void;
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
  "meeting": "Meeting",
  "group": "Group",
};

function BookingSlotCard({ slot, onBook, onCancel, onDelete }: BookingSlotCardProps) {
  const { user } = useAuth();
  const status = STATUS_STYLES[slot.status];

  const isOwner    = user?.role === "owner";
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
            <span style={{ fontSize: "13px", color: "#8e8e8e" }}>
              {slot.ownerName} · {slot.ownerEmail}
            </span>
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

        {/* Who booked it — visible to owners */}
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
                Cancel
              </Button>
            </>
          )}

          {/* OWNER actions */}
          {isOwner && slot.bookedByUserEmail && (
            <Button variant="secondary" size="sm"
              onClick={() => window.open(`mailto:${slot.bookedByUserEmail}`)}>
              Email Booker
            </Button>
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