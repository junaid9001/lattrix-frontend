import { useEffect, useState } from "react";
import { createRole, getPermissions } from "../api/rbac.api";

function RoleCreator({ onCreated }) {
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPermissions() {
      const res = await getPermissions();
      setPermissions(res.data.data || []);
    }
    fetchPermissions();
  }, []);

  function togglePermission(id) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [...prev, id]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name || selected.length === 0) {
      setError("Role name and permissions are required");
      return;
    }

    try {
      setLoading(true);
      await createRole({
        name,
        permissionIds: selected,
      });
      setName("");
      setSelected([]);
      onCreated?.();
    } catch {
      setError("Failed to create role");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="role-creator">
      <h3>Create Role</h3>

      <form onSubmit={handleSubmit} className="role-form">
        <div className="form-group">
          <label>Role Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Admin"
          />
        </div>

        <div className="permissions-box">
          <p className="permissions-title">Permissions</p>

          {permissions.map((p) => (
            <label key={p.id} className="permission-item">
              <input
                type="checkbox"
                checked={selected.includes(p.id)}
                onChange={() => togglePermission(p.id)}
              />
              <span>{p.description}</span>
              <small>{p.code}</small>
            </label>
          ))}
        </div>

        {error && <p className="form-error">{error}</p>}

        <button disabled={loading} className="primary-btn">
          {loading ? "Creating..." : "Create Role"}
        </button>
      </form>
    </div>
  );
}

export default RoleCreator;
