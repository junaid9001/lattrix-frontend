import { useState } from "react";
import { createApi } from "../api/apis.api";
import { X } from "lucide-react";

export default function CreateApiModal({ groupId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form State
  const [form, setForm] = useState({
    name: "",
    url: "https://",
    method: "GET",
    interval_seconds: 60,
    auth_type: "NONE",
    auth_key: "",
    auth_value: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Basic validation
      if (!form.name || !form.url) throw new Error("Name and URL are required");

      // Construct payload
      const payload = {
        name: form.name,
        url: form.url,
        method: form.method,
        interval_seconds: parseInt(form.interval_seconds),
        auth_type: form.auth_type,
        // Only include auth fields if type is not NONE
        ...(form.auth_type !== "NONE" && {
            auth_key: form.auth_key || "Authorization",
            auth_value: form.auth_value
        })
      };

      await createApi(groupId, payload);
      onSuccess(); // Close modal and refresh list
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to create API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: '500px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Monitor New API</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Row 1: Method & Name */}
          <div className="form-row">
            <div className="form-group" style={{ flex: '0 0 100px' }}>
              <label>Method</label>
              <select 
                name="method" 
                value={form.method} 
                onChange={handleChange}
                style={{ fontWeight: 'bold' }}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>API Name</label>
              <input 
                name="name" 
                placeholder="e.g. User Service Health" 
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 2: URL */}
          <div className="form-group">
            <label>Endpoint URL</label>
            <input 
              name="url" 
              placeholder="https://api.example.com/health" 
              value={form.url}
              onChange={handleChange}
              required
            />
          </div>

          {/* Row 3: Settings */}
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Check Interval (seconds)</label>
              <input 
                type="number" 
                name="interval_seconds" 
                min="10"
                value={form.interval_seconds}
                onChange={handleChange}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Auth Type</label>
              <select name="auth_type" value={form.auth_type} onChange={handleChange}>
                <option value="NONE">None</option>
                <option value="BEARER">Bearer Token</option>
                <option value="API_KEY">API Key</option>
              </select>
            </div>
          </div>

          {/* Conditional Auth Fields */}
          {form.auth_type !== "NONE" && (
            <div className="form-row" style={{ background: '#f9fafb', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
              {form.auth_type === "API_KEY" && (
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label>Key Name</label>
                    <input 
                        name="auth_key" 
                        placeholder="x-api-key"
                        value={form.auth_key}
                        onChange={handleChange}
                    />
                </div>
              )}
              <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
                <label>Value / Token</label>
                <input 
                    name="auth_value" 
                    placeholder="secret-token-123"
                    value={form.auth_value}
                    onChange={handleChange}
                />
              </div>
            </div>
          )}

          {error && <div className="form-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="secondary-btn">Cancel</button>
            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? "Creating..." : "Start Monitoring"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}