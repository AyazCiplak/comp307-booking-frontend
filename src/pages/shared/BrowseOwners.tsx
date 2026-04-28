// Programmed by Ayaz Ciplak 
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import { apiGetAllOwners, type OwnerInfo } from "../../api/account";

/**
 * Browse Owners page (/browse).
 * Lists ALL registered @mcgill.ca owners with a live frontend search filter.
 * Clicking an owner navigates to /browse/:ownerUsername (Owner Appointments page).
 *
 * Note: all owners are shown — not just those with available slots — so that
 * students can also send personal meeting requests to owners with no open hours.
 */
function BrowseOwners() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [owners, setOwners] = useState<OwnerInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // Fetch all owners once on mount.
  useEffect(() => {
    if (!user?.token) return;

    apiGetAllOwners(user.token)
      .then(setOwners)
      .catch((err: unknown) => {
        setFetchError(
          err instanceof Error ? err.message : "Failed to load owners.",
        );
      })
      .finally(() => setIsLoading(false));
  }, [user?.token]);

  // Client-side live search filter - also hide the currently logged-in user from their
  // own list (an owner should not be able to book slots with themselves).
  const filtered = owners.filter((owner) => {
    if (owner.email === user?.email) return false;   // <- self-exclusion (don't display owner themselves)
    const q   = query.toLowerCase();
    const name = `${owner.firstName} ${owner.lastName}`.toLowerCase();
    return (
      name.includes(q) ||
      owner.email.toLowerCase().includes(q) ||
      (owner.department ?? "").toLowerCase().includes(q) ||
      (owner.title ?? "").toLowerCase().includes(q)
    );
  });

  // Pass the full OwnerInfo as navigation state so OwnerAppointments doesn't
  // need a separate API call just to display the owner's name / title / dept.
  function handleSelect(owner: OwnerInfo) {
    const username = owner.email.split("@")[0];
    navigate(`/browse/${username}`, { state: owner });
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
            Find professors and TAs to book an appointment with.
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

      {/* Loading state */}
      {isLoading && (
        <Card>
          <Card.Content>
            <p style={{ color: "#8e8e8e", textAlign: "center", padding: "24px 0" }}>
              Loading owners...
            </p>
          </Card.Content>
        </Card>
      )}

      {/* Error state */}
      {!isLoading && fetchError && (
        <Card>
          <Card.Content>
            <p style={{ color: "#c0392b", textAlign: "center", padding: "24px 0" }}>
              {fetchError}
            </p>
          </Card.Content>
        </Card>
      )}

      {/* Owner cards */}
      {!isLoading && !fetchError && (
        filtered.length > 0 ? (
          <div style={GRID}>
            {filtered.map((owner) => {
              const fullName = `${owner.firstName} ${owner.lastName}`;
              return (
                <Card
                  key={owner.email}
                  onClick={() => handleSelect(owner)}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <Card.Header>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: "16px", margin: "0 0 2px" }}>
                          {fullName}
                        </p>
                        <p style={{ color: "#8e8e8e", fontSize: "13px", margin: 0 }}>
                          {owner.email}
                        </p>
                      </div>
                      {/* Title badge */}
                      {owner.title && (
                        <span style={{
                          fontSize: "12px", fontWeight: 600,
                          padding: "3px 10px", borderRadius: "999px",
                          background: "#e8f0f7", color: "#507da7",
                          whiteSpace: "nowrap",
                        }}>
                          {owner.title}
                        </span>
                      )}
                    </div>
                  </Card.Header>
                  <Card.Content>
                    <p style={{ fontSize: "14px", color: "#555", margin: "0 0 12px" }}>
                      {owner.department || "No department listed"}
                    </p>
                    <Button variant="primary" size="sm" onClick={() => handleSelect(owner)}>
                      View Slots →
                    </Button>
                  </Card.Content>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <Card.Content>
              <p style={{ color: "#8e8e8e", textAlign: "center", padding: "24px 0" }}>
                {query
                  ? `No owners found matching "${query}".`
                  : "No owners are registered yet."}
              </p>
            </Card.Content>
          </Card>
        )
      )}
    </div>
  );
}

export default BrowseOwners;
