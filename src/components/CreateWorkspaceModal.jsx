// src/components/CreateWorkspaceModal.jsx
import { useState, useContext } from "react";
import { createWorkspace, selectWorkspace } from "../api/auth.api";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import "../styles/components.css"; 

export default function CreateWorkspaceModal({ onClose }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { checkAuth } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    try {
      // 1. Create the Workspace
      const res = await createWorkspace(name);
      const newWsId = res.data.data.workspace_id;

      // 2. Auto-Switch to it
      await selectWorkspace(newWsId);
      
      // 3. Refresh Auth Context (User is now 'in' the new workspace)
      await checkAuth();
      
      // 4. Force Reload/Redirect to refresh dashboard data
      window.location.href = "/dashboard"; 
      
    } catch (err) {
      toast.error("Failed to create workspace");
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      zIndex: 2000
    }}>
      <div style={{
        background: 'var(--bg-subtle)', 
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-md)', 
        padding: '32px', 
        width: '400px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', margin: 0 }}>Initialize Workspace</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="card-label">Workspace Name</label>
          <input 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Engineering Team"
            autoFocus
            required
            style={{ marginBottom: '24px' }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose} style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? "Initializing..." : "Create & Enter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}