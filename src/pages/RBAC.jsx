import { useState } from "react";
import InviteUser from "../RBAC/InviteUser";
import "../styles/rbac.css";
import RoleCreator from "../RBAC/RoleCreator";
import RolesList from "../RBAC/RoleList";
import PromoteDemote from "../RBAC/PromoteDemote";

function RBAC() {
  const [activeTab, setActiveTab] = useState("invite");
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger re-fetches

  // Callback when a role is created
  const handleRoleCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="rbac-page">
      <header className="rbac-header">
        <h1 className="rbac-title">RBAC Management</h1>
        <p className="rbac-subtitle">
          Manage roles, permissions, and workspace access
        </p>
      </header>

      {/* Tabs */}
      <nav className="rbac-tabs">
        <button
          className={`rbac-tab ${activeTab === "invite" ? "active" : ""}`}
          onClick={() => setActiveTab("invite")}
        >
          Invite User
        </button>

        <button
          className={`rbac-tab ${activeTab === "roles" ? "active" : ""}`}
          onClick={() => setActiveTab("roles")}
        >
          Roles & Permissions
        </button>

        <button
          className={`rbac-tab ${activeTab === "assign" ? "active" : ""}`}
          onClick={() => setActiveTab("assign")}
        >
          Promote / Demote
        </button>
      </nav>

      {/* Content */}
      <section className="rbac-content">
        {activeTab === "invite" && (
          <div className="rbac-section">
            <InviteUser />
          </div>
        )}

        {activeTab === "roles" && (
          <div className="rbac-roles-layout">
            <div className="rbac-left">
              <h4>Existing Roles</h4>
              {/* key prop forces component to remount/refetch when refreshKey changes */}
              <RolesList key={refreshKey} />
            </div>

            <div className="rbac-right">
              {/* Pass callback to child */}
              <RoleCreator onCreated={handleRoleCreated} />
            </div>
          </div>
        )}

        {activeTab === "assign" && (
          <div className="rbac-section">
            <PromoteDemote />
          </div>
        )}
      </section>
    </div>
  );
}

export default RBAC;