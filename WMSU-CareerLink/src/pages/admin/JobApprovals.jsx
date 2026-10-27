import Button from '../../components/Button.jsx';

export default function JobApprovals({ jobs, onUpdate }) {
  const handleJobStatus = async (j, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5001/api/jobs/${j.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...j, status: newStatus }),
      });
      const updated = await res.json();
      if (res.ok) {
        onUpdate(updated);
      }
    } catch (err) {
      console.error('Error updating job approval:', err);
    }
  };

  const pending = jobs.filter(
    (j) => j.status === 'Pending'
  );

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Job approvals</h1>
          <p>
            Moderate submitted internship opportunities.
          </p>
        </div>
      </div>

      <section className="panel">
        {pending.map((j) => (
          <article
            className="approval-card"
            key={j.id}
          >
            <div>
              <span className="status status-pending">
                Pending review
              </span>

              <h2>{j.title}</h2>

              <p className="muted">
                {j.company} · {j.location} · {j.course}
              </p>

              <p>{j.description}</p>

              <small>
                Deadline: {j.deadline}
              </small>
            </div>

            <div className="approval-actions">
              <Button
                onClick={() => handleJobStatus(j, 'Published')}
              >
                Approve
              </Button>

              <Button
                variant="danger"
                onClick={() => handleJobStatus(j, 'Rejected')}
              >
                Reject
              </Button>
            </div>
          </article>
        ))}

        {!pending.length && (
          <div className="empty-state">
            No postings need review right now.
          </div>
        )}
      </section>

      <section className="panel section-gap">
        <h2>All postings</h2>

        {jobs.map((j) => (
          <div
            className="activity-row"
            key={j.id}
          >
            <div className="company-avatar">
              {j.company[0]}
            </div>

            <div>
              <strong>{j.title}</strong>
              <small>{j.company}</small>
            </div>

            <span
              className={`status status-${j.status.toLowerCase()}`}
            >
              {j.status}
            </span>
          </div>
        ))}
      </section>
    </>
  );
}