
import { useState } from 'react';

import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';

export default function Announcements() {
  const [items, setItems] = useState([
    {
      id: 1,
      title: 'Internship application season is open',
      message:
        'Students can browse current opportunities and prepare their profiles.',
      date: '2026-10-01',
    },
    {
      id: 2,
      title: 'Employer orientation',
      message:
        'Partner employers are encouraged to review their posting details.',
      date: '2026-10-05',
    },
  ]);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Announcements</h1>
          <p>Create and manage demo announcements.</p>
        </div>

        <Button onClick={() => setOpen(true)}>
          + New announcement
        </Button>
      </div>

      <section className="panel">
        {items.map((item) => (
          <article
            className="announcement-card"
            key={item.id}
          >
            <div>
              <span className="eyebrow red">
                ANNOUNCEMENT · {item.date}
              </span>

              <h2>{item.title}</h2>
              <p>{item.message}</p>
            </div>

            <Button
              variant="danger"
              onClick={() =>
                setItems(
                  items.filter((x) => x.id !== item.id)
                )
              }
            >
              Delete
            </Button>
          </article>
        ))}

        {!items.length && (
          <div className="empty-state">
            No announcements. Create one to get started.
          </div>
        )}
      </section>

      {open && (
  <Modal
    title="New announcement"
    onClose={() => setOpen(false)}
  >
        <form
          className="modal-form"
          onSubmit={(e) => {
            e.preventDefault();

            setItems([
              {
                id: Date.now(),
                title,
                message,
                date: new Date()
                  .toISOString()
                  .slice(0, 10),
              },
              ...items,
            ]);

            setTitle('');
            setMessage('');
            setOpen(false);
          }}
        >
          <label className="field-label">
            Title
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label className="field-label">
            Message
            <textarea
              required
              rows="4"
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
            />
          </label>

          <div className="modal-actions">
            <Button
              variant="light"
              type="button"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button type="submit">
              Publish announcement
            </Button>
          </div>
        </form>
        </Modal>
)}
    </>
  );
}