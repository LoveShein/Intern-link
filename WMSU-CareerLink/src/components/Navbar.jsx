import {
  Bell,
  BriefcaseBusiness,
  Menu,
} from 'lucide-react';

export default function Navbar({
  user,
  onMenu,
  onNotifications,
}) {
  return (
    <header className="topbar">
      <button
        className="icon-btn mobile-menu"
        onClick={onMenu}
        aria-label="Open navigation"
      >
        <Menu />
      </button>

      <div className="brand-mark">
        <BriefcaseBusiness size={22} />
      </div>

      <div className="brand-name">
        WMSU <span>CareerLink</span>
        <small>JOB & INTERNSHIP PORTAL</small>
      </div>

      <div className="topbar-spacer" />

      <button
        className="icon-btn"
        onClick={onNotifications}
        aria-label="Notifications"
      >
        <Bell size={20} />
        <i className="notification-dot" />
      </button>

      <div className="user-chip">
        <div className="avatar">
          {(user?.name || 'Guest')
            .split(' ')
            .map((s) => s[0])
            .slice(0, 2)
            .join('')}
        </div>

        <div>
          <strong>{user?.name || 'Guest User'}</strong>
          <small>{user?.role || 'Visitor'}</small>
        </div>
      </div>
    </header>
  );
}