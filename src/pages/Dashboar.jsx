function Dashboard() {
  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">
          Overview of your workspace activity
        </p>
      </header>

      {/* Stats Section */}
      <section className="dashboard-stats">
        <div className="stat-card">
          <h3 className="stat-title">API Groups</h3>
          <p className="stat-value">—</p>
        </div>

        <div className="stat-card">
          <h3 className="stat-title">APIs</h3>
          <p className="stat-value">—</p>
        </div>

        <div className="stat-card">
          <h3 className="stat-title">Alerts</h3>
          <p className="stat-value">—</p>
        </div>
      </section>

      {/* Activity / Placeholder */}
      <section className="dashboard-activity">
        <h2 className="section-title">Recent Activity</h2>
        <div className="empty-state">
          <p>No activity to show yet.</p>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
