import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../api/auth.api";
import { AuthContext } from "../../context/AuthContext";
import NotificationDropdown from "../NotificationDropdown"; // Import here

function Navbar() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  async function handleLogout() {
    try {
      await logout();            
      navigate("/login");     
      window.location.reload();  
    } catch (err) {
      console.error("Logout failed", err);
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-brand">Lattrix</span>
      </div>

      {user && (
        <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          
          {/* Add Notification Dropdown Here */}
          <NotificationDropdown />

          <button
            className="navbar-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;