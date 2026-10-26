
import { useState } from 'react';

import SearchBar from '../../components/SearchBar.jsx';

export default function Applicants({ applications, onStatus }) {
  const [query, setQuery] = useState('');

  const list = applications.filter((a) =>
    [a.student, a.jobTitle, a.company, a.status]
      .join(' ')
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Applicants</h1>
          <p>
            Review demo applications and update their statuses.
          </p>
        </div>
      </div>

      <section className="panel">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search applicant or opportunity..."
        />

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Opportunity</th>
                <th>Date</th>
                <th>Current status</th>
                <th>Update status</th>
              </tr>
            </thead>

            <tbody>
              {list.map((a) => (
                <tr key={a.id}>
                  <td>
                    <strong>{a.student}</strong>
                    <small className="table-sub">
                      Demo student
                    </small>
                  </td>

                  <td>
                    {a.jobTitle}
                    <small className="table-sub">
                      {a.company}
                    </small>
                  </td>

                  <td>{a.date}</td>

                  <td>
                    <span
                      className={`status status-${a.status
                        .toLowerCase()
                        .replaceAll(' ', '-')}`}
                    >
                      {a.status}
                    </span>
                  </td>

                  <td>
                    <select
                      value={a.status}
                      onChange={(e) =>
                        onStatus(a.id, e.target.value)
                      }
                    >
                      <option>Submitted</option>
                      <option>Under Review</option>
                      <option>Shortlisted</option>
                      <option>Accepted</option>
                      <option>Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!list.length && (
            <div className="empty-state">
              No applicants found.
            </div>
          )}
        </div>
      </section>
    </>
  );
}