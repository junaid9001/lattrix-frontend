import { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { selectWorkspace } from "../api/auth.api";
import { AuthContext } from "../context/AuthContext";
import "./auth.css";

function SelectWorkspace() {
  const location = useLocation();
  const navigate = useNavigate();
  const { checkAuth } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  
  // Workspaces passed from Login screen
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
      await checkAuth(); // Refresh context to get user data with new permissions
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to select workspace", err);
      alert("Failed to access workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <header className="auth-header">
          <h1>Select Workspace</h1>
          <p>Choose a workspace to continue</p>
        </header>

        <div className="workspace-list">
          {workspaces.map((ws) => (
            <button
              key={ws.workspace_id}
              onClick={() => handleSelect(ws.workspace_id)}
              className="workspace-item-btn"
              disabled={loading}
            >
              <span className="ws-name">{ws.name}</span>
              <span className="ws-role">{ws.role}</span>
            </button>
          ))}
        </div>
        
        <button 
          className="btn-text" 
          onClick={() => navigate("/login")}
          style={{ marginTop: '1rem', width: '100%' }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default SelectWorkspace;