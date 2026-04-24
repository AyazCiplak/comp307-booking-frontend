import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import CalendarComponent from "../../components/ui/CalendarComponent";
import { mockOwners } from "../../data/mockSlots";
import { useAuth } from "../../context/AuthContext";

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
 * On submit: logs the request (TODO: POST /api/requests) + navigates back.
 */
function RequestAppointment() {
  const { ownerUsername } = useParams<{ ownerUsername: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const ownerEmail = `${ownerUsername}@mcgill.ca`;
  const owner = mockOwners.find((o) => o.email === ownerEmail);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!selectedDate || !startTime || !endTime) {
      setError("Please select a date and provide both start and end times.");
      return;
    }
    if (startTime >= endTime) {
      setError("End time must be after start time.");
      return;
    }

    setError("");
    // TODO: POST /api/requests → { ownerEmail, requestedDate, startTime, endTime, message }
    // then send mailto: to owner notifying them of the request
    console.log("Meeting request submitted:", {
      requester: user?.email,
      owner: ownerEmail,
      date: selectedDate.toLocaleDateString(),
      startTime,
      endTime,
      message,
    });

    setSubmitted(true);
  }

  if (!owner) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
        <Card>
          <Card.Content>
            <p style={{ color: "#8e8e8e", textAlign: "center", padding: "32px 0" }}>
              Owner not found.
            </p>
          </Card.Content>
        </Card>
      </div>
    );
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
                Your meeting request has been sent to {owner.name}. You'll be notified once they respond.
              </p>
              <Button variant="primary" onClick={() => navigate(`/browse/${ownerUsername}`)}>
                Back to {owner.name}'s Slots
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
        ← Back to {owner.name}'s Slots
      </Button>

      {/* Page heading */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", margin: "0 0 4px" }}>Request a Meeting</h1>
        <p style={{ color: "#8e8e8e", fontSize: "15px", margin: 0 }}>
          with {owner.name} · {owner.email}
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
          <CalendarComponent onDateChange={(date) => setSelectedDate(date)} />
          {selectedDate && (
            <p style={{ marginTop: "10px", fontSize: "14px", color: "#507da7" }}>
              Selected: {selectedDate.toLocaleDateString("en-CA", {
                weekday: "long", month: "long", day: "numeric", year: "numeric",
              })}
            </p>
          )}
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
                onChange={(e) => setStartTime(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              <span style={{ color: "#8e8e8e", fontWeight: 600 }}>–</span>
              <input
                type="time"
                value={endTime}
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
              placeholder={`Tell ${owner.name} what you'd like to discuss...`}
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
            <Button variant="primary" onClick={handleSubmit}>
              Send Request
            </Button>
            <Button variant="ghost" onClick={() => navigate(`/browse/${ownerUsername}`)}>
              Cancel
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default RequestAppointment;
