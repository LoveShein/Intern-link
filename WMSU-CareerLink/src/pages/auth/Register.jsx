import { useState } from 'react';
import Button from '../../components/Button.jsx';

export default function Register({ onBack, onRegister }) {
  const [role, setRole] = useState('Student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();

    if (password.length < 4) {
      setError('Use at least 4 characters for your password.');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Registration failed.');
        setLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem('careerlink.token', data.token);
      }

      onRegister(data.user);
    } catch (err) {
      setError('Server connection failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-simple">
      <form
        className="auth-card wide"
        onSubmit={submit}
      >
        <button
          type="button"
          className="text-btn"
          onClick={onBack}
        >
          ← Back to sign in
        </button>

        <span className="eyebrow red">
          JOIN CAREERLINK
        </span>

        <h2>Create your account</h2>

        <p className="muted">
          Register to access student internships and employer features.
        </p>

        <label className="field-label">
          I am registering as
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option>Student</option>
            <option>Employer</option>
          </select>
        </label>

        <label className="field-label">
          Full name / company name
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

        <div className="two-fields">
          <label className="field-label">
            Password
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <label className="field-label">
            Confirm password
            <input
              required
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </label>
        </div>

        {error && (
          <p className="form-error">
            {error}
          </p>
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