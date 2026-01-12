import { useEffect, useState } from "react";
import { getRoles, sendInvite } from "../api/rbac.api";

function InviteUser() {
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await getRoles();
        setRoles(res.data.data || []);
      } catch {
        setError("Failed to load roles");
      }
    }

    fetchRoles();
  }, []);

  async function handleInvite(e) {
    e.preventDefault();
    setError("");

    if (!email || !roleId) {
      setError("Email and role are required");
      return;
    }

    try {
      setLoading(true);
      await sendInvite({ email, roleId });
      setEmail("");
      setRoleId("");
      alert("Invitation sent");
    } catch {
      setError("Failed to send invitation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="invite-card">
      <h3 className="invite-title">Invite User</h3>
      <p className="invite-subtitle">
        Invite a user to your workspace and assign a role.
      </p>

      <form className="invite-form" onSubmit={handleInvite}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Role</label>
          <select value={roleId} onChange={(e) => setRoleId(e.target.value)}>
            <option value="">Select role</option>
            {roles
              .filter((role) => role && role.id)
              .map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
          </select>
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="invite-btn" disabled={loading}>
          {loading ? "Sending..." : "Send Invitation"}
        </button>
      </form>
    </div>
  );
}

export default InviteUser;
