import { useEffect, useState } from "react";
import { getRoles } from "../api/rbac.api";

function RolesList({ onSelect }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await getRoles();
        setRoles(res.data.data || []);
      } finally {
        setLoading(false);
      }
    }
    fetchRoles();
  }, []);

  if (loading) return <p className="muted-text">Loading roles...</p>;

  if (roles.length === 0) {
    return <p className="muted-text">No roles created yet.</p>;
  }

  return (
    <div className="roles-list">
      {roles
        .filter((role) => role && role.id && role.name)
        .map((role) => (
          <div key={role.id} className="role-item">
            {role.name}
          </div>
        ))}
    </div>
  );
}

export default RolesList;
