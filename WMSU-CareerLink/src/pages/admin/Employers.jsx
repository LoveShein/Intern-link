import { useState } from 'react';
import SearchBar from '../../components/SearchBar.jsx';
import Button from '../../components/Button.jsx';

export default function Employers({ users, onStatus }) {
  const [query, setQuery] = useState('');

  const handleReview = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5001/api/users/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, role: 'Employer' }),
      });
      if (res.ok) {
        onStatus(id, status);
      }
    } catch (err) {
      console.error('Error updating employer status:', err);
    }
  };

  const list = users.filter(
    (u) =>
      u.role === 'Employer' &&
      [u.name, u.email, u.status]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase())
  );

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Employer accounts</h1>
          <p>
            Review employer registrations and account status.
          </p>
        </div>
      </div>

      <section className="panel">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search employers..."
        />

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact email</th>
                <th>Status</th>
                <th>Review action</th>
              </tr>
            </thead>

            <tbody>
              {list.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.name}</strong>
                  </td>

                  <td>{u.email}</td>

                  <td>
                    <span
                      className={`status status-${u.status.toLowerCase()}`}
                    >
                      {u.status}
                    </span>
                  </td>

                  <td>
                    <div className="table-actions">
                      <Button
                        variant="light"
                        onClick={() => handleReview(u.id, 'Active')}
                      >
                        Approve
                      </Button>

                      <Button
                        variant="danger"
                        onClick={() => handleReview(u.id, 'Rejected')}
                      >
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!list.length && (
            <div className="empty-state">
              No employer accounts found.
            </div>
          )}
        </div>
      </section>
    </>
  );
}