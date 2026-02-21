import { useState, useEffect, useContext } from "react";
import {
  getMyNotifications,
  acceptInvitation,
  getWorkspaceNotifications,
  deleteWorkspaceNotification,
} from "../api/notification.js";
import { AuthContext } from "../context/AuthContext";
import {
  Bell,
  Check,
  Trash2,
  ShieldAlert,
  Mail,
  Activity,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import "../styles/rbac.css";
import "../styles/components.css";

export default function Notifications() {
  const { isSuperAdmin } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("inbox");
  const [personalNotifs, setPersonalNotifs] = useState([]);
  const [wsNotifs, setWsNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "inbox") {
        const res = await getMyNotifications();
        setPersonalNotifs(res.data.data || []);
      } else {
        const res = await getWorkspaceNotifications();
        setWsNotifs(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleAccept = async (token) => {
    try {
      await acceptInvitation(token);
      // Remove locally to feel instant
      setPersonalNotifs((prev) => prev.filter((n) => n.data?.token !== token));
      toast.success("Invitation Accepted! Switch workspaces to see it.");
    } catch (err) {
      toast.error("Failed to accept: " + err.response?.data?.message);
    }
  };

  const handleDeleteLog = async (id) => {
    try {
      await deleteWorkspaceNotification(id);
      setWsNotifs((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      toast.error("Failed to delete log");
    }
  };

  return (
    <div className="rbac-page" style={{ maxWidth: "900px" }}>
      <header className="rbac-header">
        <h1 className="rbac-title">Notification Center</h1>
        <p className="rbac-subtitle">
          Manage invitations and review system telemetry alerts.
        </p>
      </header>

      <div className="rbac-tabs">
        <button
          className={`rbac-tab ${activeTab === "inbox" ? "active" : ""}`}
          onClick={() => setActiveTab("inbox")}
        >
          My Inbox
          {personalNotifs.length > 0 && (
            <span style={{ marginLeft: "8px", opacity: 0.6 }}>
              ({personalNotifs.length})
            </span>
          )}
        </button>
        <button
          className={`rbac-tab ${activeTab === "workspace" ? "active" : ""}`}
          onClick={() => setActiveTab("workspace")}
        >
          Workspace Activity
        </button>
      </div>

      <div className="rbac-content">
        {loading ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            Loading updates...
          </div>
        ) : (
          <>
            {activeTab === "inbox" && (
              <div
                className="bento-grid"
                style={{ gridTemplateColumns: "1fr" }}
              >
                {personalNotifs.length === 0 ? (
                  <div
                    className="machine-card"
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "var(--text-muted)",
                    }}
                  >
                    <Mail
                      size={32}
                      style={{ marginBottom: "16px", opacity: 0.5 }}
                    />
                    <div>No pending invitations.</div>
                  </div>
                ) : (
                  personalNotifs.map((notif) => (
                    <div
                      key={notif.id}
                      className="machine-card"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "20px",
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          background: "rgba(255,255,255,0.05)",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--accent-primary)",
                          border: "1px solid var(--border-glass)",
                        }}
                      >
                        <Mail size={20} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <h4
                          style={{
                            margin: "0 0 4px 0",
                            fontSize: "15px",
                            color: "var(--text-primary)",
                          }}
                        >
                          {notif.title}
                        </h4>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "13px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {notif.message}
                        </p>
                        <span
                          style={{
                            fontSize: "11px",
                            color: "var(--text-muted)",
                            marginTop: "6px",
                            display: "block",
                          }}
                        >
                          Received:{" "}
                          {new Date(notif.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {notif.type === "invitation" && notif.data?.token && (
                        <button
                          className="primary-btn"
                          onClick={() => handleAccept(notif.data.token)}
                          style={{
                            padding: "8px 16px",
                            background: "var(--text-primary)",
                            color: "black",
                          }}
                        >
                          <Check size={14} /> Accept
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "workspace" && (
              <div className="user-role-table">
                {wsNotifs.length === 0 ? (
                  <div
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "var(--text-muted)",
                    }}
                  >
                    <Activity
                      size={32}
                      style={{ marginBottom: "16px", opacity: 0.5 }}
                    />
                    <div>No system activity recorded.</div>
                  </div>
                ) : (
                  wsNotifs.map((log) => (
                    <div
                      key={log.id}
                      className="user-role-row"
                      style={{
                        gridTemplateColumns: "40px 1fr 150px 50px",
                        gap: "16px",
                      }}
                    >
                      <div
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        {log.type === "api_alert" ? (
                          <ShieldAlert size={16} color="#ef4444" />
                        ) : (
                          <Activity size={16} color="var(--text-muted)" />
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            color: "var(--text-primary)",
                            fontWeight: "500",
                          }}
                        >
                          {log.title}
                        </span>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {log.message}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "11px",
                          color: "var(--text-muted)",
                        }}
                      >
                        <Clock size={12} />
                        {new Date(log.time).toLocaleString()}
                      </div>

                      <div style={{ textAlign: "right" }}>
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "var(--text-muted)",
                              cursor: "pointer",
                              padding: "8px",
                            }}
                            title="Clear Log"
                          >
                            <Trash2 size={14} className="hover-danger" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
