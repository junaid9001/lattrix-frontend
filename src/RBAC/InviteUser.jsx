import { useEffect, useState } from "react";
import { getRoles, sendInvite } from "../api/rbac.api";

function InviteUser() {
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await getRoles();
        const allRoles = res.data.data || [];
        setRoles(allRoles.filter(r => r.name !== "Owner"));
      } catch {
        setError("Failed to load roles");
      }
    }
    fetchRoles();
  }, []);

  async function handleInvite(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !roleId) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      await sendInvite({ email, roleId });
      setEmail("");
      setRoleId("");
      setSuccess("Invitation sent to " + email);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="invite-card">
      <h3 className="invite-title">Invite New Member</h3>
      <p className="invite-subtitle">
        Send an email invitation to add a new member to your workspace.
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

        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        <button type="submit" className="invite-btn" disabled={loading}>
          {loading ? "Sending..." : "Send Invitation"}
        </button>
      </form>
    </div>
  );
}

export default InviteUser;