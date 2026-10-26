import { useState } from 'react';
import Button from '../../components/Button.jsx';

export default function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to submit reset request.');
      } else {
        setSent(true);
      }
    } catch (err) {
      setError('Connection to server failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-simple">
      <form
        className="auth-card"
        onSubmit={handleSubmit}
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
          Enter your email to receive password-reset instructions.
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

        {error && (
          <p className="form-error">
            {error}
          </p>
        )}

        {sent && (
          <div className="success-note">
            If an account exists for {email}, reset instructions have been dispatched.
          </div>
        )}

        <Button
          className="full-width"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Sending instructions...' : 'Send reset instructions'}
        </Button>
      </form>
    </main>
  );
}