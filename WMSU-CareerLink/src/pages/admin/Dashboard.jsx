
import {
  Users,
  BriefcaseBusiness,
  FileCheck2,
  Building2,
} from 'lucide-react';

export default function Dashboard({
  users,
  jobs,
  applications,
  onNavigate,
}) {
  return (
    <>
      <div className="page-title">
        <div>
          <span className="eyebrow red">ADMINISTRATION</span>
          <h1>System overview</h1>
          <p>
            Monitor accounts, opportunities, and application activity.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <Stat
          icon={Users}
          label="Total users"
          value={users.length}
        />

        <Stat
          icon={Building2}
          label="Employers"
          value={
            users.filter((u) => u.role === 'Employer').length
          }
        />

        <Stat
          icon={BriefcaseBusiness}
          label="Job postings"
          value={jobs.length}
        />

        <Stat
          icon={FileCheck2}
          label="Applications"
          value={applications.length}
        />
      </div>

      <div className="content-grid">
        <section className="panel">
          <div className="section-heading">
            <div>
              <h2>Pending employer accounts</h2>
              <p>Accounts waiting for review</p>
            </div>

            <button
              className="text-btn"
              onClick={() => onNavigate('employers')}
            >
              Review →
            </button>
          </div>

          {users
            .filter(
              (u) =>
                u.role === 'Employer' &&
                u.status === 'Pending'
            )
            .map((u) => (
              <div
                className="activity-row"
                key={u.id}
              >
                <span className="company-avatar">
                  {u.name[0]}
                </span>

                <div>
                  <strong>{u.name}</strong>
                  <small>{u.email}</small>
                </div>

                <span className="status status-pending">
                  Pending
                </span>
              </div>
            ))}

          {!users.some(
            (u) =>
              u.role === 'Employer' &&
              u.status === 'Pending'
          ) && (
            <div className="empty-state">
              No employer accounts awaiting review.
            </div>
          )}
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <h2>Posting moderation</h2>
              <p>Opportunities that need approval</p>
            </div>

            <button
              className="text-btn"
              onClick={() => onNavigate('approvals')}
            >
              Review →
            </button>
          </div>

          {jobs
            .filter((j) => j.status === 'Pending')
            .map((j) => (
              <div
                className="activity-row"
                key={j.id}
              >
                <span className="company-avatar">
                  {j.company[0]}
                </span>

                <div>
                  <strong>{j.title}</strong>
                  <small>{j.company}</small>
                </div>

                <span className="status status-pending">
                  Pending
                </span>
              </div>
            ))}

          {!jobs.some((j) => j.status === 'Pending') && (
            <div className="empty-state">
              No postings waiting for approval.
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="stat-card">
      <span className="stat-icon red">
        <Icon size={20} />
      </span>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}