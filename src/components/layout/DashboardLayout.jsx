import Navbar from "./Navbar";
import { NavLink, Outlet } from "react-router-dom";
import "./navbar.css"

function DashboardLayout() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Navbar />

      <div style={{ display: "flex", flex: 1 }}>

        <aside style={{ width: "220px", borderRight: "1px solid #ddd", padding: "16px" }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/dashboard/api-groups">API Groups</NavLink>
            <NavLink to="/dashboard/rbac">RBAC</NavLink>
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
