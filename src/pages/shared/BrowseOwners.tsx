import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { mockOwners } from "../../data/mockSlots";

/**
 * Browse Owners page (/browse).
 * Lists all registered owners (@mcgill.ca) with a live FRONTEND search filter.
 * Clicking an owner navigates to /browse/:ownerUsername (Owner Appointments page).
 */
function BrowseOwners() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filtered = mockOwners.filter((owner) => {
    const q = query.toLowerCase();
    return (
      owner.name.toLowerCase().includes(q) ||
      owner.email.toLowerCase().includes(q) ||
      (owner.department ?? "").toLowerCase().includes(q) ||
      (owner.title ?? "").toLowerCase().includes(q)
    );
  });

  function handleSelect(email: string) {
    const username = email.split("@")[0];
    navigate(`/browse/${username}`);
  }

  const GRID: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", margin: "0 0 4px" }}>Browse Owners</h1>
          <p style={{ color: "#8e8e8e", fontSize: "15px", margin: 0 }}>
            Find professors and TAs with active booking slots.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </Button>
      </div>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search by name, title, or department..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "12px 16px",
          fontSize: "1rem",
          border: "1.5px solid #d0d0d0",
          borderRadius: "10px",
          outline: "none",
          marginBottom: "28px",
          boxSizing: "border-box",
          fontFamily: "inherit",
          background: "transparent",
        }}
      />

      {/* Owner cards */}
      {filtered.length > 0 ? (
        <div style={GRID}>
          {filtered.map((owner) => (
            <Card key={owner.email} onClick={() => handleSelect(owner.email)} className="cursor-pointer hover:shadow-md transition-shadow">
              <Card.Header>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "16px", margin: "0 0 2px" }}>
                      {owner.name}
                    </p>
                    <p style={{ color: "#8e8e8e", fontSize: "13px", margin: 0 }}>
                      {owner.email}
                    </p>
                  </div>
                  {/* Active slots badge */}
                  <span style={{
                    fontSize: "12px", fontWeight: 600,
                    padding: "3px 10px", borderRadius: "999px",
                    background: "#e8f0f7", color: "#507da7",
                    whiteSpace: "nowrap",
                  }}>
                    {owner.activeSlotCount} slot{owner.activeSlotCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </Card.Header>
              <Card.Content>
                <p style={{ fontSize: "14px", color: "#555", margin: "0 0 12px" }}>
                  {owner.title}{owner.department ? ` · ${owner.department}` : ""}
                </p>
                <Button variant="primary" size="sm" onClick={() => handleSelect(owner.email)}>
                  View Slots -
                </Button>
              </Card.Content>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Card.Content>
            <p style={{ color: "#8e8e8e", textAlign: "center", padding: "24px 0" }}>
              No owners found matching "{query}".
            </p>
          </Card.Content>
        </Card>
      )}
    </div>
  );
}

export default BrowseOwners;
