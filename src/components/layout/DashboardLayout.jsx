import { useContext } from "react";
import { NavLink, Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { AuthContext } from "../../context/AuthContext";
import "./navbar.css";

function DashboardLayout() {
  // Get permission helpers from context
  const { hasPermission, isSuperAdmin } = useContext(AuthContext);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Navbar />

      <div style={{ display: "flex", flex: 1 }}>
        <aside
          style={{
            width: "220px",
            borderRight: "1px solid #ddd",
            padding: "16px",
          }}
        >
          <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Always visible */}
            <NavLink 
              to="/dashboard"
              className={({ isActive }) => (isActive ? "active-link" : "")} 
            >
              Dashboard
            </NavLink>

            {/* Hidden if user cannot create/manage API groups */}
            {(hasPermission("api-group:create") || hasPermission("api-group:read")) && (
              <NavLink 
                to="/dashboard/api-groups"
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                API Groups
              </NavLink>
            )}

            {/* Hidden if user is not Super Admin */}
            {isSuperAdmin && (
              <NavLink 
                to="/dashboard/rbac"
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                RBAC
              </NavLink>
            )}
          </nav>
        </aside>

        <main style={{ flex: 1, padding: "16px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;