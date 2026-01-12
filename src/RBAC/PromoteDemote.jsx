import { useEffect, useState } from "react";
import { allUsers } from "../api/rbac.api";
import { getRoles } from "../api/rbac.api";

function PromoteDemote() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [usersRes, rolesRes] = await Promise.all([
          allUsers(),
          getRoles(),
        ]);

        setUsers(usersRes.data.data || []);
        setRoles(rolesRes.data.data || []);
      } catch (err) {
        setError("Failed to load users or roles");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="promote-demote">
      <h3 className="section-title">Promote / Demote Users</h3>

      <div className="user-role-table">
        <div className="user-role-header">
          <span>Email</span>
          <span>Current Role</span>
        </div>

        {users.map((user) => (
          <div key={user.user_id} className="user-role-row">
            <span>{user.email}</span>
            <span>{user.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PromoteDemote;
