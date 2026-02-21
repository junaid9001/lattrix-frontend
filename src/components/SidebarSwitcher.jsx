// src/components/SidebarSwitcher.jsx
import { useState, useEffect, useContext, useRef } from "react";
import { getWorkspaces, selectWorkspace } from "../api/auth.api";
import { AuthContext } from "../context/AuthContext";
import CreateWorkspaceModal from "./CreateWorkspaceModal";
import { ChevronsUpDown, Plus, Check, Building2 } from "lucide-react";
import "../styles/components.css";

export default function SidebarSwitcher() {
  const { user, checkAuth } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      getWorkspaces()
        .then((res) => setWorkspaces(res.data.data))
        .catch(console.error);
    }
  }, [isOpen]);

  const handleSwitch = async (id) => {
    try {
      await selectWorkspace(id);
      await checkAuth();
      setIsOpen(false);
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Switch failed", err);
    }
  };

  if (!user) return null;

  // Safe fallback for workspace name
  const currentWsName =
    workspaces.find((w) => w.workspace_id === user.workspace_id)?.name ||
    "My Workspace";

  return (
    <div
      className="sidebar-switcher"
      ref={dropdownRef}
      style={{ position: "relative" }}
    >
      {/* 1. The Switcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: isOpen
            ? "rgba(255,255,255,0.05)"
            : "rgba(255,255,255,0.02)", // Slightly visible bg
          border: "1px solid var(--border-glass)",
          padding: "8px 12px",
          borderRadius: "var(--radius-sm)",
          cursor: "pointer",
          transition: "all 0.2s",
          color: "var(--text-primary)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Small Icon Box */}
          <div
            style={{
              width: "20px",
              height: "20px",
              background: "var(--bg-void)",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
            }}
          >
            <Building2 size={12} />
          </div>
          <span
            style={{
              fontSize: "12px",
              fontWeight: "500",
              maxWidth: "140px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {currentWsName}
          </span>
        </div>
        <ChevronsUpDown size={12} color="var(--text-muted)" />
      </button>

      {/* 2. The Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            marginTop: "6px",
            background: "#0a0a0a",
            border: "1px solid var(--border-glass)",
            borderRadius: "var(--radius-sm)",
            boxShadow: "0 10px 40px -10px rgba(0,0,0,0.8)",
            zIndex: 9999,
            padding: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "6px 8px",
              fontSize: "10px",
              color: "var(--text-muted)",
              textTransform: "uppercase",
            }}
          >
            Organizations
          </div>

          <div
            style={{
              maxHeight: "200px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            {workspaces.map((ws) => (
              <button
                key={ws.workspace_id}
                onClick={() => handleSwitch(ws.workspace_id)}
                style={{
                  textAlign: "left",
                  padding: "8px",
                  background:
                    user.workspace_id === ws.workspace_id
                      ? "rgba(255,255,255,0.05)"
                      : "transparent",
                  border: "none",
                  borderRadius: "4px",
                  color:
                    user.workspace_id === ws.workspace_id
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                onMouseEnter={(e) => {
                  if (user.workspace_id !== ws.workspace_id)
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                }}
                onMouseLeave={(e) => {
                  if (user.workspace_id !== ws.workspace_id)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                {ws.name}
                {user.workspace_id === ws.workspace_id && (
                  <Check size={12} color="var(--accent-primary)" />
                )}
              </button>
            ))}
          </div>

          <div
            style={{
              height: "1px",
              background: "var(--border-glass)",
              margin: "4px 0",
            }}
          ></div>

          <button
            onClick={() => {
              setIsOpen(false);
              setShowCreate(true);
            }}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "8px",
              background: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-secondary)")
            }
          >
            <Plus size={14} /> Create Organization
          </button>
        </div>
      )}

      {showCreate && (
        <CreateWorkspaceModal onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}
