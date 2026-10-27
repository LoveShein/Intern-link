import { useState } from 'react';
import Button from '../../components/Button.jsx';

export default function Register({ onBack, onRegister }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState('Student');
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
        role,
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

        <h2>Create an account</h2>

        <p className="muted">
          Register for your WMSU CareerLink portal account.
        </p>

        <label className="field-label">
          I am registering as a:
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '5px' }}>
            {['Student', 'Employer'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: role === r ? '1px solid var(--red)' : '1px solid #dfe2e9',
                  background: role === r ? 'var(--red-soft)' : 'white',
                  color: role === r ? 'var(--red)' : '#626a78',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {r === 'Employer' ? 'Company / Employer' : 'Student'}
              </button>
            ))}
          </div>
        </label>

        <label className="field-label">
          {role === 'Employer' ? 'Company Name / Representative' : 'Full name'}
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={role === 'Employer' ? 'Tech Solutions Inc.' : 'John Doe'}
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
          {loading ? 'Creating account...' : `Create ${role.toLowerCase()} account`}
        </Button>
      </form>
    </main>
  );
}