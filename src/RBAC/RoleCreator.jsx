import { useEffect, useState } from "react";
import { createRole, getPermissions } from "../api/rbac.api";
import toast from "react-hot-toast";
import "../styles/rbac.css"

function RoleCreator({ onCreated }) {
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

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
    if (!name.trim() || selected.length === 0) return;

    try {
      setLoading(true);
      await createRole({ name, permissionIds: selected });
      setName("");
      setSelected([]);
      if (onCreated) onCreated();
    } catch (err) {
      toast.error("Failed to create role");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="role-creator">
      <h3 style={{ marginTop: 0 }}>Create Role</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Role Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Audit Viewer"
            required
          />
        </div>

        <div className="form-group">
          <label>Permissions</label>
          <div className="permissions-box">
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

        <button disabled={loading} className="primary-btn">
          {loading ? "Saving..." : "Create Role"}
        </button>
      </form>
    </div>
  );
}

export default RoleCreator;