import { useState, useEffect } from 'react';
import Button from '../../components/Button.jsx';

export default function CompanyProfile({ user }) {
  const [company, setCompany] = useState({
    name: user?.name || 'Zamboanga Digital Labs',
    email: user?.email || 'hr@zdl.example.com',
    website: 'https://example.com',
    location: 'Zamboanga City',
    about: 'A fictional local technology partner helping students gain practical experience.',
  });

  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDone(false);

    try {
      const response = await fetch(`http://localhost:5001/api/employers/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update profile.');

      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Company profile</h1>
          <p>Present your organization to potential applicants.</p>
        </div>
      </div>

      <form className="panel form-panel" onSubmit={handleSubmit}>
        <div className="company-profile-banner">
          <div className="company-avatar xl">
            {company.name ? company.name[0] : 'E'}
          </div>

          <div>
            <h2>{company.name}</h2>
            <p>Employer account · Live database profile</p>
          </div>
        </div>

        {Object.entries({
          name: 'Company name',
          email: 'Contact email',
          website: 'Website',
          location: 'Location',
        }).map(([key, label]) => (
          <label className="field-label" key={key}>
            {label}
            <input
              required
              value={company[key] || ''}
              type={key === 'email' ? 'email' : 'text'}
              onChange={(e) =>
                setCompany({
                  ...company,
                  [key]: e.target.value,
                })
              }
            />
          </label>
        ))}

        <label className="field-label">
          About the company
          <textarea
            rows="4"
            value={company.about || ''}
            onChange={(e) =>
              setCompany({
                ...company,
                about: e.target.value,
              })
            }
          />
        </label>

        {done && <p className="success-note">Company profile successfully updated in database.</p>}
        {error && <p className="form-error">{error}</p>}

        <Button type="submit">Save company profile</Button>
      </form>
    </>
  );
}