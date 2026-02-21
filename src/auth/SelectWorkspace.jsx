// src/auth/SelectWorkspace.jsx
import { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { selectWorkspace } from "../api/auth.api";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import "../styles/auth.css"; // Uses the shared "Glass Card" style

function SelectWorkspace() {
  const location = useLocation();
  const navigate = useNavigate();
  const { checkAuth } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  
  const workspaces = location.state?.workspaces || [];

  useEffect(() => {
    if (workspaces.length === 0) {
      navigate("/login");
    }
  }, [workspaces, navigate]);

  const handleSelect = async (workspaceId) => {
    try {
      setLoading(true);
      await selectWorkspace(workspaceId);
      await checkAuth(); 
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to select workspace", err);
      toast.error("Failed to access workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" style={{ maxWidth: '450px' }}>
        <header className="auth-header">
          <h1>Security Checkpoint</h1>
          <p>Multiple environments detected. Select target:</p>
        </header>

        <div className="workspace-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {workspaces.map((ws) => (
            <button
              key={ws.workspace_id}
              onClick={() => handleSelect(ws.workspace_id)}
              disabled={loading}
              className="workspace-item"
              // Inline styling to match the Titanium look
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-glass)',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'left',
                color: 'var(--text-primary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s',
                cursor: loading ? 'wait' : 'pointer',
                width: '100%',
                opacity: loading ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.borderColor = 'var(--text-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.borderColor = 'var(--border-glass)';
                }
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', letterSpacing: '0.02em' }}>
                    {ws.name}
                </div>
                {/* Displaying Role as requested */}
                <div style={{ 
                    fontSize: '11px', 
                    color: 'var(--text-muted)', 
                    marginTop: '4px',
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em'
                }}>
                  Access: <span style={{ color: 'var(--accent-primary)' }}>{ws.role}</span>
                </div>
              </div>
              <span style={{ color: 'var(--accent-primary)', fontSize: '18px' }}>→</span>
            </button>
          ))}
        </div>
        
        <footer className="auth-footer">
          <button 
            className="btn-text" 
            onClick={() => navigate("/login")}
            disabled={loading}
            style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--text-muted)', 
                fontSize: '12px', 
                cursor: 'pointer', 
                textDecoration: 'underline',
                marginTop: '16px'
            }}
          >
            Terminate Session
          </button>
        </footer>
      </div>
    </div>
  );
}

export default SelectWorkspace;