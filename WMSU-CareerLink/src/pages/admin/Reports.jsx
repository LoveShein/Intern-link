
import Button from '../../components/Button.jsx';

export default function Reports({ users, jobs, applications }) {
  function exportCsv() {
    const rows = [
      ['Report', 'Value'],
      ['Total users', users.length],
      [
        'Students',
        users.filter((user) => user.role === 'Student').length,
      ],
      [
        'Employers',
        users.filter((user) => user.role === 'Employer').length,
      ],
      ['Job postings', jobs.length],
      [
        'Published postings',
        jobs.filter((job) => job.status === 'Published').length,
      ],
      ['Applications', applications.length],
      ...applications.map((application) => [
        `Application ${application.id}`,
        `${application.student} - ${application.jobTitle} - ${application.status}`,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value).replaceAll('"', '""')}"`
          )
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'careerlink-demo-report.csv';

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  const totalUsers = users.length;

  const totalStudents = users.filter(
    (user) => user.role === 'Student'
  ).length;

  const totalEmployers = users.filter(
    (user) => user.role === 'Employer'
  ).length;

  const publishedJobs = jobs.filter(
    (job) => job.status === 'Published'
  ).length;

  const pendingJobs = jobs.filter(
    (job) => job.status === 'Pending'
  ).length;

  const statuses = [
    'Submitted',
    'Under Review',
    'Shortlisted',
    'Accepted',
    'Rejected',
  ];

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Reports &amp; Analytics</h1>
          <p>
            High-level metrics based on local demo data.
          </p>
        </div>

        <Button onClick={exportCsv}>
          Export CSV Report
        </Button>
      </div>

      <div className="stats-grid">
        <Metric
          label="Total Users"
          value={totalUsers}
          detail="Student and employer demo accounts"
        />

        <Metric
          label="Published Opportunities"
          value={publishedJobs}
          detail="Visible to student portal"
        />

        <Metric
          label="Applications"
          value={applications.length}
          detail="Sample application records"
        />

        <Metric
          label="Awaiting Moderation"
          value={pendingJobs}
          detail="Posting approval queue"
        />
      </div>

      <section className="panel">
        <h2>Application Status Summary</h2>

        {statuses.map((status) => {
          const count = applications.filter(
            (application) => application.status === status
          ).length;

          const percentage =
            applications.length > 0
              ? (count / applications.length) * 100
              : 0;

          return (
            <div className="report-bar-row" key={status}>
              <span>{status}</span>

              <div className="report-bar">
                <i
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>

              <strong>{count}</strong>
            </div>
          );
        })}

        <p className="muted">
          These charts and exports reflect sample data
          in this browser only.
        </p>
      </section>
    </>
  );
}

function Metric({ label, value, detail }) {
  return (
    <div className="stat-card metric-card">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}