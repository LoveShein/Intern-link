
import { useState } from 'react';

import SearchBar from '../../components/SearchBar.jsx';
import Button from '../../components/Button.jsx';

export default function UsersPage({ users, onStatus }) {
  const [query, setQuery] = useState('');

  const list = users.filter((u) =>
    [u.name, u.email, u.role, u.status]
      .join(' ')
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <>
      <div className="page-title">
        <div>
          <h1>User management</h1>
          <p>
            View and activate or deactivate demo accounts.
          </p>
        </div>
      </div>

      <section className="panel">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search users..."
        />

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {list.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.name}</strong>
                  </td>

                  <td>{u.email}</td>
                  <td>{u.role}</td>

                  <td>
                    <span
                      className={`status status-${u.status.toLowerCase()}`}
                    >
                      {u.status}
                    </span>
                  </td>

                  <td>
                    <Button
                      variant="light"
                      onClick={() =>
                        onStatus(
                          u.id,
                          u.status === 'Active'
                            ? 'Inactive'
                            : 'Active'
                        )
                      }
                    >
                      {u.status === 'Active'
                        ? 'Deactivate'
                        : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!list.length && (
            <div className="empty-state">
              No users found.
            </div>
          )}
        </div>
      </section>
    </>
  );
}