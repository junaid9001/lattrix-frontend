// src/components/layout/DashboardLayout.jsx
import { useContext } from "react";
import { NavLink, Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { AuthContext } from "../../context/AuthContext";
import SidebarSwitcher from "../SidebarSwitcher"; // Import the switcher
import "../../styles/layout.css";
import "../../styles/fonts.css";
import { Bell } from "lucide-react";

function DashboardLayout() {
  const { hasPermission, isSuperAdmin } = useContext(AuthContext);

  return (
    <div className="layout-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* 1. RESTORED LOGO (Top) */}
        <div className="brand-section">
          <span className="brand-text" style={{ fontFamily: "BrandFont, monospace",fontSize:"30px",color:"#ffffff" }}>Lattrix</span>
        </div>

        {/* 2. WORKSPACE SWITCHER (Below Logo) */}
        <div style={{ padding: "0 12px 24px 12px" }}>
          <SidebarSwitcher />
        </div>

        {/* 3. Navigation Links */}
        <nav style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              marginBottom: "12px",
              textTransform: "uppercase",
            }}
          >
            Menu
          </span>

          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            Overview
          </NavLink>

            {(hasPermission("api-group:create") ||
            hasPermission("api-group:read")) && (
            <NavLink
              to="/dashboard/api-groups"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              API Groups
            </NavLink>
          )}

          <NavLink
            to="/dashboard/notifications"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            Notifications
          </NavLink>

        

          {isSuperAdmin && (
            <>
              <div style={{ height: "24px" }}></div>
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  marginBottom: "12px",
                  textTransform: "uppercase",
                }}
              >
                System
              </span>
              <NavLink
                to="/dashboard/rbac"
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                Access Control
              </NavLink>
            </>
          )}
        </nav>
      </aside>

      {/* Main Window */}
      <div className="content-window">
        <Navbar />
        <main className="view-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
