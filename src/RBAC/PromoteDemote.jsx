import { useEffect, useState } from "react";
import { allUsers, getRoles, updateRole } from "../api/rbac.api";

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
      alert("Failed to update role",err);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="muted-text">Loading...</div>;
  if (error) return <div className="form-error">{error}</div>;

  return (
    <div className="promote-demote">
      <h3 className="section-title">Manage Team Access</h3>
      <p className="invite-subtitle">Manage roles and permissions for your team members.</p>

      {/* Semantic Table Structure */}
      <div className="user-role-table">
        <div className="user-role-header">
          <span>Member</span>
          <span>Access Level</span>
        </div>

        {users.length === 0 ? (
          <div className="muted-text">No other members found.</div>
        ) : (
          users.map((user) => (
            <div key={user.user_id} className="user-role-row">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>{user.email}</span>
                {/* Optional: Add user ID or status here */}
              </div>

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
          ))
        )}
      </div>
    </div>
  );
}

export default PromoteDemote;