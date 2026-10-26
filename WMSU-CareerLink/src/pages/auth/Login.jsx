
import { useState } from 'react';

import {
  ArrowRight,
  BriefcaseBusiness,
  Eye,
  EyeOff,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';

export default function Login({
  onLogin,
  onRegister,
  onForgot,
}) {
  const [role, setRole] = useState('Student');
  const [email, setEmail] = useState('student@wmsu.edu.ph');
  const [password, setPassword] = useState('demo123');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  function submit(e) {
    e.preventDefault();

    if (!email.includes('@') || password.length < 4) {
      setError(
        'Enter a valid email and a password with at least 4 characters.'
      );
      return;
    }

    setError('');

    onLogin({
      name:
        role === 'Student'
          ? 'Amina Santos'
          : role === 'Employer'
            ? 'Career Office Partner'
            : 'System Administrator',
      email,
      role,
    });
  }

  return (
    <main className="wmsu-login-page">
      <div className="wmsu-bg-circle wmsu-bg-circle-one" />
      <div className="wmsu-bg-circle wmsu-bg-circle-two" />

      <header className="wmsu-login-header">
        <div className="wmsu-header-brand">
          <img
            src="WMSU-CareerLink/public/wmsu-logo.png"
            alt="WMSU logo"
            className="wmsu-logo"/>

          <div>
            <strong>WMSU CareerLink</strong>
            <span>CAREER AND INTERNSHIP PORTAL</span>
          </div>
        </div>

        <div className="wmsu-header-label">
          <GraduationCap size={18} />
          <span>WESTERN MINDANAO STATE UNIVERSITY</span>
        </div>
      </header>

      <section className="wmsu-login-main">
        <div className="wmsu-welcome">
          <span className="wmsu-welcome-badge">
            YOUR CAREER JOURNEY BEGINS HERE
          </span>

          <h1>
            Your future
            <br />
            deserves an
            <br />
            <span>opportunity.</span>
          </h1>

          <p>
            Connect your education to real-world experience.
            Explore internships, discover opportunities, and
            take your next step with WMSU CareerLink.
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
              <BriefcaseBusiness size={24} />
            </div>

            <span className="wmsu-card-eyebrow">
              WELCOME TO CAREERLINK
            </span>

            <h2>Sign in to your account</h2>

            <p>
              Enter your details to access your portal.
            </p>
          </div>

          <form
            className="wmsu-login-form"
            onSubmit={submit}
          >
            <label className="wmsu-field">
              Portal role

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="wmsu-input"
              >
                <option>Student</option>
                <option>Employer</option>
                <option>Admin</option>
              </select>
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
            >
              Sign in
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="wmsu-register-line">
            <span>New to CareerLink?</span>

            <button
              type="button"
              onClick={onRegister}
            >
              Create an account
            </button>
          </div>

          <div className="wmsu-demo-notice">
            <ShieldCheck size={18} />

            <p>
              <strong>Prototype notice</strong>
              <br />
              This demo simulates sign-in and does not verify
              real accounts.
            </p>
          </div>
        </div>
      </section>

      <footer className="wmsu-login-footer">
        <span>WMSU CAREERLINK</span>
        <span>Connecting students to opportunities.</span>
      </footer>
    </main>
  );
}