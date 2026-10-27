import { useState } from 'react';
import Button from '../../components/Button.jsx';

export default function Profile({ user, onSave }) {
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    course: user.course || 'BS Computer Science',
    year: user.year || '2nd Year',
    skills: user.skills || 'HTML, CSS, JavaScript, React',
    bio: user.bio || 'Computer Science student eager to learn through hands-on internship experience.',
  });

  const [resume, setResume] = useState('No résumé selected');
  const [saved, setSaved] = useState(false);

  const change = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <PageTitle
        title="My Profile"
        subtitle="Keep your academic and contact details up to date."
      />

      <form
        className="panel form-panel"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ ...user, ...form });
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        }}
      >
        <h2>Personal information</h2>

        <div className="two-fields">
          <Field label="Full name">
            <input
              name="name"
              value={form.name}
              onChange={change}
              required
            />
          </Field>

          <Field label="Email address">
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={change}
              required
            />
          </Field>

          <Field label="Course / program">
            <input
              name="course"
              value={form.course}
              onChange={change}
            />
          </Field>

          <Field label="Year level">
            <select
              name="year"
              value={form.year}
              onChange={change}
            >
              <option>1st Year</option>
              <option>2nd Year</option>
              <option>3rd Year</option>
              <option>4th Year</option>
              <option>5th Year</option>
            </select>
          </Field>
        </div>

        <Field label="Skills (comma-separated)">
          <input
            name="skills"
            value={form.skills}
            onChange={change}
          />
        </Field>

        <Field label="Short introduction">
          <textarea
            name="bio"
            rows="4"
            value={form.bio}
            onChange={change}
          />
        </Field>

        <Field label="Résumé / CV file (demo selection only)">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) =>
              setResume(
                e.target.files?.[0]?.name ||
                  'No résumé selected'
              )
            }
          />

          <small className="muted">
            {resume}. File is not uploaded or stored.
          </small>
        </Field>

        {saved && (
          <p className="success-note">
            Profile updated successfully.
          </p>
        )}

        <Button type="submit">Save profile</Button>
      </form>
    </>
  );
}

function Field({ label, children }) {
  return (
    <label className="field-label">
      {label}
      {children}
    </label>
  );
}

function PageTitle({ title, subtitle }) {
  return (
    <div className="page-title">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}