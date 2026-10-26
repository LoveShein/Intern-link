
import {
  BriefcaseBusiness,
  Users,
  Eye,
  Clock3,
} from 'lucide-react';

export default function Dashboard({
  jobs,
  applications,
  onNavigate,
}) {
  const published = jobs.filter(
    (j) => j.status === 'Published'
  );

  return (
    <>
      <div className="page-title">
        <div>
          <span className="eyebrow red">
            EMPLOYER OVERVIEW
          </span>

          <h1>Employer dashboard</h1>

          <p>
            Manage opportunities and find promising student talent.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => onNavigate('postings')}
        >
          + Create posting
        </button>
      </div>

      <div className="stats-grid">
        <Stat
          icon={BriefcaseBusiness}
          label="Total postings"
          value={jobs.length}
        />

        <Stat
          icon={Eye}
          label="Published"
          value={published.length}
        />

        <Stat
          icon={Users}
          label="Applications received"
          value={applications.length}
        />

        <Stat
          icon={Clock3}
          label="Pending review"
          value={
            jobs.filter((j) => j.status === 'Pending').length
          }
        />
      </div>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Recent job postings</h2>
            <p>Overview of your sample listings</p>
          </div>

          <button
            className="text-btn"
            onClick={() => onNavigate('postings')}
          >
            Manage postings →
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Position</th>
                <th>Location</th>
                <th>Deadline</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {jobs.map((j) => (
                <tr key={j.id}>
                  <td>
                    <strong>{j.title}</strong>
                    <small className="table-sub">
                      {j.company}
                    </small>
                  </td>

                  <td>{j.location}</td>
                  <td>{j.deadline}</td>

                  <td>
                    <span
                      className={`status status-${j.status.toLowerCase()}`}
                    >
                      {j.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
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