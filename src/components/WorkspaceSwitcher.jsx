// src/components/WorkspaceSwitcher.jsx
import { useState, useEffect, useContext, useRef } from "react";
import { getWorkspaces, selectWorkspace } from "../api/auth.api";
import { AuthContext } from "../context/AuthContext";
import CreateWorkspaceModal from "./CreateWorkspaceModal";
import { ChevronDown, Plus, Check } from "lucide-react";
import "../styles/components.css"; // Ensure access to glass vars

export default function WorkspaceSwitcher() {
  const { user, checkAuth } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch workspaces when dropdown opens
  useEffect(() => {
    if (isOpen) {
      getWorkspaces().then(res => setWorkspaces(res.data.data)).catch(console.error);
    }
  }, [isOpen]);

  const handleSwitch = async (id) => {
    try {
      await selectWorkspace(id);
      await checkAuth();
      setIsOpen(false);
      window.location.reload(); // Refresh to load new workspace data
    } catch (err) {
      console.error("Switch failed", err);
    }
  };

  // Safe check for user data
  if (!user) return null;

  // We assume 'user.workspace_name' or similar exists in your user object
  // If not, we fall back to "My Workspace"
  const currentName = user.workspace_name || user.username + "'s Workspace"; 

  return (
    <div className="workspace-switcher" ref={dropdownRef} style={{ position: 'relative' }}>
      {/* The Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border-glass)',
          padding: '6px 12px',
          borderRadius: '6px',
          color: 'var(--text-primary)',
          fontSize: '13px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        <span style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {currentName}
        </span>
        <ChevronDown size={14} style={{ opacity: 0.5 }} />
      </button>

      {/* The Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: '8px',
          width: '240px',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-glass)',
          borderRadius: '8px',
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
          zIndex: 50,
          overflow: 'hidden',
          animation: 'fadeIn 0.1s ease-out'
        }}>
          <div style={{ padding: '8px 12px', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Switch Organization
          </div>
          
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {workspaces.map(ws => (
              <button
                key={ws.workspace_id}
                onClick={() => handleSwitch(ws.workspace_id)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '10px 12px',
                  background: 'transparent', border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {ws.name}
                {/* Visual indicator for current workspace could go here if we had the ID in context */}
              </button>
            ))}
          </div>

          <div style={{ height: '1px', background: 'var(--border-glass)', margin: '4px 0' }}></div>

          <button
            onClick={() => { setIsOpen(false); setShowCreate(true); }}
            style={{
              width: '100%', textAlign: 'left',
              padding: '10px 12px',
              background: 'transparent', border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
            onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.background = 'transparent';
            }}
          >
            <Plus size={14} /> Create New Workspace
          </button>
        </div>
      )}

      {showCreate && <CreateWorkspaceModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}