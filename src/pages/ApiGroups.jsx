import { useState, useEffect } from "react";
import { createGroup, getGroups } from "../api/groups.api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import "../styles/components.css";

function ApiGroups() {
  const [groups, setGroups] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    try {
      const res = await getGroups();
      setGroups(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch groups", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createGroup(newGroup);
      setIsCreating(false);
      setNewGroup({ name: "", description: "" });
      loadGroups();
    } catch (err) {
      toast.error("Failed to create group");
    }
  };

  if (loading)
    return (
      <div style={{ padding: "40px", color: "var(--text-muted)" }}>
        Initializing...
      </div>
    );

  return (
    <div>
      <header
        style={{
          marginBottom: "40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "end",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "28px",
              color: "var(--text-primary)",
              marginBottom: "8px",
            }}
          >
            API Groups
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Organize your endpoints into logical sectors.
           
          </p>
        </div>
        <button
          className="primary-btn"
          onClick={() => setIsCreating(!isCreating)}
          style={{
            
          }}
        >
          {isCreating ? "Cancel" : "+ New Group"}
        </button>
      </header>

      {isCreating && (
        <div
          style={{
            marginBottom: "32px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid var(--border-subtle)",
            padding: "24px",
            borderRadius: "var(--radius-md)",
          }}
        >
          <form
            onSubmit={handleCreate}
            style={{ display: "flex", gap: "16px", alignItems: "flex-end" }}
          >
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                }}
              >
                Group Name
              </label>
              <input
                value={newGroup.name}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, name: e.target.value })
                }
                required
                placeholder="e.g. Payment Gateway"
                style={{
                  width: "100%",
                  background: "var(--bg-void)",
                  border: "1px solid var(--border-subtle)",
                  color: "white",
                  padding: "10px",
                  borderRadius: "4px",
                }}
              />
            </div>
            <div style={{ flex: 2 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                }}
              >
                Description
              </label>
              <input
                value={newGroup.description}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, description: e.target.value })
                }
                placeholder="Optional system context"
                style={{
                  width: "100%",
                  background: "var(--bg-void)",
                  border: "1px solid var(--border-subtle)",
                  color: "white",
                  padding: "10px",
                  borderRadius: "4px",
                }}
              />
            </div>
            <button type="submit" className="primary-btn">
              Initialize
            </button>
          </form>
        </div>
      )}

      <div className="bento-grid">
        {groups.length === 0 ? (
          <div
            style={{
              gridColumn: "1 / -1",
              padding: "60px",
              border: "1px dashed var(--border-subtle)",
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            No groups configured. Initialize one above.
          </div>
        ) : (
          groups.map((group) => (
            <Link
              key={group.id}
              to={`/dashboard/api-groups/${group.id}`}
              style={{ textDecoration: "none" }}
            >
              <div className="machine-card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                  }}
                >
                  <span className="card-label">SERVICE GROUP</span>
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "var(--accent-primary)",
                      boxShadow: "0 0 8px var(--accent-primary)",
                    }}
                  ></div>
                </div>
                <h3
                  style={{
                    fontSize: "18px",
                    color: "var(--text-primary)",
                    marginBottom: "8px",
                  }}
                >
                  {group.name}
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                    lineHeight: "1.5",
                  }}
                >
                  {group.description || "No system context provided."}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default ApiGroups;
