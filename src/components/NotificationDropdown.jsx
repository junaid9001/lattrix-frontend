// src/components/NotificationDropdown.jsx
import { useEffect, useState, useRef } from "react";
import { Bell, Check, X, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getMyNotifications, acceptInvitation, markAsRead } from "../api/notification";
import "./NotificationDropdown.css" 
function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await getMyNotifications();
      // Ensure we always have an array
      const list = res.data.data || [];
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    // Optional: Mark all as read when opening? 
    // Usually better to mark individual ones or have a "Mark all read" button.
  };

  const handleAccept = async (notification) => {
    try {
      // 1. Get token from the JSONB data field
      const token = notification.data?.token; 
      if (!token) {
        alert("Invalid invitation: missing token");
        return;
      }

      // 2. Call API
      await acceptInvitation(token);
      alert("Invitation accepted! Switching workspace...");
      
      // 3. Refresh to update UI/Workspace
      window.location.reload(); 
    } catch (err) {
      alert(err.response?.data?.error || "Failed to accept invitation");
    }
  };

  return (
    <div className="notification-container" ref={dropdownRef}>
      {/* Icon Trigger */}
      <button className="notification-btn" onClick={handleToggle}>
        <Bell size={20} color="#4b5563" />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="notification-dropdown">
          <header className="notif-header">
            <h4>Notifications</h4>
          </header>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <p className="notif-empty">No notifications yet</p>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className={`notif-item ${!notif.is_read ? "unread" : ""}`}>
                  <div className="notif-icon-area">
                    <div className="notif-icon-bg">
                        <Mail size={16} />
                    </div>
                  </div>
                  
                  <div className="notif-content">
                    <p className="notif-title">{notif.title}</p>
                    <p className="notif-message">{notif.message}</p>
                    <span className="notif-time">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </span>

                    {/* Action Buttons for Invitations */}
                    {notif.type === "invitation" && (
                      <div className="notif-actions">
                        <button 
                          className="btn-accept" 
                          onClick={() => handleAccept(notif)}
                        >
                          <Check size={14} /> Accept
                        </button>
                        {/* <button className="btn-reject">
                          <X size={14} /> Reject
                        </button> 
                        */}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;