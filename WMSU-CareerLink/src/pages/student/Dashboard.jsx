
import {
  ArrowRight,
  Bookmark,
  BriefcaseBusiness,
  FileCheck2,
  Clock3,
  Search,
} from 'lucide-react';

export default function Dashboard({
  user,
  jobs,
  applications,
  saved,
  onNavigate,
  onApply,
  onSave,
}) {
  const mine = applications.filter(
    (a) => a.student === user.name
  );

  return (
    <>
      <div className="welcome-row">
        <div>
          <span className="eyebrow red">
            STUDENT OVERVIEW
          </span>

          <h1>
            Good day, {user.name.split(' ')[0]} 
          </h1>

          <p className="muted">
            Here’s what’s happening with your career journey.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => onNavigate('internships')}
        >
          <Search size={17} />
          Find opportunities
        </button>
      </div>

      <div className="stats-grid">
        <Stat
          icon={BriefcaseBusiness}
          label="Available opportunities"
          value={
            jobs.filter((j) => j.status === 'Published').length
          }
          tint="red"
        />

        <Stat
          icon={FileCheck2}
          label="Applications submitted"
          value={mine.length}
          tint="blue"
        />

        <Stat
          icon={Clock3}
          label="Under review"
          value={
            mine.filter(
              (a) => a.status === 'Under Review'
            ).length
          }
          tint="amber"
        />

        <Stat
          icon={Bookmark}
          label="Saved opportunities"
          value={saved.length}
          tint="green"
        />
      </div>

      <div className="content-grid">
        <section className="panel">
          <div className="section-heading">
            <div>
              <h2>Recommended for you</h2>
              <p>Opportunities to explore</p>
            </div>

            <button
              className="text-btn"
              onClick={() => onNavigate('internships')}
            >
              View all
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="mini-job-list">
            {jobs
              .filter((j) => j.status === 'Published')
              .slice(0, 3)
              .map((job) => (
                <div className="mini-job" key={job.id}>
                  <div className="company-avatar">
                    {job.company.slice(0, 1)}
                  </div>

                  <div className="mini-job-info">
                    <strong>{job.title}</strong>
                    <span>
                      {job.company} · {job.location}
                    </span>
                    <small>
                      {job.type} · {job.course}
                    </small>
                  </div>

                  <button
                    className="btn btn-light btn-small"
                    onClick={() => onApply(job)}
                  >
                    Details
                  </button>

                  <button
                    className={`icon-btn ${
                      saved.includes(job.id) ? 'saved' : ''
                    }`}
                    aria-label="Save opportunity"
                    onClick={() => onSave(job.id)}
                  >
                    <Bookmark size={18} />
                  </button>
                </div>
              ))}
          </div>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <h2>Application History</h2>
              <p>Your latest submissions</p>
            </div>

            <button
              className="text-btn"
              onClick={() => onNavigate('Applications')}
            >
              See all
              <ArrowRight size={15} />
            </button>
          </div>

          {mine.length ? (
            mine.slice(0, 4).map((a) => (
              <div className="activity-row" key={a.id}>
                <span className="activity-icon">
                  <FileCheck2 size={17} />
                </span>

                <div>
                  <strong>{a.jobTitle}</strong>
                  <small>
                    {a.company} · {a.date}
                  </small>
                </div>

                <Status value={a.status} />
              </div>
            ))
          ) : (
            <div className="empty-state">
              No applications yet. Browse internships to get
              started.
            </div>
          )}
        </section>
      </div>

      <section className="career-banner">
        <div>
          <span className="eyebrow">YOUR NEXT STEP</span>

          <h2>
            A stronger profile helps you stand out.
          </h2>

          <p>
            Add your skills, education, and résumé details to
            prepare for opportunities.
          </p>
        </div>

        <button
          className="btn btn-white"
          onClick={() => onNavigate('profile')}
        >
          Complete profile
          <ArrowRight size={16} />
        </button>
      </section>
    </>
  );
}

function Stat({ icon: Icon, label, value, tint }) {
  return (
    <div className="stat-card">
      <span className={`stat-icon ${tint}`}>
        <Icon size={20} />
      </span>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function Status({ value }) {
  return (
    <span
      className={`status status-${value
        .toLowerCase()
        .replaceAll(' ', '-')}`}
    >
      {value}
    </span>
  );
}