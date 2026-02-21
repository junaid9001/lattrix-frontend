// src/RBAC/PromoteDemote.jsx
import { useEffect, useState } from "react";
import { allUsers, getRoles, updateRole } from "../api/rbac.api";
import toast from "react-hot-toast";
import "../styles/rbac.css";

function PromoteDemote() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        allUsers(),
        getRoles(),
      ]);

      const allRoles = rolesRes.data.data || [];
      // Filter out Owner role
      const cleanRoles = allRoles.filter((r) => r.name !== "Owner");
      setRoles(cleanRoles);

      const allUsersList = usersRes.data.data || [];
      // Filter out Owner user
      const nonOwnerUsers = allUsersList.filter((u) => u.role !== "Owner");
      setUsers(nonOwnerUsers);
    } catch (err) {
      console.error(err);
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  const handleRoleChange = async (userId, newRoleId) => {
    try {
      setUpdating(userId);
      await updateRole({ userId, roleId: newRoleId });

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.user_id === userId
            ? {
                ...u,
                role_id: newRoleId,
                role: roles.find((r) => r.id === newRoleId)?.name,
              }
            : u
        )
      );
    } catch (err) {
      toast.error("Failed to update role");
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  // --- INDUSTRIAL UI RENDER ---

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
      Retrieving clearance data...
    </div>
  );

  if (error) return (
    <div style={{ padding: '20px', color: '#ef4444', border: '1px solid #7f1d1d', background: 'rgba(127, 29, 29, 0.1)', borderRadius: '4px' }}>
      {error}
    </div>
  );

return (
    <div className="invite-card">
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'var(--text-primary)' }}>
          Manage Team Access
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
          Assign security roles to workspace members.
        </p>
      </div>

      <div className="user-role-table">
        {/* Header Row */}
        <div className="user-role-header">
          <span>Identity</span>
          <span>Security Clearance</span>
        </div>

        {/* Loading State */}
        {users.length === 0 ? (
           <div style={{ padding: '32px', textAlign: 'center', border: '1px dashed var(--border-subtle)', color: 'var(--text-muted)' }}>
             No other users found in this workspace.
           </div>
        ) : (
          users.map((user) => (
            <div key={user.user_id} className="user-role-row">
              {/* Column 1: User Details */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
                   {/* Fallback if username is missing */}
                   {user.username || user.email.split('@')[0]}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {user.email}
                </span>
              </div>

              {/* Column 2: Dropdown */}
              <div style={{ flex: 1 }}>
                <select
                  value={user.role_id || ""}
                  onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                  disabled={updating === user.user_id}
                >
                  <option value="" disabled>Select Role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PromoteDemote;