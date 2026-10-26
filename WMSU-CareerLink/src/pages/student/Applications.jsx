import { useState } from 'react';

import Button from '../../components/Button.jsx';

export default function Settings({ user, onSave, onLogout }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [compact, setCompact] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Account settings</h1>
          <p>Manage your demo account preferences.</p>
        </div>
      </div>

      <section className="panel form-panel">
        <h2>Account details</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave({ ...user, name, email });
            setSaved(true);
          }}
        >
          <label className="field-label">
            Display name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="field-label">
            Email address
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="check-label setting-check">
            <input
              type="checkbox"
              checked={compact}
              onChange={(e) => setCompact(e.target.checked)}
            />
            Use compact table density (demo preference)
          </label>

          {saved && (
            <p className="success-note">
              Settings saved for this demo session.
            </p>
          )}

          <Button type="submit">
            Save settings
          </Button>
        </form>

        <hr />

        <h2>Session</h2>

        <p className="muted">
          Signing out returns to the login screen. This is a
          simulated local session.
        </p>

        <Button
          variant="danger"
          onClick={onLogout}
        >
          Log out
        </Button>
      </section>
    </>
  );
}