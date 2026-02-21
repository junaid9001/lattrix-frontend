import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { logout } from "../../api/auth.api";
import { AuthContext } from "../../context/AuthContext";
import NotificationDropdown from "../NotificationDropdown";
import CreateApiModal from "../CreateApiModal";
import { Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import "../../styles/components.css"; 

function Navbar() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  // State for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function handleLogout() {
    try {
      await logout();            
      navigate("/login");     
      window.location.reload();  
    } catch (err) {
      console.error("Logout failed", err);
      toast.error("Failed to disconnect session");
    }
  }

  if (!user) return null;

  return (
    <>
      <header className="top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginLeft: 'auto' }}>
          
      

        {user.is_super_admin && (
           <Link to="/dashboard/admin/dashboard" style={{ textDecoration: 'none' }}>
             <button style={{ 
                background: "rgba(220, 38, 38, 0.1)", // Red Tint
                border: "1px solid rgba(220, 38, 38, 0.5)",
                color: "#ef4444", // Red Text
                fontSize: "11px",
                fontWeight: "bold",
                padding: "6px 12px",
                borderRadius: "20px",
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "flex",
                alignItems: "center",
                gap: "6px"
             }}>
                <span style={{ fontSize: "8px" }}></span> Admin View
             </button>
           </Link>
        )}

     
        {(!user.plan || user.plan === "FREE") ? (
            <Link to="/dashboard/pricing" style={{ textDecoration: 'none' }}>
                <button className="btn btn-primary" style={{ 

                    background: "#a57531",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    padding: "8px 16px",
                    cursor: "pointer",
                    color: "white",
                    fontWeight: "600"
                }}>
                       Upgrade
                </button>
            </Link>
        ) : (
            <Link to="/dashboard/pricing" style={{ textDecoration: 'none' }}>
                <div style={{
                    padding: "6px 12px",
                    background: "var(--bg-panel)", // Consistent bg
                    border: "1px solid var(--accent-primary)",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "var(--accent-primary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    cursor: "pointer"
                }}>
                      {user.plan} PLAN
                </div>
            </Link>
        )}

            {/* --- NEW GLOBAL ACTION --- */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn primary-btn"
            style={{
                display: "flex", alignItems: "center", gap: "6px",
                fontSize: "10px", padding: "8px 16px",
                background:"transparent",
                
            }}
          >
            <Plus size={4} /> NEW MONITOR
          </button>

        {/* 3. Notifications */}
        <NotificationDropdown />
        
        {/* 4. User Profile */}
        <div style={{ textAlign: 'right', borderLeft: '1px solid var(--border-glass)', paddingLeft: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
            {user.username}
          </div>
          <button 
            onClick={handleLogout}
            style={{ 
              background: 'none', border: 'none', padding: 0, 
              fontSize: '11px', color: 'var(--accent-primary)', 
              opacity: 0.8, marginTop: '2px', cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: '0.05em'
            }}
          >
            Disconnect
          </button>
        </div>
        </div>
      </header>

      
      {isModalOpen && (
        <CreateApiModal 
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => window.location.reload()} 
        />
      )}
    </>
  );
}

export default Navbar;