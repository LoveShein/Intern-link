
import { useState } from 'react';

import Button from '../../components/Button.jsx';

export default function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <main className="auth-simple">
      <form
        className="auth-card"
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
      >
        <button
          type="button"
          className="text-btn"
          onClick={onBack}
        >
          ← Back to sign in
        </button>

        <span className="eyebrow red">
          ACCOUNT HELP
        </span>

        <h2>Forgot your password?</h2>

        <p className="muted">
          Enter your email to simulate a password-reset request.
        </p>

        <label className="field-label">
          Email address
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        {sent && (
          <div className="success-note">
            Demo request recorded for {email}. Real email delivery requires a backend.
          </div>
        )}

        <Button
          className="full-width"
          type="submit"
        >
          Send reset instructions
        </Button>
      </form>
    </main>
  );
}