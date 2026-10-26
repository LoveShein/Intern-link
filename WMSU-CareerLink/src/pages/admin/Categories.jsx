
import { useState } from 'react';

import Button from '../../components/Button.jsx';

export default function Categories() {
  const [categories, setCategories] = useState([
    'Computer Science',
    'Information Technology',
    'Information Systems',
    'Business Administration',
    'Engineering',
  ]);

  const [value, setValue] = useState('');

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Categories & courses</h1>
          <p>
            Manage the sample course categories used by opportunity filters.
          </p>
        </div>
      </div>

      <form
        className="panel inline-add"
        onSubmit={(e) => {
          e.preventDefault();

          if (
            value.trim() &&
            !categories.includes(value.trim())
          ) {
            setCategories([...categories, value.trim()]);
          }

          setValue('');
        }}
      >
        <label className="field-label">
          Add course or category
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. Information Systems"
          />
        </label>

        <Button type="submit">
          Add category
        </Button>
      </form>

      <section className="panel">
        {categories.map((c, i) => (
          <div
            className="category-row"
            key={c}
          >
            <span className="category-number">
              {String(i + 1).padStart(2, '0')}
            </span>

            <strong>{c}</strong>

            <button
              className="text-btn danger-text"
              onClick={() =>
                setCategories(
                  categories.filter((x) => x !== c)
                )
              }
            >
              Remove
            </button>
          </div>
        ))}
      </section>
    </>
  );
}