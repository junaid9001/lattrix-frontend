import { useEffect, useState } from "react";
import { getRoles } from "../api/rbac.api";

function RolesList() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await getRoles();
        const allRoles = res.data.data || [];
        setRoles(allRoles.filter(r => r.name !== "Owner"));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRoles();
  }, []);

  if (loading) return <div style={{padding: '20px', fontSize: '13px', color: '#9ca3af'}}>Loading...</div>;

  return (
    <ul className="roles-list">
      {roles.length === 0 ? (
        <li style={{padding: '20px', fontSize: '13px', textAlign: 'center', color: '#9ca3af'}}>
          No custom roles.
        </li>
      ) : (
        roles.map((role) => (
          <li key={role.id} className="role-item">
            {role.name}
          </li>
        ))
      )}
    </ul>
  );
}

export default RolesList;