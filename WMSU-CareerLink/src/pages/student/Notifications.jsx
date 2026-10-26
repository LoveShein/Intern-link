
import { useState } from 'react';

import Button from '../../components/Button.jsx';

export default function Notifications({ items, onRead }) {
  const [filter, setFilter] = useState('All');

  const list = items.filter(
    (n) =>
      filter === 'All' ||
      (filter === 'Unread' && !n.read) ||
      (filter === 'Read' && n.read)
  );

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Notifications</h1>
          <p>
            Announcements and updates related to your account.
          </p>
        </div>

        <Button
          variant="light"
          onClick={() => onRead('all')}
        >
          Mark all as read
        </Button>
      </div>

      <div className="filter-tabs">
        {['All', 'Unread', 'Read'].map((x) => (
          <button
            className={filter === x ? 'selected' : ''}
            key={x}
            onClick={() => setFilter(x)}
          >
            {x}
          </button>
        ))}
      </div>

      <section className="panel">
        {list.map((n) => (
          <div
            className={`notification-row ${
              n.read ? 'read' : ''
            }`}
            key={n.id}
          >
            <span className="notif-bullet" />

            <div className="notification-copy">
              <strong>{n.title}</strong>
              <p>{n.message}</p>
              <small>{n.date}</small>
            </div>

            {!n.read && (
              <Button
                variant="light"
                onClick={() => onRead(n.id)}
              >
                Mark read
              </Button>
            )}
          </div>
        ))}

        {!list.length && (
          <div className="empty-state">
            No notifications in this view.
          </div>
        )}
      </section>
    </>
  );
}