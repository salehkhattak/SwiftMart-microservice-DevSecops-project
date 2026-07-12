import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNotifications } from "../services/notificationApi";
import { useToast } from "../context/ToastContext";
import "../styles/Notifications.css";

const TYPE_META = {
  ORDER_PLACED:     { icon: "🛍️", label: "Order Placed",     color: "info"    },
  ORDER_CONFIRMED:  { icon: "✓",   label: "Confirmed",        color: "primary" },
  ORDER_SHIPPED:    { icon: "📦",  label: "Shipped",          color: "accent"  },
  ORDER_DELIVERED:  { icon: "✅",  label: "Delivered",        color: "success" },
  ORDER_CANCELLED:  { icon: "✕",   label: "Cancelled",        color: "danger"  },
  ACCOUNT:          { icon: "👤",  label: "Account",          color: "muted"   },
};

function getTypeMeta(notification) {
  if (notification.type && TYPE_META[notification.type]) {
    return TYPE_META[notification.type];
  }
  // Infer from status or message
  const msg = (notification.message || "").toUpperCase();
  if (msg.includes("DELIVERED")) return TYPE_META.ORDER_DELIVERED;
  if (msg.includes("SHIPPED"))   return TYPE_META.ORDER_SHIPPED;
  if (msg.includes("CONFIRMED")) return TYPE_META.ORDER_CONFIRMED;
  if (msg.includes("CANCELLED")) return TYPE_META.ORDER_CANCELLED;
  if (msg.includes("PLACED"))    return TYPE_META.ORDER_PLACED;
  return { icon: "🔔", label: "Notification", color: "info" };
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const toast = useToast();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!user?.id) { setLoading(false); return; }
        const res = await getNotifications();
        setNotifications(res.data.data || []);
      } catch {
        toast.error("Could not load notifications.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="spinner-wrap">
          <div className="spinner" />
          <p>Loading notifications…</p>
        </div>
      </div>
    );
  }

  if (!user?.id) {
    return (
      <section className="notifications-page page-container">
        <div className="empty-state">
          <span style={{ fontSize: "2.5rem" }}>🔒</span>
          <h2>Login required</h2>
          <p>Sign in to view your notifications.</p>
          <Link to="/login" className="primary-link">Login</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="notifications-page page-container fade-up">
      <div className="page-header">
        <span className="eyebrow">🔔 Updates</span>
        <h1>Notifications</h1>
        <p>Order and account updates from your SwiftMart services.</p>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <span style={{ fontSize: "2.5rem" }}>🔕</span>
          <h2>All caught up!</h2>
          <p>New order updates and alerts will appear here.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((n) => {
            const meta = getTypeMeta(n);
            return (
              <article key={n.id} className={`notification-card notif-${meta.color}`}>
                <div className="notif-icon-wrap">
                  <span className="notif-icon">{meta.icon}</span>
                </div>

                <div className="notif-body">
                  {n.order_id && (
                    <div className="notif-order-id">Order #{n.order_id}</div>
                  )}
                  <p className="notif-message">{n.message}</p>
                  <div className="notif-footer">
                    <span className={`notif-badge notif-badge-${meta.color}`}>
                      {meta.label}
                    </span>
                    {(n.created_at || n.timestamp) && (
                      <span className="notif-time">
                        {timeAgo(n.created_at || n.timestamp)}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Notifications;
