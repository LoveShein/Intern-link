import { useState } from 'react';
import logo from '../../assets/logo-wmsu.png';
import {
  ArrowRight,
  BriefcaseBusiness,
  Eye,
  EyeOff,
  GraduationCap,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export default function Login({
  onLogin,
  onRegister,
  onForgot,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();

    if (!email.includes('@') || password.length < 4) {
      setError('Enter a valid email and a password with at least 4 characters.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await onLogin({
        email,
        password,
        role,
      });
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="wmsu-login-page">
      <div className="wmsu-bg-circle wmsu-bg-circle-one" />
      <div className="wmsu-bg-circle wmsu-bg-circle-two" />

      <header className="wmsu-login-header">
        <div className="wmsu-header-brand">
          <img
            src={logo}
            alt="WMSU logo"
            className="wmsu-logo"
          />

          <div>
            <strong>WMSU CareerLink</strong>
            <span>PORTAL LOGIN</span>
          </div>
        </div>

        <div className="wmsu-header-label">
          <GraduationCap size={18} />
          <span>WESTERN MINDANAO STATE UNIVERSITY</span>
        </div>
      </header>

      <section className="wmsu-login-main">
        <div className="wmsu-welcome">
          <h1>
            One Click
            <br />
            One 
            <span> Opportunity.</span>
          </h1>

          <p>
            Explore internships, discover opportunities,
            <br />
             and take your next step with
             <br />
              WMSU CareerLink.
          </p>

          <div className="wmsu-welcome-points">
            <div>
              <span className="wmsu-point-icon">
                <BriefcaseBusiness size={19} />
              </span>
              <span>Explore internship opportunities</span>
            </div>

            <div>
              <span className="wmsu-point-icon">
                <GraduationCap size={20} />
              </span>
              <span>Prepare for your professional future</span>
            </div>

            <div>
              <span className="wmsu-point-icon">
                <ShieldCheck size={19} />
              </span>
              <span>One portal for your career journey</span>
            </div>
          </div>
        </div>

        <div className="wmsu-login-card">
          <div className="wmsu-card-heading">
            <div className="wmsu-card-icon">
              {role === 'Admin' ? (
                <ShieldCheck size={24} />
              ) : role === 'Employer' ? (
                <Building2 size={24} />
              ) : (
                <GraduationCap size={24} />
              )}
            </div>

            <span className="wmsu-card-eyebrow">
              {role.toUpperCase()} PORTAL
            </span>

            <h2>Sign in to your account</h2>

            <p>
              Select your role and enter your credentials.
            </p>
          </div>

          <form
            className="wmsu-login-form"
            onSubmit={submit}
          >
            {/* Role Selection Tabs */}
            <label className="wmsu-field">
              Portal Access Role
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {['Student', 'Employer', 'Admin'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRole(r);
                      if (r === 'Admin') {
                        setEmail('admin123@wmsu.edu.ph');
                        setPassword('admin123');
                      } else {
                        setEmail('');
                        setPassword('');
                      }
                    }}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '7px',
                      border: role === r ? '1px solid #ae2c41' : '1px solid #e0e5ed',
                      background: role === r ? '#f9e9ed' : '#f9fafc',
                      color: role === r ? '#ae2c41' : '#656d7b',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </label>

            <label className="wmsu-field">
              Email address

              <input
                className="wmsu-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>

            <label className="wmsu-field">
              <span className="wmsu-password-label">
                Password

                <button
                  type="button"
                  className="wmsu-forgot"
                  onClick={onForgot}
                >
                  Forgot password?
                </button>
              </span>

              <span className="wmsu-password-wrap">
                <input
                  className="wmsu-input"
                  type={show ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  className="wmsu-eye-button"
                  onClick={() => setShow(!show)}
                  aria-label={
                    show ? 'Hide password' : 'Show password'
                  }
                >
                  {show ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </span>
            </label>

            {error && (
              <p className="wmsu-login-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="wmsu-login-submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : `Sign in as ${role}`}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="wmsu-register-line">
            <span>New to CareerLink?</span>

            <button
              type="button"
              onClick={onRegister}
            >
              Create student account
            </button>
          </div>

        </div>
      </section>

      <footer className="wmsu-login-footer">
        <span>WMSU CAREERLINK</span>
        <span> © 2026 CareerLink Job & Internship Portal</span>
      </footer>
    </main>
  );
}