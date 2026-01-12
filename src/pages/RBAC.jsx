import { useState } from "react";
import InviteUser from "../RBAC/InviteUser";
import "../styles/rbac.css";
import RoleCreator from "../RBAC/RoleCreator";
import RolesList from "../RBAC/RoleList";
import PromoteDemote from "../RBAC/PromoteDemote";

function RBAC() {
  const [activeTab, setActiveTab] = useState("invite");

  return (
    <div className="rbac-page">
      {/* Header */}
      <header className="rbac-header">
        <h1 className="rbac-title">RBAC</h1>
        <p className="rbac-subtitle">
          Manage roles, permissions, and workspace access
        </p>
      </header>

      {/* Tab Navigation */}
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

      {/* Content Area */}
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
              <RolesList />
            </div>

            <div className="rbac-right">
              <RoleCreator />
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
