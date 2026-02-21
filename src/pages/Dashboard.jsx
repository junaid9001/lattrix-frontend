import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getGroups } from "../api/groups.api";
import { getApisByGroup } from "../api/apis.api";
import { AuthContext } from "../context/AuthContext";
import {
  Activity,
  Server,
  Shield,
  AlertTriangle,
  CheckCircle,
  Plus,
  Zap,
} from "lucide-react";
import "../styles/admin.css";
import "../styles/components.css";

const KpiCard = ({ icon: Icon, label, value, sub, statusColor }) => (
  <div className="glass-panel kpi-card-hover" style={{ minHeight: "140px" }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "16px",
      }}
    >
      <span className="kpi-label">{label}</span>
      {Icon && <Icon size={18} color={statusColor || "var(--text-muted)"} />}
    </div>
    <div
      className="kpi-value"
      style={{ color: statusColor || "var(--text-main)" }}
    >
      {value}
    </div>
    <div className="kpi-sub">{sub}</div>
  </div>
);

const MonitorRow = ({ api, groupName, onClick }) => (
  <div
    className="feed-item monitor-row"
    onClick={onClick}
    style={{ cursor: "pointer", transition: "background 0.2s" }}
  >
    <div
      className={`status-icon ${api.is_active ? (api.last_status === "UP" ? "success" : "failed") : "info"}`}
    ></div>
    <div className="feed-content">
      <div className="feed-top">
        <span className="feed-type" style={{ color: "var(--text-main)" }}>
          {api.name}
        </span>
        <span className="feed-date mono" style={{ fontSize: "10px" }}>
          {api.last_checked_at
            ? new Date(api.last_checked_at).toLocaleTimeString()
            : "PENDING"}
        </span>
      </div>
      <div
        className="feed-bottom"
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <span className="feed-id mono">
          {api.method} • {groupName}
        </span>
        {api.last_response_time_ms > 0 && (
          <span className="mono" style={{ color: "var(--accent-blue)" }}>
            {api.last_response_time_ms}ms
          </span>
        )}
      </div>
    </div>
  </div>
);

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalApis: 0,
    apisUp: 0,
    apisDown: 0,
    avgLatency: 0,
  });
  const [recentMonitors, setRecentMonitors] = useState([]);

  const { user, checkAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      checkAuth();
      navigate("/dashboard", { replace: true });
    }
  }, [searchParams, navigate, checkAuth]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // 1. Fetch Groups
        const groupRes = await getGroups();
        let groups = [];

        // Handle various response structures
        if (Array.isArray(groupRes.data)) {
          groups = groupRes.data;
        } else if (groupRes.data && Array.isArray(groupRes.data.data)) {
          groups = groupRes.data.data;
        } else if (groupRes.data && Array.isArray(groupRes.data.groups)) {
          groups = groupRes.data.groups;
        }

        // 2. Parallel Fetch APIs for all groups (to get aggregate stats)
        const apiPromises = groups.map((g) =>
          getApisByGroup(g.id).catch(() => ({ data: { data: [] } })),
        );
        const results = await Promise.all(apiPromises);

        // 3. Aggregate Data
        let allApis = [];
        let upCount = 0;
        let downCount = 0;
        let totalLatency = 0;
        let latencyCount = 0;

        results.forEach((res, index) => {
          const groupApis = res.data.data || [];
          // Attach group name to API object for display
          const enrichedApis = groupApis.map((api) => ({
            ...api,
            groupName: groups[index].name,
            api_group_id: groups[index].id,
          }));
          allApis = [...allApis, ...enrichedApis];
        });

        allApis.forEach((api) => {
          if (api.is_active) {
            if (api.last_status === "UP") upCount++;
            else if (api.last_status === "DOWN") downCount++;

            if (api.last_response_time_ms > 0) {
              totalLatency += api.last_response_time_ms;
              latencyCount++;
            }
          }
        });

        setStats({
          totalGroups: groups.length,
          totalApis: allApis.length,
          apisUp: upCount,
          apisDown: downCount,
          avgLatency:
            latencyCount > 0 ? Math.round(totalLatency / latencyCount) : 0,
        });

        // Sort by last checked (or just take the first 8 for now)
        setRecentMonitors(allApis.slice(0, 8));
      } catch (err) {
        console.error("Dashboard Load Failed", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  if (loading)
    return (
      <div
        className="admin-root"
        style={{
          display: "flex",
          justifyContent: "center",
          paddingTop: "100px",
        }}
      >
        <div className="spinner-sm"></div>
      </div>
    );

  const systemStatus = stats.apisDown > 0 ? "Degraded" : "Operational";
  const systemColor = stats.apisDown > 0 ? "#ef4444" : "#10b981";

  return (
    <div className="admin-root" style={{ padding: "0", maxWidth: "100%" }}>
      <header className="admin-header" style={{ marginBottom: "32px" }}>
        <div className="header-content">
          <div
            className="sys-indicator"
            style={{
              background: systemColor,
              boxShadow: `0 0 15px ${systemColor}`,
            }}
          ></div>
          <div>
            <h1>Command Center</h1>
            <p className="mono">
              WELCOME BACK, {user?.username?.toUpperCase()}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <div
            className="badge badge-pro"
            style={{ display: "flex", alignItems: "center", fontSize: "11px" }}
          >
            {user?.plan || "FREE PLAN"}
          </div>
          <button
            className="btn-refresh"
            onClick={() => navigate("/dashboard/api-groups")}
          >
            <Plus size={14} style={{ marginRight: "6px" }} /> NEW GROUP
          </button>
        </div>
      </header>

      <div className="kpi-grid">
        <KpiCard
          label="Total Monitors"
          value={stats.totalApis}
          sub={`${stats.totalGroups} Active Groups`}
          icon={Activity}
          statusColor="var(--accent-blue)"
        />
        <KpiCard
          label="System Health"
          value={systemStatus}
          sub={`${stats.apisUp} Up / ${stats.apisDown} Down`}
          icon={stats.apisDown > 0 ? AlertTriangle : CheckCircle}
          statusColor={systemColor}
        />
        <KpiCard
          label="Global Latency"
          value={`${stats.avgLatency}ms`}
          sub="Avg Response Time"
          icon={Zap}
          statusColor="#f59e0b"
        />
        <KpiCard
          label="Security Status"
          value="Active"
          sub="SSL Monitoring On"
          icon={Shield}
          statusColor="var(--accent-purple)"
        />
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}
      >
        <div className="glass-panel">
          <div className="panel-header">
            <h3>Active Endpoints</h3>
            <span
              className="mono"
              style={{ fontSize: "10px", color: "var(--text-muted)" }}
            >
              LIVE STATUS
            </span>
          </div>

          <div className="feed-list">
            {recentMonitors.length === 0 ? (
              <div className="empty-state">
                <Server
                  size={24}
                  style={{ marginBottom: "12px", opacity: 0.5 }}
                />
                <p>No endpoints configured.</p>
                <button
                  className="btn-action btn-unban"
                  style={{ marginTop: "12px" }}
                  onClick={() => navigate("/dashboard/api-groups")}
                >
                  + Add Your First API
                </button>
              </div>
            ) : (
              recentMonitors.map((api) => (
                <MonitorRow
                  key={api.id}
                  api={api}
                  groupName={api.groupName}
                  onClick={() =>
                    navigate(
                      `/dashboard/api-groups/${api.api_group_id}/metrics/${api.id}`,
                    )
                  }
                />
              ))
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="glass-panel">
            <div className="panel-header">
              <h3>Quick Actions</h3>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <button
                className="tab-btn active"
                style={{ textAlign: "left", paddingLeft: "0" }}
                onClick={() => navigate("/dashboard/api-groups")}
              >
                → Configure API Groups
              </button>
              <button
                className="tab-btn"
                style={{ textAlign: "left", paddingLeft: "0" }}
                onClick={() => navigate("/dashboard/notifications")}
              >
                → Manage Alert Rules
              </button>
              <button
                className="tab-btn"
                style={{ textAlign: "left", paddingLeft: "0" }}
                onClick={() => navigate("/dashboard/pricing")}
              >
                → View Billing & Usage
              </button>
            </div>
          </div>

          {user?.plan !== "AGENCY" && user?.plan !== "PRO" && (
            <div
              className="glass-panel"
              style={{
                background:
                  "linear-gradient(145deg, rgba(168,85,247,0.1) 0%, rgba(0,0,0,0) 100%)",
                border: "1px solid var(--accent-purple)",
              }}
            >
              <h3
                style={{
                  color: "var(--accent-purple)",
                  fontSize: "14px",
                  marginBottom: "8px",
                }}
              >
                 Upgrade to PRO
              </h3>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  lineHeight: "1.5",
                  marginBottom: "16px",
                }}
              >
                Get 1-minute checks, multi-region monitoring, and advanced SSL
                alerts.
              </p>
              <button
                className="btn-action"
                style={{
                  width: "100%",
                  background: "var(--accent-purple)",
                  color: "white",
                  border: "none",
                }}
                onClick={() => navigate("/pricing")}
              >
                VIEW PLANS
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
