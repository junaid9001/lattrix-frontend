import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getApiMetrics, getApisByGroup } from "../api/apis.api";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  ArrowLeft,
  Clock,
  Globe,
  Server,
  Shield,
  Wifi,
  AlertTriangle,
  Activity,
  AlertOctagon,
  Terminal,
} from "lucide-react";
import "./ApiMetrics.css";
import "../styles/main.css";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const total =
      payload.find((p) => p.dataKey === "response_time_ms")?.value ||
      payload.reduce((acc, p) => acc + (p.value || 0), 0);

    return (
      <div className="custom-tooltip-container">
        <div className="tooltip-header">
          <div className="tooltip-time">
            {new Date(label).toLocaleTimeString()}
          </div>
          <div className="tooltip-date">
            {new Date(label).toLocaleDateString()}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {payload.map((entry, index) => {
            if (entry.dataKey === "response_time_ms") return null;
            return (
              <div key={index} className="tooltip-item-row">
                <span
                  className="tooltip-item-label"
                  style={{ color: entry.fill }}
                >
                  <span
                    className="tooltip-dot"
                    style={{ background: entry.fill }}
                  ></span>
                  {entry.name}
                </span>
                <span className="tooltip-item-value">{entry.value} ms</span>
              </div>
            );
          })}
        </div>
        <div className="tooltip-footer">
          <span
            style={{
              color: "#aaa",
              fontSize: "12px",
              textTransform: "uppercase",
            }}
          >
            Total Latency
          </span>
          <span
            style={{
              color: "var(--accent-primary)",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            {total} ms
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const ApiMetrics = () => {
  const { groupId, apiId } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  // Store full API details to access last_error_message
  const [apiDetails, setApiDetails] = useState(null);

  useEffect(() => {
    // 1. Fetch API Metadata (Name & Last Error)
    getApisByGroup(groupId)
      .then((res) => {
        const found = res.data.data?.find((a) => a.id === apiId);
        if (found) setApiDetails(found);
      })
      .catch((err) => console.error("Failed to fetch API details", err));

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [apiId, groupId]);

  useEffect(() => {
    if (apiDetails?.name) {
      document.title = `${apiDetails.name} | Telemetry`;
    }
  }, [apiDetails]);

  const loadData = async () => {
    try {
      const res = await getApiMetrics(groupId, apiId);
      const rawData = res.data.data || [];
      // If the metrics response contains updated metadata, update title
      if (res.data.api_name && !apiDetails) {
        setApiDetails((prev) => ({ ...prev, name: res.data.api_name }));
      }
      setHistory(rawData.reverse());
    } catch (err) {
      console.error("Metrics load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const latest = history.length > 0 ? history[history.length - 1] : null;
  const isDown = latest?.status !== "UP";

  // Use the error from API details (persistent) or the latest metric point (transient)
  const errorMessage =
    apiDetails?.last_error_message ||
    latest?.error_message ||
    "Unknown error occurred";

  const handleBack = () => {
    if (groupId && groupId !== "undefined")
      navigate(`/dashboard/api-groups/${groupId}`);
    else navigate("/dashboard/api-groups");
  };

  const getSSLStatus = () => {
    if (!latest) return { text: "Unknown", color: "#666", icon: Shield };
    if (
      latest.ssl_days_remaining !== null &&
      latest.ssl_days_remaining !== undefined
    ) {
      if (latest.ssl_days_remaining < 7)
        return {
          text: `Expiring: ${latest.ssl_days_remaining} Days`,
          color: "#ef4444",
          icon: AlertTriangle,
        };
      if (latest.ssl_days_remaining < 30)
        return {
          text: `${latest.ssl_days_remaining} Days Left`,
          color: "#f59e0b",
          icon: Shield,
        };
      return {
        text: `${latest.ssl_days_remaining} Days Valid`,
        color: "#10b981",
        icon: Shield,
      };
    }
    return {
      text: "Not Secured (HTTP)",
      color: "#71717a",
      icon: AlertTriangle,
    };
  };

  const sslInfo = getSSLStatus();
  const SSLIcon = sslInfo.icon;

  return (
    <div className="metrics-container">
      <div
        className="metrics-header"
        style={{
          zIndex: 100,
          position: "sticky",
          top: 0,
          backgroundColor: "var(--bg-void)",
        }}
      >
        <button onClick={handleBack} className="back-btn-styled">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="header-title-block">
          <h1>{apiDetails?.name || "Loading API..."}</h1>
        </div>

        {latest && (
          <div className="header-status-area">
            <div className="status-block">
              <div className="status-label">Current Status</div>
              <div className={`status-badge ${isDown ? "down" : "up"}`}>
                {latest.status}
              </div>
            </div>
            <div className="status-divider"></div>
            <div className="status-block">
              <div className="status-label">Last Check</div>
              <div className="status-time-value">
                {new Date(latest.checked_at).toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="metrics-content">
        {isDown && (
          <div className="error-banner animate-fade-in">
            <div className="error-icon-box">
              <AlertOctagon size={24} color="#ef4444" />
            </div>
            <div className="error-content">
              <h3>Service Outage Detected</h3>
              <p className="error-msg-mono">
                <span className="prefix">Reason:</span> {errorMessage}
              </p>
            </div>
          </div>
        )}

        <div className="stats-grid">
          <StatCard
            icon={Clock}
            color="#3b82f6"
            label="Total Latency"
            unit="ms"
            value={`${latest?.response_time_ms || 0}`}
            subValue="Last Request"
          />
          <StatCard
            icon={Wifi}
            color={isDown ? "#ef4444" : "#10b981"}
            label="Server Availability"
            unit=""
            value={latest?.status || "PENDING"}
            subValue={isDown ? "Outage Detected" : "Operational"}
          />
          <StatCard
            icon={SSLIcon}
            color={sslInfo.color}
            label="SSL Certificate"
            value={sslInfo.text.split(" ")[0]}
            unit={sslInfo.text.split(" ").slice(1).join(" ")}
            subValue="Security Status"
          />
          <StatCard
            icon={Globe}
            color="#f59e0b"
            label="DNS Lookup"
            unit="ms"
            value={`${latest?.dns_ms || 0}`}
            subValue="Resolution Time"
          />
        </div>

        <div className="charts-column">
          <div className="chart-card machine-card" style={{ height: "320px" }}>
            <div className="chart-header">
              <Activity size={16} color="var(--text-muted)" />
              <h3 className="chart-title">Latency Trend (Last 50 Checks)</h3>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis dataKey="checked_at" hide />
                <YAxis stroke="#52525b" tick={{ fontSize: 11 }} width={35} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="response_time_ms"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorLatency)"
                  animationDuration={500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card machine-card" style={{ height: "380px" }}>
            <div
              className="chart-header"
              style={{ justifyContent: "space-between" }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Server size={16} color="var(--text-muted)" />
                <h3 className="chart-title">Network Decomposition</h3>
              </div>
              <div className="chart-legend-group">
                <LegendItem color="#3b82f6" label="DNS" />
                <LegendItem color="#8b5cf6" label="TCP" />
                <LegendItem color="#10b981" label="SSL" />
                <LegendItem color="#f59e0b" label="TTFB" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={history}
                barGap={2}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="checked_at"
                  tickFormatter={(t) =>
                    new Date(t).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }
                  stroke="#52525b"
                  tick={{ fontSize: 11 }}
                  minTickGap={40}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#52525b"
                  tick={{ fontSize: 11 }}
                  width={35}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />
                <Bar
                  name="DNS Lookup"
                  dataKey="dns_ms"
                  stackId="a"
                  fill="#3b82f6"
                />
                <Bar
                  name="TCP Connection"
                  dataKey="tcp_ms"
                  stackId="a"
                  fill="#8b5cf6"
                />
                <Bar
                  name="SSL Handshake"
                  dataKey="tls_ms"
                  stackId="a"
                  fill="#10b981"
                />
                <Bar
                  name="Server Wait (TTFB)"
                  dataKey="processing_ms"
                  stackId="a"
                  fill="#f59e0b"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="log-section machine-card">
          <div className="chart-header">
            <Terminal size={16} color="var(--text-muted)" />
            <h3 className="chart-title">Recent Telemetry Log</h3>
          </div>
          <div className="log-table-wrapper">
            <table className="log-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Code</th>
                  <th>Latency</th>
                  <th>Message / Error</th>
                </tr>
              </thead>
              <tbody>
                {history
                  .slice(-10)
                  .reverse()
                  .map((entry, idx) => (
                    <tr
                      key={idx}
                      className={entry.status !== "UP" ? "row-error" : ""}
                    >
                      <td className="mono">
                        {new Date(entry.checked_at).toLocaleString()}
                      </td>
                      <td>
                        <span
                          className={`status-pill ${entry.status === "UP" ? "ok" : "fail"}`}
                        >
                          {entry.status}
                        </span>
                      </td>
                      <td className="mono">{entry.status_code || "-"}</td>
                      <td className="mono">{entry.response_time_ms}ms</td>
                      <td className="mono-text">
                        {/* Use entry.error_message if available, else generic */}
                        {entry.status !== "UP"
                          ? entry.error_message || errorMessage
                          : "OK"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, color, label, value, unit, subValue }) => (
  <div className="stat-card-container">
    <div
      className="stat-icon-box"
      style={{ background: `${color}15`, color: color }}
    >
      <Icon size={20} />
    </div>
    <div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {value}
        <span className="stat-unit">{unit}</span>
      </div>
      <div className="stat-subvalue">{subValue}</div>
    </div>
  </div>
);

const LegendItem = ({ color, label }) => (
  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
    <span
      style={{ width: 8, height: 8, borderRadius: "2px", background: color }}
    ></span>
    {label}
  </span>
);

export default ApiMetrics;
