import { useState, useEffect } from "react";
import { createGroup, getGroups } from "../api/groups.api"; // Import getGroups
import { Link } from "react-router-dom";
import "../styles/dashboard.css";

function ApiGroups() {
  const [groups, setGroups] = useState([]); 
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });

  // 1. ADD THIS EFFECT TO FETCH DATA ON LOAD
  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    try {
      const res = await getGroups();
      setGroups(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch groups", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createGroup(newGroup);
      setIsCreating(false);
      setNewGroup({ name: "", description: "" });
      loadGroups(); // Refresh list after creating
    } catch (err) {
      alert("Failed to create group",err);
    }
  };

  if (loading) return <div className="p-5">Loading...</div>;

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">API Groups</h1>
          <p className="page-subtitle">Organize your endpoints into logical groups.</p>
        </div>
        <button className="primary-btn" onClick={() => setIsCreating(true)}>
          + New Group
        </button>
      </header>

      {/* Creation Form */}
      {isCreating && (
        <div className="card-item" style={{ marginBottom: '20px', background: '#f9fafb' }}>
          <h3 style={{marginBottom:'12px'}}>Create Group</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
              <label>Name</label>
              <input 
                value={newGroup.name} 
                onChange={e => setNewGroup({...newGroup, name: e.target.value})} 
                required 
                placeholder="e.g. Payments Service"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0, flex: 2 }}>
              <label>Description</label>
              <input 
                 value={newGroup.description} 
                 onChange={e => setNewGroup({...newGroup, description: e.target.value})} 
                 placeholder="Optional description"
              />
            </div>
            <button type="submit" className="primary-btn">Save</button>
            <button type="button" className="secondary-btn" onClick={() => setIsCreating(false)}>Cancel</button>
          </form>
        </div>
      )}

      {/* Grid of Groups */}
      <div className="grid-layout">
        {groups.length === 0 ? (
          <div className="empty-state">No API groups found. Create one to get started.</div>
        ) : (
          groups.map((group) => (
            <div key={group.id} className="card-item">
              <div className="card-header">
                <h3>{group.name}</h3>
                <span className="badge">Active</span>
              </div>
              <p className="card-desc">{group.description || "No description provided."}</p>
              <div className="card-actions">
                <Link to={`/dashboard/api-groups/${group.id}`} className="link-btn">
                  View APIs &rarr;
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ApiGroups;