// src/components/CreateApiModal.jsx
import { useState, useEffect } from "react";
import { createApi } from "../api/apis.api";
import { getGroups } from "../api/groups.api";
import { X, Globe, Shield, Activity, Bell, Code, Settings, Folder } from "lucide-react";
import { toast } from "react-hot-toast";
import "../styles/components.css";

export default function CreateApiModal({ groupId: propGroupId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // State for group selection if not provided via props
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(propGroupId || "");

  // Expanded Form State
  const [form, setForm] = useState({
    // General
    name: "",
    description: "",
    url: "https://",
    method: "GET",

    // Auth
    auth_type: "NONE",
    auth_in: "HEADER",
    auth_key: "",
    auth_value: "",

    // Request Details
    headers: "{}", // JSON string for flexibility
    body_type: "NONE",
    body: "{}", // JSON string

    // Assertions
    expected_status_codes: "200,201,202,204",
    expected_response_time_ms: "",
    expected_body_contains: "",

    // Alerting & Config
    interval_seconds: 60,
    timeout_ms: 5000,
    notify_after_failures: 1,
  });

  // Fetch groups if no groupId is passed (Global Add Mode)
  useEffect(() => {
    if (!propGroupId) {
      async function loadGroups() {
        try {
          const res = await getGroups();
          // Handle different response structures based on your API
          const list = res.data.data || res.data || [];
          setGroups(list);
          
          // Auto-select "main" or the first available group
          if (list.length > 0) {
            const main = list.find(g => g.name.toLowerCase() === "main");
            setSelectedGroupId(main ? main.id : list[0].id);
          }
        } catch (err) {
          console.error("Failed to load groups", err);
          toast.error("Could not load workspace groups.");
        }
      }
      loadGroups();
    }
  }, [propGroupId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!form.name || !form.url) throw new Error("Name and URL are required");
      if (!selectedGroupId) throw new Error("Please select a Group for this monitor.");

      // safe JSON parsing
      let parsedHeaders = {};
      let parsedBody = {};
      try {
        parsedHeaders = form.headers ? JSON.parse(form.headers) : {};
        parsedBody = form.body ? JSON.parse(form.body) : {};
      } catch (e) {
        throw new Error("Invalid JSON in Headers or Body fields");
      }

      // safe status code parsing
      const statusCodes = form.expected_status_codes
        .split(",")
        .map((s) => parseInt(s.trim()))
        .filter((n) => !isNaN(n));

      const payload = {
        name: form.name,
        description: form.description,
        url: form.url,
        method: form.method,

        // Config
        interval_seconds: parseInt(form.interval_seconds),
        timeout_ms: parseInt(form.timeout_ms),

        // Auth
        auth_type: form.auth_type,
        ...(form.auth_type !== "NONE" && {
          auth_in: form.auth_in,
          auth_key: form.auth_key || "Authorization",
          auth_value: form.auth_value,
        }),

        // Advanced Request
        headers: parsedHeaders,
        body_type: form.body_type,
        ...(form.body_type === "JSON" && { body: parsedBody }),

        // Assertions
        expected_status_codes: statusCodes,
        expected_response_time_ms: form.expected_response_time_ms
          ? parseInt(form.expected_response_time_ms)
          : null,
        expected_body_contains: form.expected_body_contains || null,

        // Alerting
        notify_after_failures: parseInt(form.notify_after_failures),
      };

      await createApi(selectedGroupId, payload);
      toast.success("Monitor deployed successfully!");
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Render Helpers ---
  const renderTabButton = (id, label, Icon) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 12px",
        background: activeTab === id ? "rgba(255,255,255,0.05)" : "transparent",
        border: "none",
        borderRight:
          activeTab === id
            ? "2px solid var(--accent-primary)"
            : "2px solid transparent",
        color: activeTab === id ? "var(--text-primary)" : "var(--text-muted)",
        cursor: "pointer",
        textAlign: "left",
        fontSize: "13px",
        fontWeight: "500",
        transition: "all 0.2s",
      }}
    >
      <Icon size={16} /> {label}
    </button>
  );

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "var(--bg-subtle)",
          border: "1px solid var(--border-glass)",
          borderRadius: "var(--radius-md)",
          width: "750px",
          height: "550px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
          display: "flex",
          overflow: "hidden",
        }}
      >
        {/* LEFT: Sidebar Tabs */}
        <div
          style={{
            width: "200px",
            background: "rgba(0,0,0,0.2)",
            borderRight: "1px solid var(--border-glass)",
            display: "flex",
            flexDirection: "column",
            paddingTop: "20px",
          }}
        >
          <div
            style={{
              padding: "0 16px 20px",
              fontSize: "12px",
              fontWeight: "700",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Configuration
          </div>
          {renderTabButton("general", "General", Globe)}
          {renderTabButton("auth", "Authentication", Shield)}
          {renderTabButton("request", "Request Body", Code)}
          {renderTabButton("assertions", "Assertions", Activity)}
          {renderTabButton("alerting", "Alerting", Bell)}
        </div>

        {/* RIGHT: Content Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid var(--border-glass)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "600",
                margin: 0,
                color: "var(--text-primary)",
              }}
            >
              New Monitor
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Form Area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
            <form
              id="create-api-form"
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* --- TAB: GENERAL --- */}
              {activeTab === "general" && (
                <>
                  {/* GROUP SELECTION (Only if global mode) */}
                  {!propGroupId && (
                    <div style={{ marginBottom: "10px" }}>
                        <label className="card-label" style={{ color: "var(--accent-primary)" }}>Assign to Group</label>
                        <div style={{ position: "relative" }}>
                            <Folder size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                            <select 
                                value={selectedGroupId}
                                onChange={(e) => setSelectedGroupId(e.target.value)}
                                style={{ paddingLeft: "32px", width: "100%", borderColor: "var(--accent-primary)" }}
                            >
                                {groups.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "16px" }}>
                    <div style={{ flex: "0 0 100px" }}>
                      <label className="card-label">Method</label>
                      <select
                        name="method"
                        value={form.method}
                        onChange={handleChange}
                        style={{ fontWeight: "700" }}
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DEL</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="card-label">Monitor Name</label>
                      <input
                        name="name"
                        placeholder="e.g. Payment Gateway Check"
                        value={form.name}
                        onChange={handleChange}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label className="card-label">Target Endpoint (URL)</label>
                    <input
                      name="url"
                      placeholder="https://api.stripe.com/v1/charges"
                      value={form.url}
                      onChange={handleChange}
                      required
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "12px",
                      }}
                    />
                  </div>

                  <div>
                    <label className="card-label">Description (Optional)</label>
                    <input
                      name="description"
                      placeholder="Checks if the main payment API is responding..."
                      value={form.description}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              {/* --- TAB: AUTH --- */}
              {activeTab === "auth" && (
                <>
                  <div>
                    <label className="card-label">Auth Type</label>
                    <select
                      name="auth_type"
                      value={form.auth_type}
                      onChange={handleChange}
                    >
                      <option value="NONE">No Authentication</option>
                      <option value="BEARER">Bearer Token</option>
                      <option value="API_KEY">API Key</option>
                    </select>
                  </div>

                  {form.auth_type !== "NONE" && (
                    <div
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        padding: "16px",
                        borderRadius: "8px",
                        border: "1px solid var(--border-glass)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                      }}
                    >
                      {/* Auth In (Header vs Query) */}
                      <div>
                        <label className="card-label">Send Credential In</label>
                        <div style={{ display: "flex", gap: "12px" }}>
                          {["HEADER", "QUERY"].map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() =>
                                setForm((p) => ({ ...p, auth_in: type }))
                              }
                              style={{
                                flex: 1,
                                padding: "8px",
                                borderRadius: "4px",
                                background:
                                  form.auth_in === type
                                    ? "var(--text-primary)"
                                    : "transparent",
                                color:
                                  form.auth_in === type
                                    ? "black"
                                    : "var(--text-muted)",
                                border: "1px solid var(--border-glass)",
                                cursor: "pointer",
                                fontSize: "11px",
                                fontWeight: "700",
                              }}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "12px" }}>
                        <div style={{ flex: 1 }}>
                          <label className="card-label">Key Name</label>
                          <input
                            name="auth_key"
                            placeholder={
                              form.auth_type === "BEARER"
                                ? "Authorization"
                                : "x-api-key"
                            }
                            value={form.auth_key}
                            onChange={handleChange}
                          />
                        </div>
                        <div style={{ flex: 2 }}>
                          <label className="card-label">Value / Token</label>
                          <input
                            name="auth_value"
                            placeholder="sk_test_..."
                            value={form.auth_value}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* --- TAB: REQUEST --- */}
              {activeTab === "request" && (
                <>
                  <div>
                    <label className="card-label">Custom Headers (JSON)</label>
                    <textarea
                      name="headers"
                      value={form.headers}
                      onChange={handleChange}
                      placeholder='{ "Content-Type": "application/json" }'
                      style={{
                        width: "100%",
                        height: "80px",
                        fontFamily: "var(--font-mono)",
                        fontSize: "12px",
                        background: "var(--bg-deep)",
                        border: "1px solid var(--border-glass)",
                        color: "var(--text-primary)",
                        padding: "12px",
                        borderRadius: "6px",
                      }}
                    />
                  </div>

                  <div>
                    <label className="card-label">Body Type</label>
                    <select
                      name="body_type"
                      value={form.body_type}
                      onChange={handleChange}
                    >
                      <option value="NONE">None</option>
                      <option value="JSON">JSON (application/json)</option>
                    </select>
                  </div>

                  {form.body_type === "JSON" && (
                    <div>
                      <label className="card-label">Request Body (JSON)</label>
                      <textarea
                        name="body"
                        value={form.body}
                        onChange={handleChange}
                        placeholder='{ "amount": 500 }'
                        style={{
                          width: "100%",
                          height: "120px",
                          fontFamily: "var(--font-mono)",
                          fontSize: "12px",
                          background: "var(--bg-deep)",
                          border: "1px solid var(--border-glass)",
                          color: "var(--text-primary)",
                          padding: "12px",
                          borderRadius: "6px",
                        }}
                      />
                    </div>
                  )}
                </>
              )}

              {/* --- TAB: ASSERTIONS --- */}
              {activeTab === "assertions" && (
                <>
                  <div
                    style={{
                      background: "rgba(39, 39, 42, 0.3)",
                      padding: "16px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-glass)",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 12px 0",
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Define what constitutes a "Success". If any of these fail,
                      the API is marked DOWN.
                    </p>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                      }}
                    >
                      <div>
                        <label className="card-label">
                          Expected Status Codes (Comma separated)
                        </label>
                        <input
                          name="expected_status_codes"
                          value={form.expected_status_codes}
                          onChange={handleChange}
                          placeholder="200, 201, 204"
                          style={{ fontFamily: "var(--font-mono)" }}
                        />
                      </div>

                      <div style={{ display: "flex", gap: "16px" }}>
                        <div style={{ flex: 1 }}>
                          <label className="card-label">
                            Max Response Time (ms)
                          </label>
                          <input
                            type="number"
                            name="expected_response_time_ms"
                            placeholder="2000"
                            value={form.expected_response_time_ms}
                            onChange={handleChange}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label className="card-label">
                            Body Must Contain (String)
                          </label>
                          <input
                            name="expected_body_contains"
                            placeholder="success: true"
                            value={form.expected_body_contains}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* --- TAB: ALERTING --- */}
              {activeTab === "alerting" && (
                <>
                  <div style={{ display: "flex", gap: "16px" }}>
                    <div style={{ flex: 1 }}>
                      <label className="card-label">
                        Check Interval (Seconds)
                      </label>
                      <input
                        type="number"
                        name="interval_seconds"
                        min="10"
                        value={form.interval_seconds}
                        onChange={handleChange}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="card-label">Request Timeout (ms)</label>
                      <input
                        type="number"
                        name="timeout_ms"
                        min="100"
                        step="100"
                        value={form.timeout_ms}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="card-label" style={{ color: "#ef4444" }}>
                      Alerting Threshold
                    </label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        background: "rgba(239, 68, 68, 0.05)",
                        border: "1px solid rgba(239, 68, 68, 0.1)",
                        padding: "16px",
                        borderRadius: "6px",
                      }}
                    >
                      <Bell size={20} color="#ef4444" />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "var(--text-primary)",
                          }}
                        >
                          Notify me after
                        </div>
                        <input
                          type="number"
                          name="notify_after_failures"
                          value={form.notify_after_failures}
                          onChange={handleChange}
                          min="1"
                          style={{
                            width: "60px",
                            margin: "0 8px",
                            display: "inline-block",
                            padding: "4px",
                          }}
                        />
                        <span
                          style={{
                            fontSize: "13px",
                            color: "var(--text-primary)",
                          }}
                        >
                          consecutive failures.
                        </span>
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        marginTop: "8px",
                      }}
                    >
                      We will send an email and create a workspace alert when
                      this threshold is breached.
                    </p>
                  </div>
                </>
              )}

            </form>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              padding: "20px 24px",
              borderTop: "1px solid var(--border-glass)",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              background: "var(--bg-subtle)",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "transparent",
                color: "var(--text-secondary)",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-api-form"
              disabled={loading}
              className="primary-btn"
            >
              {loading ? "Initializing..." : "Deploy Monitor"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
