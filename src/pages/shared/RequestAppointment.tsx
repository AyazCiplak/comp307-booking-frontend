// Programmed by Ayaz Ciplak
import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import CalendarComponent from "../../components/ui/CalendarComponent";
import { useAuth } from "../../context/AuthContext";
import { apiRequestBooking } from "../../api/booking";
import type { OwnerInfo } from "../../api/account";

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1.5px solid #d0d0d0",
  borderRadius: "8px",
  padding: "10px 14px",
  fontSize: "0.95rem",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
  background: "transparent",
};

/**
 * Request Appointment page (/browse/:ownerUsername/request).
 * Lets a user request a Type 1 meeting with a specific owner by picking a
 * preferred date/time and adding an optional message.
 *
 * Owner info is passed via React Router navigation state (set in OwnerAppointments.tsx).
 * On submit: POSTs to /api/requests/requestBooking, then opens a mailto: to notify the owner.
 */
function RequestAppointment() {
  const { ownerUsername } = useParams<{ ownerUsername: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Owner profile injected by OwnerAppointments via navigation state.
  // Falls back gracefully if the user navigated directly to this URL.
  const ownerInfo = location.state as OwnerInfo | null;
  const ownerEmail = `${ownerUsername}@mcgill.ca`;
  const ownerName = ownerInfo
    ? `${ownerInfo.firstName} ${ownerInfo.lastName}`
    : ownerEmail;

  // today at midnight — used as minDate on the calendar to block past dates
  const today = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (startTime >= endTime) {
      setError("End time must be after start time.");
      return;
    }
    if (!user?.token) return;

    setError("");
    setSubmitting(true);

    // Build ISO local datetime strings "YYYY-MM-DDTHH:MM:SS" that Jackson can deserialize
    // without a timezone suffix.  We use the locally selected date parts to avoid UTC drift.
    const y = selectedDate.getFullYear();
    const mo = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    const dateStr = `${y}-${mo}-${d}`;
    const startISO = `${dateStr}T${startTime}:00`;
    const endISO = `${dateStr}T${endTime}:00`;

    try {
      await apiRequestBooking({
        requesterToken: user.token,
        ownerEmail,
        startTime: startISO,
        endTime: endISO,
        message: message.trim() || null,
      });

      // Notify owner via mailto: (no mail server required)
      const dateLabel = selectedDate.toLocaleDateString("en-CA", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      });
      window.open(
        `mailto:${ownerEmail}` +
        `?subject=Meeting Request from ${encodeURIComponent(user.name)}` +
        `&body=Hi,%0A%0A` +
        `${encodeURIComponent(user.name)} (${encodeURIComponent(user.email)}) has requested a meeting with you on ` +
        `${encodeURIComponent(dateLabel)} from ${startTime} to ${endTime}.` +
        (message.trim() ? `%0A%0AMessage: "${encodeURIComponent(message.trim())}"` : "") +
        `%0A%0APlease log in to BookSoCS to accept or decline this request.`,
      );

      setSubmitted(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to send request. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Success state after submission
  if (submitted) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
        <Card>
          <Card.Content>
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: "32px", marginBottom: "12px" }}>✅</p>
              <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>Request Sent!</h2>
              <p style={{ color: "#8e8e8e", fontSize: "15px", marginBottom: "24px" }}>
                Your meeting request has been sent to {ownerName}. You'll be notified once they respond.
              </p>
              <Button variant="primary" onClick={() => navigate(`/browse/${ownerUsername}`)}>
                Back to {ownerName}'s Slots
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px" }}>

      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(`/browse/${ownerUsername}`)}
        style={{ marginBottom: "24px" }}
      >
        ← Back to {ownerName}'s Slots
      </Button>

      {/* Page heading */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", margin: "0 0 4px" }}>Request a Meeting</h1>
        <p style={{ color: "#8e8e8e", fontSize: "15px", margin: 0 }}>
          with {ownerName} · {ownerEmail}
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          background: "#fbeaea", color: "#3a1f1f",
          borderRadius: "10px", padding: "14px 18px",
          fontSize: "0.95rem", marginBottom: "20px",
        }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "32px", flexWrap: "wrap", alignItems: "flex-start" }}>

        {/* Left — calendar */}
        <div style={{ flexShrink: 0 }}>
          <p style={{ fontWeight: 600, fontSize: "15px", marginBottom: "12px" }}>
            Select a preferred date
          </p>
          <CalendarComponent minDate={today} onDateChange={(date) => setSelectedDate(date)} />
          <p style={{ marginTop: "10px", fontSize: "14px", color: "#507da7" }}>
            Selected: {selectedDate.toLocaleDateString("en-CA", {
              weekday: "long", month: "long", day: "numeric", year: "numeric",
            })}
          </p>
        </div>

        {/* Right — form details */}
        <div style={{ flex: 1, minWidth: "260px", display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Time inputs */}
          <div>
            <p style={{ fontWeight: 600, fontSize: "15px", marginBottom: "10px" }}>
              Preferred time
            </p>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <input
                type="time"
                value={startTime}
                max={endTime || undefined}
                onChange={(e) => setStartTime(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              <span style={{ color: "#8e8e8e", fontWeight: 600 }}>–</span>
              <input
                type="time"
                value={endTime}
                min={startTime || undefined}
                onChange={(e) => setEndTime(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <p style={{ fontWeight: 600, fontSize: "15px", marginBottom: "10px" }}>
              Message <span style={{ fontWeight: 400, color: "#8e8e8e" }}>(optional)</span>
            </p>
            <textarea
              placeholder={`Tell ${ownerName} what you'd like to discuss...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              style={{
                ...inputStyle,
                resize: "vertical",
                lineHeight: "1.5",
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "12px" }}>
            <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Sending…" : "Send Request"}
            </Button>
            <Button variant="ghost" onClick={() => navigate(`/browse/${ownerUsername}`)} disabled={submitting}>
              Cancel
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default RequestAppointment;
