import React, { useEffect, useState, useCallback } from "react";
import {
  getAdminStats,
  getUsers,
  toggleBanUser,
  getAdminActivities,
  getSystemHealth
} from "../../api/admin.api";
import "../../styles/admin.css";

const KpiCard = ({ label, value, sub, isLoading, colorClass = "" }) => (
  <div className="kpi-card glass-panel">
    <div className="kpi-label">{label}</div>
    {isLoading ? (
      <div className="skeleton-pulse skeleton-text"></div>
    ) : (
      <div className={`kpi-value ${colorClass}`}>{value}</div>
    )}
    <div className="kpi-sub">{sub}</div>
  </div>
);

const FinancialsTab = ({ stats, activities, loadingActivities }) => {
  const isLoadingStats = !stats;

  return (
    <div className="tab-content animate-fade">
      <div className="kpi-grid">
        <KpiCard
          label="Total Revenue"
          value={stats?.total_revenue ? `$${stats.total_revenue.toLocaleString()}` : "$0"}
          sub="Estimated Gross Income"
          isLoading={isLoadingStats}
          colorClass="text-green"
        />
        <KpiCard
          label="Top Performing Plan"
          value={stats?.most_sold_plan || "N/A"}
          sub={stats ? `${stats.most_sold_plan_count} Active Subscriptions` : ""}
          isLoading={isLoadingStats}
          colorClass="text-white"
        />
        <KpiCard
          label="Total User Base"
          value={stats?.total_users || 0}
          sub={stats ? `${stats.pro_users} Pro / ${stats.agency_users} Agency` : ""}
          isLoading={isLoadingStats}
          colorClass="text-white"
        />
        <KpiCard
          label="Active Workspaces"
          value={stats?.active_workspaces || 0}
          sub="Operational Environments"
          isLoading={isLoadingStats}
          colorClass="text-purple"
        />
      </div>

      <div className="glass-panel mt-6">
        <div className="panel-header">
          <h3>Live Stripe Ledger</h3>
          {loadingActivities && <div className="spinner-sm"></div>}
        </div>
        <div className="feed-list">
          {loadingActivities && activities.length === 0 ? (
            // Skeletons for Feed
            [1, 2, 3].map((i) => <div key={i} className="skeleton-row"></div>)
          ) : activities.length > 0 ? (
            activities.map((act) => (
              <div key={act.id} className="feed-item">
                <span className="feed-type">{act.type}</span>
                <span className="feed-id mono">{act.id}</span>
                <span className="feed-date mono">{act.created}</span>
              </div>
            ))
          ) : (
            <div className="empty-state">No recent transactions found.</div>
          )}
        </div>
      </div>
    </div>
  );
};
const UsersTab = ({ users, page, setPage, handleBan, loading }) => (
  <div className="glass-panel animate-fade">
    <div className="panel-header">
      <h3>User Directory</h3>
      <div className="pagination-controls">
        <button disabled={page === 1 || loading} onClick={() => setPage(p => p - 1)} className="btn-icon">PREV</button>
        <span className="mono text-muted">PAGE {page}</span>
        <button disabled={loading} onClick={() => setPage(p => p + 1)} className="btn-icon">NEXT</button>
      </div>
    </div>
    
    <div className="table-responsive">
      <table className="admin-table">
        <thead>
          <tr>
            <th>User Identity</th>
            <th>Subscription</th>
            <th>Role</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.ID}>
              <td>
                <div className="user-cell">
                  <span className="user-name">{u.Username}</span>
                  <span className="user-email mono">{u.Email}</span>
                </div>
              </td>
              <td>
                {/* FIX: Use 'u.plan' (lowercase) to fix the "Free" bug */}
                <span className={`badge badge-${u.plan ? u.plan.toLowerCase() : 'free'}`}>
                  {u.plan || "FREE"}
                </span>
              </td>
              <td>
                <span className={u.IsSuperAdmin ? "role-admin" : "role-user"}>
                  {u.IsSuperAdmin ? "SUPER ADMIN" : "USER"}
                </span>
              </td>
              <td>
                <span className={`status-dot ${u.IsActive ? 'online' : 'offline'}`}></span>
                {u.IsActive ? "Active" : "Banned"}
              </td>
              <td className="text-right">
                {!u.IsSuperAdmin && (
                  <button 
                    onClick={() => handleBan(u.ID)} 
                    className={`btn-action ${u.IsActive ? 'btn-ban' : 'btn-unban'}`}
                  >
                    {u.IsActive ? 'REVOKE ACCESS' : 'RESTORE ACCESS'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const SystemTab = ({ health }) => {
  const kStats = health?.kafka?.writer_performance || {};
  const isDbOnline = health?.database === "Online";
  const isKafkaOnline = health?.kafka?.status === "Online";

  return (
    <div className="tab-content animate-fade">
      <div className="kpi-grid">
        <div className={`kpi-card glass-panel border-top-${isDbOnline ? 'green' : 'red'}`}>
          <div className="kpi-label">PostgreSQL Node</div>
          <div className={`kpi-value ${isDbOnline ? 'text-green' : 'text-red'}`}>
            {health?.database || "CONNECTING..."}
          </div>
          <div className="kpi-sub">Primary Storage Engine</div>
        </div>

        <div className={`kpi-card glass-panel border-top-${isKafkaOnline ? 'green' : 'red'}`}>
          <div className="kpi-label">Kafka Cluster</div>
          <div className={`kpi-value ${isKafkaOnline ? 'text-green' : 'text-red'}`}>
            {health?.kafka?.status || "CONNECTING..."}
          </div>
          <div className="kpi-sub">
            {health?.kafka?.broker_count || 0} Brokers / {health?.kafka?.topic_count || 0} Topics
          </div>
        </div>
      </div>

      {isKafkaOnline && (
        <div className="glass-panel mt-6">
          <div className="panel-header">
            <h3>Writer Performance Telemetry</h3>
          </div>
          <div className="telemetry-grid">
            <div className="telemetry-box">
              <span className="label">AVG LATENCY</span>
              <span className={`value mono ${kStats.avg_write_time_ms > 50 ? 'text-yellow' : 'text-green'}`}>
                {kStats.avg_write_time_ms?.toFixed(2)}ms
              </span>
            </div>
            <div className="telemetry-box">
              <span className="label">MESSAGES</span>
              <span className="value mono">{kStats.messages_sent?.toLocaleString()}</span>
            </div>
            <div className="telemetry-box">
              <span className="label">ERRORS</span>
              <span className={`value mono ${kStats.errors > 0 ? 'text-red' : 'text-green'}`}>
                {kStats.errors}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("financials");
  
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [health, setHealth] = useState(null);

  const [loadingActivities, setLoadingActivities] = useState(false);
  const [loadingTab, setLoadingTab] = useState(false);
  const [page, setPage] = useState(1);

  // 1. Independent Fetch for Financials
  const loadFinancials = useCallback(async () => {
    // A. Fast Stats (Non-blocking)
    try {
      const s = await getAdminStats();
      setStats(s.data);
    } catch (e) { console.error("Stats Error", e); }

    // B. Slow Stripe (Background)
    setLoadingActivities(true);
    try {
      const a = await getAdminActivities();
      setActivities(a.data);
    } catch (e) { console.error("Stripe Error", e); }
    finally { setLoadingActivities(false); }
  }, []);

  const loadUsers = useCallback(async (p) => {
    setLoadingTab(true);
    try {
      const u = await getUsers(p, 10);
      setUsers(u.data);
    } catch (e) { console.error("User Error", e); }
    finally { setLoadingTab(false); }
  }, []);

  const loadSystem = useCallback(async () => {
    try {
      const h = await getSystemHealth();
      setHealth(h.data);
    } catch (e) { console.error("Health Error", e); }
  }, []);

  // Effect: Router for Tabs
  useEffect(() => {
    if (activeTab === "financials") {
      if (!stats) loadFinancials(); // Only load if missing to save bandwidth
    } else if (activeTab === "users") {
      loadUsers(page);
    } else if (activeTab === "system") {
      loadSystem();
    }
  }, [activeTab, page, loadFinancials, loadUsers, loadSystem]);

  const handleBan = async (id) => {
    if(!window.confirm("Confirm user access modification?")) return;
    await toggleBanUser(id);
    loadUsers(page);
  };

  return (
    <div className="admin-root">
      <header className="admin-header">
        <div className="header-content">
          <div className="sys-indicator"></div>
          <div>
            <h1>Control Plane</h1>
            <p className="mono">LATTRIX // SYSTEM ADMINISTRATION</p>
          </div>
        </div>
        <button onClick={() => window.location.reload()} className="btn-refresh">
          FORCE SYNC
        </button>
      </header>

      <nav className="tabs-nav">
        {['financials', 'users', 'system'].map(tab => (
          <button 
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </nav>

      <main className="dashboard-content">
        {activeTab === 'financials' && (
          <FinancialsTab 
            stats={stats} 
            activities={activities} 
            loadingActivities={loadingActivities} 
          />
        )}
        {activeTab === 'users' && (
          <UsersTab 
            users={users} 
            page={page} 
            setPage={setPage} 
            handleBan={handleBan} 
            loading={loadingTab} 
          />
        )}
        {activeTab === 'system' && <SystemTab health={health} />}
      </main>
    </div>
  );
};

export default AdminDashboard;