import { FileCheck2 } from 'lucide-react';

export default function Applications({ applications, user }) {
  const mine = applications.filter(
    (a) => a.student === user.name
  );

  return (
    <>
      <div className="page-title">
        <div>
          <h1>My Applications</h1>
          <p>Track the status of your submitted internship and OJT applications.</p>
        </div>

        <span className="count-pill">
          {mine.length} applications
        </span>
      </div>

      <section className="panel">
        <div className="table-wrap">
          {mine.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Opportunity</th>
                  <th>Company</th>
                  <th>Date Submitted</th>
                  <th>Status</th>
                  <th>Note</th>
                </tr>
              </thead>

              <tbody>
                {mine.map((application) => (
                  <tr key={application.id}>
                    <td>
                      <strong>{application.jobTitle}</strong>
                    </td>
                    <td>{application.company}</td>
                    <td>{application.date}</td>
                    <td>
                      <span
                        className={`status status-${application.status
                          .toLowerCase()
                          .replaceAll(' ', '-')}`}
                      >
                        {application.status}
                      </span>
                    </td>
                    <td>{application.note || 'None'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              No applications submitted yet. Browse internships and OJT opportunities to get started.
            </div>
          )}
        </div>
      </section>
    </>
  );
}