import { useState, useEffect } from 'react';
import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';

export default function Announcements() {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5001/api/announcements')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch((err) => console.error('Error fetching announcements:', err));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5001/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message }),
      });
      const newItem = await res.json();
      if (res.ok) {
        setItems([newItem, ...items]);
        setTitle('');
        setMessage('');
        setIsOpen(false);
      }
    } catch (err) {
      console.error('Error creating announcement:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5001/api/announcements/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setItems(items.filter((x) => x.id !== id));
      }
    } catch (err) {
      console.error('Error deleting announcement:', err);
    }
  };

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Announcements</h1>
          <p>Create and manage system announcements.</p>
        </div>

        <Button onClick={() => setIsOpen(true)}>
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
                ANNOUNCEMENT · {item.date ? item.date.slice(0, 10) : ''}
              </span>

              <h2>{item.title}</h2>
              <p>{item.message}</p>
            </div>

            <Button
              variant="danger"
              onClick={() => handleDelete(item.id)}
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

      {isOpen && (
        <Modal
          title="New announcement"
          onClose={() => setIsOpen(false)}
        >
          <form
            className="modal-form"
            onSubmit={handleCreate}
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
                onClick={() => setIsOpen(false)}
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