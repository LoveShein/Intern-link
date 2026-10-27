import { useState, useEffect } from 'react';
import Button from '../../components/Button.jsx';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [value, setValue] = useState('');

  useEffect(() => {
    fetch('http://localhost:5001/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!value.trim()) return;

    try {
      const res = await fetch('http://localhost:5001/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: value.trim() }),
      });
      if (res.ok) {
        if (!categories.includes(value.trim())) {
          setCategories([...categories, value.trim()]);
        }
        setValue('');
      }
    } catch (err) {
      console.error('Error adding category:', err);
    }
  };

  const handleRemove = async (c) => {
    try {
      const res = await fetch(`http://localhost:5001/api/categories/${encodeURIComponent(c)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCategories(categories.filter((x) => x !== c));
      }
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Categories & courses</h1>
          <p>
            Manage the course categories used by opportunity filters.
          </p>
        </div>
      </div>

      <form
        className="panel inline-add"
        onSubmit={handleAdd}
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
              type="button"
              className="text-btn danger-text"
              onClick={() => handleRemove(c)}
            >
              Remove
            </button>
          </div>
        ))}

        {!categories.length && (
          <div className="empty-state">No categories found.</div>
        )}
      </section>
    </>
  );
}