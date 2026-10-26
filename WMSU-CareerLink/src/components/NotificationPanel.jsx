
import { CheckCheck } from 'lucide-react';

export default function NotificationPanel({
  items,
  onRead,
  onClose,
}) {
  return (
    <div className="notification-panel">
      <div className="panel-heading">
        <div>
          <h3>Notifications</h3>
          <p>Updates for this demo account</p>
        </div>

        <button
          className="text-btn"
          onClick={onRead}
        >
          <CheckCheck size={15} />
          Mark all read
        </button>
      </div>

      {items.length ? (
        items.map((n) => (
          <button
            key={n.id}
            className={`notification-item ${n.read ? 'read' : ''}`}
            onClick={() => onRead(n.id)}
          >
            <span className="notif-bullet" />

            <span>
              <strong>{n.title}</strong>
              <small>{n.message}</small>
              <em>{n.date}</em>
            </span>
          </button>
        ))
      ) : (
        <p className="empty-state">
          You're all caught up.
        </p>
      )}

      <button
        className="btn btn-light full-width"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
}