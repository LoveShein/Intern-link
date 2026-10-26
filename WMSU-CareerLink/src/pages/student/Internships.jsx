
import { useMemo, useState } from 'react';
import {
  MapPin,
  Bookmark,
  ArrowUpRight,
} from 'lucide-react';

import SearchBar from '../../components/SearchBar.jsx';
import Button from '../../components/Button.jsx';

export default function Internships({
  jobs,
  saved,
  onSave,
  onDetails,
}) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('All locations');
  const [course, setCourse] = useState('All courses');
  const [type, setType] = useState('All types');

  const filtered = useMemo(
    () =>
      jobs.filter(
        (j) =>
          j.status === 'Published' &&
          [
            j.title,
            j.company,
            j.location,
            j.course,
            j.description,
          ]
            .join(' ')
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (location === 'All locations' ||
            j.location === location) &&
          (course === 'All courses' ||
            j.course === course) &&
          (type === 'All types' || j.type === type)
      ),
    [jobs, query, location, course, type]
  );

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Browse opportunities</h1>
          <p>
            Find an internship that matches your interests and
            goals.
          </p>
        </div>

        <span className="count-pill">
          {filtered.length} opportunities
        </span>
      </div>

      <section className="panel filters-panel">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search title, company, skill..."
        />

        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option>All locations</option>

          {[...new Set(jobs.map((j) => j.location))].map(
            (x) => (
              <option key={x}>{x}</option>
            )
          )}
        </select>

        <select
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        >
          <option>All courses</option>

          {[...new Set(jobs.map((j) => j.course))].map(
            (x) => (
              <option key={x}>{x}</option>
            )
          )}
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option>All types</option>
          <option>Internship</option>
          <option>OJT</option>
        </select>
      </section>

      <div className="opportunity-grid">
        {filtered.map((job) => (
          <article
            className="opportunity-card"
            key={job.id}
          >
            <div className="job-card-top">
              <div className="company-avatar large">
                {job.company.slice(0, 1)}
              </div>

              <button
                className={`icon-btn ${
                  saved.includes(job.id) ? 'saved' : ''
                }`}
                aria-label="Toggle saved job"
                onClick={() => onSave(job.id)}
              >
                <Bookmark size={19} />
              </button>
            </div>

            <span className="job-type">{job.type}</span>

            <h2>{job.title}</h2>

            <p className="company-name">
              {job.company}
            </p>

            <div className="job-meta">
              <span>
                <MapPin size={15} />
                {job.location}
              </span>

              <span>{job.course}</span>
            </div>

            <p className="job-description">
              {job.description}
            </p>

            <div className="job-card-footer">
              <span className="muted">
                Deadline: {job.deadline}
              </span>

              <Button onClick={() => onDetails(job)}>
                View details
                <ArrowUpRight size={15} />
              </Button>
            </div>
          </article>
        ))}

        {!filtered.length && (
          <div className="empty-state">
            No matching opportunities. Try changing your
            search or filters.
          </div>
        )}
      </div>
    </>
  );
}