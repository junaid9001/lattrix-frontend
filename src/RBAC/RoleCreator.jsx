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
      try {
        const res = await getPermissions();
        setPermissions(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchPermissions();
  }, []);

  function togglePermission(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim() || selected.length === 0) {
      setError("Please provide a name and select at least one permission.");
      return;
    }

    try {
      setLoading(true);
      await createRole({ name, permissionIds: selected });
      setName("");
      setSelected([]);
      if (onCreated) onCreated();
    } catch (err) {
      setError("Failed to create role.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="role-creator">
      <h3>Create New Role</h3>
      <p className="invite-subtitle">Define a new set of permissions for your team.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Role Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Content Manager"
          />
        </div>

        <div className="form-group">
          <label>Permissions</label>
          <div className="permissions-box">
            <div className="permissions-title">Available Actions</div>
            <div className="permission-list-scroll">
              {permissions.map((p) => (
                <label key={p.id} className="permission-item">
                  <input
                    type="checkbox"
                    checked={selected.includes(p.id)}
                    onChange={() => togglePermission(p.id)}
                  />
                  <span>{p.description}</span>
                  <span className="permission-code">{p.code}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        <button disabled={loading} className="primary-btn" style={{ width: '100%' }}>
          {loading ? "Creating..." : "Create Role"}
        </button>
      </form>
    </div>
  );
}

export default RoleCreator;