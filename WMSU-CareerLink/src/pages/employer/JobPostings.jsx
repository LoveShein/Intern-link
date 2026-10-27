import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';

import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';
import SearchBar from '../../components/SearchBar.jsx';

const blank = {
  title: '',
  company: 'Zamboanga Digital Labs',
  location: 'Zamboanga City',
  type: 'Internship',
  course: 'Computer Science',
  slots: 1,
  deadline: '2026-12-31',
  status: 'Published',
  description: '',
  requirements: '',
};

export default function JobPostings({
  jobs,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [confirm, setConfirm] = useState(null);

  const openEdit = (job) => {
    setConfirm(null); // Ensure delete modal is closed
    setEditing(job?.id ?? 'new');
    setForm(job ? { ...job } : blank);
  };

  const openDelete = (job) => {
    setEditing(null); // Ensure edit modal is closed
    setConfirm(job);
  };

  const submit = async (e) => {
    e.preventDefault();

    if (editing === 'new') {
      try {
        const response = await fetch('http://localhost:5001/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const newJob = await response.json();
        if (response.ok) {
          onAdd(newJob);
        }
      } catch (err) {
        console.error('Error creating job:', err);
      }
    } else {
      try {
        const response = await fetch(`http://localhost:5001/api/jobs/${editing}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const updatedJob = await response.json();
        if (response.ok) {
          onUpdate(updatedJob);
        }
      } catch (err) {
        console.error('Error updating job:', err);
      }
    }

    setEditing(null);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5001/api/jobs/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        onDelete(id);
      }
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  };

  const filtered = jobs.filter((j) =>
    [j.title, j.company, j.status]
      .join(' ')
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Job postings</h1>
          <p>Create and manage internship opportunities.</p>
        </div>

        <Button onClick={() => openEdit(null)}>
          <Plus size={17} />
          Add posting
        </Button>
      </div>

      <section className="panel">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search job postings..."
        />

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Opportunity</th>
                <th>Type</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((j) => (
                <tr key={j.id}>
                  <td>
                    <strong>{j.title}</strong>
                    <small className="table-sub">{j.company}</small>
                  </td>

                  <td>{j.type}</td>
                  <td>{j.deadline}</td>

                  <td>
                    <span className={`status status-${j.status.toLowerCase()}`}>
                      {j.status}
                    </span>
                  </td>

                  <td>
                    <div className="table-actions">
                      <button
                        className="icon-btn"
                        title="Edit"
                        onClick={() => openEdit(j)}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="icon-btn danger"
                        title="Delete"
                        onClick={() => openDelete(j)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!filtered.length && (
            <div className="empty-state">No postings match your search.</div>
          )}
        </div>
      </section>

      {/* Edit / Create Modal (Only rendered when editing is not null) */}
      {editing !== null && (
        <Modal
          title={editing === 'new' ? 'Create posting' : 'Edit posting'}
          onClose={() => setEditing(null)}
        >
          <form className="modal-form" onSubmit={submit}>
            <label className="field-label">
              Job title
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </label>

            <div className="two-fields">
              <label className="field-label">
                Location
                <input
                  required
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </label>

              <label className="field-label">
                Course
                <select
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                >
                  <option>Computer Science</option>
                  <option>Information Technology</option>
                  <option>Information Systems</option>
                  <option>Any related course</option>
                </select>
              </label>
            </div>

            <div className="two-fields">
              <label className="field-label">
                Type
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option>Internship</option>
                  <option>OJT</option>
                </select>
              </label>

              <label className="field-label">
                Deadline
                <input
                  type="date"
                  required
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                />
              </label>
            </div>

            <label className="field-label">
              Description
              <textarea
                required
                rows="3"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>

            <label className="field-label">
              Requirements
              <textarea
                rows="2"
                value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
              />
            </label>

            <div className="modal-actions">
              <Button type="button" variant="light" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit">Save posting</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal (Only rendered when confirm is not null) */}
      {confirm !== null && (
        <Modal title="Delete posting?" onClose={() => setConfirm(null)}>
          <div className="modal-form">
            <p>
              Remove <strong>{confirm?.title}</strong> from this list?
            </p>

            <div className="modal-actions">
              <Button variant="light" onClick={() => setConfirm(null)}>
                Cancel
              </Button>

              <Button
                variant="danger"
                onClick={() => {
                  handleDelete(confirm.id);
                  setConfirm(null);
                }}
              >
                Delete posting
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}