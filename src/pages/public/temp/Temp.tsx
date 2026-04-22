import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import CalendarComponent from "../../../components/ui/CalendarComponent";

// TEMP file to illustrate reusable components created
function Temp() {
  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "30px" }}>
        (TEMP) Components Illustration
      </h1>

      <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>
        Buttons Demo - All Variants
      </h2>
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "40px",
          flexWrap: "wrap",
        }}
      >
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="ghost">Ghost</Button>
      </div>

      <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>Button Sizes</h2>
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          marginBottom: "40px",
        }}
      >
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>

      <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>Card Component</h2>
      <p style={{ marginBottom: "20px", color: "#666" }}>
        Cards are a container copmonent that group related information together
        with consistent styling/borders/etc. Will be used within the dashboard
        to format appointments, booking slots, and calendar entries.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "24px",
          marginBottom: "40px",
        }}
      >
        <Card>
          <Card.Header>
            <h3 style={{ margin: 0, fontSize: "18px" }}>
              E.g. Office Hour Booking
            </h3>
          </Card.Header>
          <Card.Content>
            <p>Prof. Vybihal</p>
            <p>Monday 10:00 AM - 11:00 AM</p>
            <p>Status: Available</p>
          </Card.Content>
          <Card.Footer>
            <Button variant="primary" size="sm">
              Book Appointment
            </Button>
          </Card.Footer>
        </Card>

        <Card>
          <Card.Header>
            <h3 style={{ margin: 0, fontSize: "18px" }}>
              E.g. Upcoming Appointment
            </h3>
          </Card.Header>
          <Card.Content>
            <p>Meeting with TA</p>
            <p>Wednesday 2:00 PM</p>
            <p>Status: Confirmed</p>
          </Card.Content>
          <Card.Footer>
            <div style={{ display: "flex", gap: "8px" }}>
              <Button variant="secondary" size="sm">
                Email Owner
              </Button>
              <Button variant="danger" size="sm">
                Cancel
              </Button>
            </div>
          </Card.Footer>
        </Card>
      </div>

      <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>
        Calendar Component
      </h2>
      <p style={{ marginBottom: "20px", color: "#666" }}>
        Calendar component is a reusable calendar that allows users to select
        dates and view availability. Will be used in booking appointments and
        creating booking clots
      </p>
      <div style={{ maxWidth: "400px", marginBottom: "40px" }}>
        <CalendarComponent />
      </div>
    </div>
  );
}

export default Temp;
