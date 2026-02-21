import { useEffect, useState } from "react";
import { getRoles, sendInvite } from "../api/rbac.api";

import "../styles/rbac.css"

function InviteUser() {
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await getRoles();
        setRoles((res.data.data || []).filter(r => r.name !== "Owner"));
      } catch {
        // Silent fail
      }
    }
    fetchRoles();
  }, []);

  async function handleInvite(e) {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!email || !roleId) {
      setMessage({ type: "error", text: "Please fill in all fields." });
      return;
    }

    try {
      setLoading(true);
      await sendInvite({ email, roleId });
      setEmail("");
      setMessage({ type: "success", text: "Invitation sent successfully." });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to send invite." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="invite-card">
      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'var(--text-main)' }}>Invite New Member</h3>
      <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
        Send an email invitation to add a colleague to your workspace.
      </p>

      <form onSubmit={handleInvite}>
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="colleague@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Assign Role</label>
          <select value={roleId} onChange={(e) => setRoleId(e.target.value)}>
            <option value="">Select a role...</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        {message.text && (
          <div style={{ 
            padding: '12px', 
            marginBottom: '20px', 
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            backgroundColor: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            color: message.type === 'error' ? 'var(--status-red)' : 'var(--status-green)'
          }}>
            {message.text}
          </div>
        )}

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? "Sending..." : "Send Invitation"}
        </button>
      </form>
    </div>
  );
}

export default InviteUser;