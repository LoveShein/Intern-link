
import { useState } from 'react';

import Button from '../../components/Button.jsx';

export default function CompanyProfile() {
  const [company, setCompany] = useState({
    name: 'Zamboanga Digital Labs',
    email: 'hr@zdl.example.com',
    website: 'https://example.com',
    location: 'Zamboanga City',
    about:
      'A fictional local technology partner helping students gain practical experience.',
  });

  const [done, setDone] = useState(false);

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Company profile</h1>
          <p>
            Present your organization to potential applicants.
          </p>
        </div>
      </div>

      <form
        className="panel form-panel"
        onSubmit={(e) => {
          e.preventDefault();
          setDone(true);
        }}
      >
        <div className="company-profile-banner">
          <div className="company-avatar xl">
            {company.name[0]}
          </div>

          <div>
            <h2>{company.name}</h2>
            <p>Employer account · Demo profile</p>
          </div>
        </div>

        {Object.entries({
          name: 'Company name',
          email: 'Contact email',
          website: 'Website',
          location: 'Location',
        }).map(([key, label]) => (
          <label
            className="field-label"
            key={key}
          >
            {label}

            <input
              required
              value={company[key]}
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
            value={company.about}
            onChange={(e) =>
              setCompany({
                ...company,
                about: e.target.value,
              })
            }
          />
        </label>

        {done && (
          <p className="success-note">
            Company profile updated for this demo session.
          </p>
        )}

        <Button type="submit">
          Save company profile
        </Button>
      </form>
    </>
  );
}