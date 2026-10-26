
import {
  LayoutDashboard,
  UserRound,
  Search,
  FileText,
  Bookmark,
  Bell,
  Building2,
  BriefcaseBusiness,
  Users,
  ShieldCheck,
  ClipboardCheck,
  ChartNoAxesCombined,
  Settings,
  LogOut,
  GraduationCap,
  Megaphone,
} from 'lucide-react';

const menus = {
  Student: [
    ['Dashboard', 'dashboard', LayoutDashboard],
    ['Browse Internships', 'internships', Search],
    ['My Applications', 'applications', FileText],
    ['Saved Opportunities', 'saved', Bookmark],
    ['My Profile', 'profile', UserRound],
    ['Notifications', 'notifications', Bell],
    ['Account Settings', 'settings', Settings],
  ],

  Employer: [
    ['Dashboard', 'dashboard', LayoutDashboard],
    ['Company Profile', 'company', Building2],
    ['Job Postings', 'postings', BriefcaseBusiness],
    ['Applicants', 'applicants', Users],
    ['Notifications', 'notifications', Bell],
    ['Account Settings', 'settings', Settings],
  ],

  Admin: [
    ['Dashboard', 'dashboard', LayoutDashboard],
    ['User Management', 'users', Users],
    ['Employer Accounts', 'employers', Building2],
    ['Job Approvals', 'approvals', ShieldCheck],
    ['Applications', 'applications', ClipboardCheck],
    ['Categories & Courses', 'categories', GraduationCap],
    ['Announcements', 'announcements', Megaphone],
    ['Reports & Analytics', 'reports', ChartNoAxesCombined],
    ['System Settings', 'settings', Settings],
  ],
};

export default function Sidebar({
  role,
  page,
  onNavigate,
  onLogout,
  open,
}) {
  const roleMenus = menus[role] || menus.Student;

  return (
    <aside
      className={`sidebar ${open ? 'sidebar-open' : ''}`}
    >
      <div className="side-label">
        {role} PORTAL
      </div>

      <nav>
        {roleMenus.map(([label, key, Icon]) => (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className={`nav-item ${
              page === key ? 'active' : ''
            }`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="help-card">
          <strong>Need assistance?</strong>
          <p>
            Contact your campus career office for support.
          </p>
        </div>

        <button
          className="nav-item logout"
          onClick={onLogout}
        >
          <LogOut size={18} />
          <span>Log out</span>
        </button>

        <small className="side-version">
          CareerLink prototype · v1.0
        </small>
      </div>
    </aside>
  );
}