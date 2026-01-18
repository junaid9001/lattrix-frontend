import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGroupById } from "../api/groups.api";
import { getApisByGroup, deleteApi } from "../api/apis.api";
import CreateApiModal from "../components/CreateApiModal"; 
import { AuthContext } from "../context/AuthContext";
import "../styles/dashboard.css";

function GroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { hasPermission } = useContext(AuthContext);

  useEffect(() => {
    loadData();
    // Poll every 5s for real-time updates
    const interval = setInterval(() => loadData(true), 5000);
    return () => clearInterval(interval);
  }, [id]);

  async function loadData(isPolling = false) {
    try {
      const [groupRes, apisRes] = await Promise.all([
        getGroupById(id),
        getApisByGroup(id)
      ]);
      setGroup(groupRes.data.data);
      setApis(apisRes.data.data || []);
    } catch (err) {
      console.error("Failed to load group data", err);
    } finally {
      if (!isPolling) setLoading(false);
    }
  }

  const handleDeleteApi = async (e, apiId) => {
    e.stopPropagation(); // Prevent card click
    if(!window.confirm("Are you sure?")) return;
    try {
      await deleteApi(id, apiId);
      setApis(apis.filter(a => a.id !== apiId));
    } catch(err) {
      alert("Failed to delete API");
    }
  }

  const handleCardClick = (apiId) => {
    // Navigate to metrics page (Placeholder for now)
    // navigate(`/dashboard/api/${apiId}`);
    alert("Metrics view coming soon! ID: " + apiId);
  };

  if (loading && !group) return <div className="p-4">Loading...</div>;
  if (!group) return <div className="p-4">Group not found</div>;

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
            <button onClick={() => navigate(-1)} className="secondary-btn" style={{padding:'4px 8px'}}>← Back</button>
            <h1 className="page-title">{group.name}</h1>
          </div>
          <p className="page-subtitle">{group.description}</p>
        </div>
        {hasPermission("api:create") && (
          <button className="primary-btn" onClick={() => setShowCreateModal(true)}>
            + Add API
          </button>
        )}
      </header>

      <div className="grid-layout">
        {apis.length === 0 ? (
          <div className="empty-state">No APIs in this group yet.</div>
        ) : (
          apis.map(api => (
            <div 
              key={api.id} 
              className="card-item clickable" 
              onClick={() => handleCardClick(api.id)}
              style={{cursor: 'pointer', position: 'relative'}}
            >
              <div className="card-header">
                <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                  <span className={`method-badge ${api.method}`}>{api.method}</span>
                  <h3 style={{fontSize:'16px', fontWeight:'600'}}>{api.name}</h3>
                </div>
                {/* Status Badge */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: api.last_status === 'UP' ? '#ecfdf5' : '#fef2f2',
                  color: api.last_status === 'UP' ? '#059669' : '#dc2626',
                  padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold'
                }}>
                  <div className={`status-dot ${api.last_status === 'UP' ? 'green' : 'red'}`} />
                  {api.last_status || 'PENDING'}
                </div>
              </div>
              
              <div className="api-url-preview" style={{color: '#6b7280', fontSize: '13px', marginBottom: '12px'}}>
                {api.url}
              </div>

              {/* Metrics Section */}
              <div style={{display:'flex', gap:'12px', fontSize:'13px', marginBottom:'16px'}}>
                <div style={{display:'flex', alignItems:'center', gap:'4px', color:'#374151'}}>
                   <span>⏱</span> 
                   <strong>{api.last_response_time_ms ? `${api.last_response_time_ms}ms` : '-'}</strong>
                </div>
                {api.last_status === 'DOWN' && api.last_error_message && (
                  <div style={{color: '#dc2626', maxWidth: '200px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}} title={api.last_error_message}>
                    ⚠ {api.last_error_message}
                  </div>
                )}
              </div>
              
              <div className="card-actions">
                <span className="text-muted text-sm">Checked: {api.last_checked_at ? new Date(api.last_checked_at).toLocaleTimeString() : 'Never'}</span>
                <button 
                  onClick={(e) => handleDeleteApi(e, api.id)} 
                  className="text-red-500 text-sm hover:underline"
                  style={{background:'none', border:'none', cursor:'pointer'}}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <CreateApiModal 
          groupId={id} 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={() => { setShowCreateModal(false); loadData(); }} 
        />
      )}
    </div>
  );
}

export default GroupDetails;