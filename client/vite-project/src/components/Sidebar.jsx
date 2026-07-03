import { useEffect, useState } from "react";
import { gethistory } from "../firebase/historyservice";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ onSelect, selectedItem, refreshTrigger }) {
  const { currentUser, logout } = useAuth();
  const [history, sethistory] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    loadHistory();
  }, [currentUser, refreshTrigger]);

  async function loadHistory() {
    try {
      const token = await currentUser.getIdToken();
      const docs = await gethistory(token);
      sethistory(docs);
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Failed to log out:", err);
    }
  };

  return (
    <aside className="sidebar">
      {/* Top portion of the sidebar */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", overflow: "hidden", flex: 1 }}>
        <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "13px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#f1f5f9", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            🚀 ContentForge
          </h2>
          <div className="sidebar-tagline" style={{ padding: "10px" }}>AI Content Repurposing Tool</div>
        </div>

        <h3 style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em", margin: "10px 0 0", textAlign: "left" }}>
          History
        </h3>

        {/* Scrollable history list */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", paddingRight: "4px" }}>
          {history.length === 0 ? (
            <div style={{ fontSize: "13px", color: "#64748b", padding: "12px 0", textAlign: "left" }}>
              No generations yet
            </div>
          ) : (
            history.map((item) => {
              const isActive = selectedItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelect && onSelect(item)}
                  style={{
                    padding: "12px",
                    cursor: "pointer",
                    borderRadius: "8px",
                    background: isActive
                      ? "linear-gradient(135deg, rgba(79, 70, 229, 0.25), rgba(124, 58, 237, 0.25))"
                      : "rgba(30, 41, 59, 0.4)",
                    border: isActive
                      ? "1px solid #6366f1"
                      : "1px solid rgba(255, 255, 255, 0.06)",
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(51, 65, 85, 0.5)";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(30, 41, 59, 0.4)";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
                    }
                  }}
                >
                  <strong style={{ color: isActive ? "#ffffff" : "#cbd5e1", fontSize: "14px", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.title}
                  </strong>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", color: isActive ? "#a5b4fc" : "#64748b", fontWeight: "500", textTransform: "capitalize" }}>
                      {item.sourceType}
                    </span>
                    {item.createdAt && (
                      <span style={{ fontSize: "10px", color: "#475569" }}>
                        {new Date(item.createdAt.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom portion: Profile Section */}
      {currentUser && (
        <div className="sidebar-profile">
          <div className="profile-details">
            <span className="profile-label">Logged in as</span>
            <span className="profile-email" title={currentUser.email}>
              {currentUser.email}
            </span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      )}
    </aside>
  );
}