import { useState } from 'react';
import Button from '../../components/Button.jsx';

export default function Register({ onBack, onRegister }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 4) {
      setError('Use at least 4 characters for your password.');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await onRegister({
        name,
        email,
        password,
        role: 'Student',
      });
    } catch (err) {
      setError(err.message || 'Account creation failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-simple">
      <form className="auth-card wide" onSubmit={submit}>
        <button
          type="button"
          className="text-btn"
          onClick={onBack}
        >
          ← Back to sign in
        </button>

        <span className="eyebrow red">JOIN CAREERLINK</span>

        <h2>Create student account</h2>

        <p className="muted">
          Register for your WMSU CareerLink student portal.
        </p>

        <label className="field-label">
          Full name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
          />
        </label>

        <label className="field-label">
          Email address
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>

        <div className="two-fields">
          <label className="field-label">
            Password
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 4 chars"
            />
          </label>

          <label className="field-label">
            Confirm password
            <input
              required
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm password"
            />
          </label>
        </div>

        {error && (
          <p className="form-error">{error}</p>
        )}

        <Button
          type="submit"
          className="full-width"
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
    </main>
  );
}