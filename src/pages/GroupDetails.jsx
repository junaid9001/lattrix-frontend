import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGroupById } from "../api/groups.api";
import { getApisByGroup, deleteApi } from "../api/apis.api";
import CreateApiModal from "../components/CreateApiModal";
import { AuthContext } from "../context/AuthContext";
import { Trash2, ChevronRight, Activity } from "lucide-react";
import toast from "react-hot-toast";
import "../styles/components.css";

function GroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { hasPermission } = useContext(AuthContext);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 10000);
    return () => clearInterval(interval);
  }, [id]);

  async function loadData(isPolling = false) {
    try {
      const [groupRes, apisRes] = await Promise.all([
        getGroupById(id),
        getApisByGroup(id),
      ]);
      setGroup(groupRes.data.data);
      setApis(apisRes.data.data || []);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      if (!isPolling) setLoading(false);
    }
  }

  const handleDeleteApi = async (e, apiId) => {
    e.stopPropagation();
    const loadingToast = toast.loading("Deleting monitor...");
    try {
      await deleteApi(id, apiId);
      setApis(apis.filter((a) => a.id !== apiId));
      toast.dismiss(loadingToast);
      toast.success("Monitor deleted permanently");
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Failed to delete API");
    }
  };

  if (loading && !group)
    return (
      <div style={{ padding: "40px", color: "var(--text-muted)" }}>
        Loading...
      </div>
    );

  return (
    <div className="dashboard-container">
      <div className="action-header" style={{ marginBottom: "40px" }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "5px",
            }}
          >
            <button
              onClick={() => navigate("/dashboard/api-groups")}
              className="back-btn"
              style={{
                fontSize:"10px"
              }}
            >
              ← Back
            </button>
            <h1
              style={{
                fontSize: "28px",
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              {group?.name}
            </h1>
          </div>
          <p
            style={{
              fontSize: "14px",
              color: "var(--text-secondary)",
              marginLeft: "44px",
            }}
          >
            {group?.description}
          </p>
        </div>
        <div style={{ marginLeft: "auto" }}>
          {hasPermission("api:create") && (
            <button
              className="btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              + Add Monitor
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "60px 4fr 1fr 1fr 1fr 50px",
            padding: "0 24px",
            marginBottom: "10px",
            color: "var(--text-muted)",
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          <span>Method</span>
          <span>Endpoint</span>
          <span>Status</span>
          <span>Latency</span>
          <span>Checked</span>
          <span></span>
        </div>

        {apis.map((api) => (
          <div
            key={api.id}
            onClick={() => navigate(`/dashboard/group/${id}/api/${api.id}`)}
            style={{
              display: "grid",
              gridTemplateColumns: "60px 4fr 1fr 1fr 1fr 50px",
              alignItems: "center",
              background: "var(--bg-subtle)",
              border: "1px solid var(--border-glass)",
              borderRadius: "12px",
              padding: "24px", // Increased Padding for height
              cursor: "pointer",
              transition: "transform 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--text-secondary)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-glass)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div>
              <span
                className={`method-badge ${api.method}`}
                style={{ fontSize: "11px", padding: "4px 8px" }}
              >
                {api.method}
              </span>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <span
                style={{
                  fontSize: "16px",
                  color: "var(--text-primary)",
                  fontWeight: "600",
                }}
              >
                {api.name}
              </span>
              <span
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {api.url}
              </span>
            </div>

            <div>
              <span
                className={`status-indicator ${api.last_status === "UP" ? "UP" : "DOWN"}`}
                style={{ fontSize: "12px", padding: "6px 12px" }}
              >
                {api.last_status || "PENDING"}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--text-primary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              <Activity size={16} color="var(--text-muted)" />
              {api.last_response_time_ms
                ? `${api.last_response_time_ms}ms`
                : "--"}
            </div>

            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              {api.last_checked_at
                ? new Date(api.last_checked_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Never"}
            </div>

            <div
              style={{
                textAlign: "right",
                display: "flex",
                gap: "15px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={(e) => handleDeleteApi(e, api.id)}
                className="hover-danger"
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                <Trash2 size={18} />
              </button>
              <ChevronRight size={18} color="var(--text-muted)" />
            </div>
          </div>
        ))}

        {apis.length === 0 && (
          <div
            style={{
              padding: "80px",
              textAlign: "center",
              color: "var(--text-muted)",
              border: "1px dashed var(--border-glass)",
              borderRadius: "12px",
            }}
          >
            No monitors yet. Add one to see the magic.
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateApiModal
          groupId={id}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

export default GroupDetails;
