/**
 * Blog post management. Lists existing posts in a dense table, with search
 * and category filter. Edit/delete actions are placeholders until the API
 * layer can persist changes.
 *
 * Source today is src/data/posts.js. When the backend lands, replace the
 * import with a fetch.
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import { POSTS, CATEGORIES, formatDate } from '../../data/posts';

export default function Posts() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('date-desc');
  const [pendingDelete, setPendingDelete] = useState(null);  // post being confirmed for deletion
  const [feedback, setFeedback] = useState('');

  const filtered = useMemo(() => {
    let list = [...POSTS];

    if (category !== 'all') {
      list = list.filter((p) => p.category.id === category);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      switch (sort) {
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'date-desc':
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

    return list;
  }, [query, category, sort]);

  return (
    <div className="adm-posts">
      <header className="adm-page-header">
        <div>
          <span className="adm-eyebrow">Content</span>
          <h1 className="adm-page-title">Blog posts</h1>
          <p className="adm-page-sub">{POSTS.length} published · 0 drafts</p>
        </div>
        <div className="adm-page-actions">
          <Link to="/admin/posts/new" className="adm-btn adm-btn-primary">
            New post →
          </Link>
        </div>
      </header>

      {/* Toolbar */}
      <div className="adm-toolbar">
        <div className="adm-toolbar-search">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, excerpt, or tag…"
            className="adm-input"
            aria-label="Search posts"
          />
        </div>
        <div className="adm-toolbar-filters">
          <label className="adm-select-wrap">
            <span className="adm-select-label">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="adm-input adm-select"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </label>
          <label className="adm-select-wrap">
            <span className="adm-select-label">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="adm-input adm-select"
            >
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
              <option value="title-asc">Title A→Z</option>
              <option value="title-desc">Title Z→A</option>
            </select>
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Author</th>
              <th>Read</th>
              <th>Published</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="adm-empty">
                  No posts match the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.slug}>
                  <td>
                    <Link to={`/admin/posts/${p.slug}/edit`} className="adm-table-title">
                      {p.title}
                    </Link>
                    <span className="adm-table-slug">/{p.slug}</span>
                  </td>
                  <td>
                    <span className="adm-tag-cell">{p.category.label}</span>
                  </td>
                  <td className="adm-table-muted">{p.author.name}</td>
                  <td className="adm-table-muted">{p.readMinutes} min</td>
                  <td className="adm-table-muted">{formatDate(p.date)}</td>
                  <td>
                    <span className="adm-pill adm-pill-confirmed">Published</span>
                  </td>
                  <td>
                    <div className="adm-row-actions">
                      <Link
                        to={`/blog/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="adm-btn-icon"
                        title="View on site"
                        aria-label={`View ${p.title} on site`}
                      >
                        ↗
                      </Link>
                      <Link
                        to={`/admin/posts/${p.slug}/edit`}
                        className="adm-btn-icon"
                        title="Edit"
                        aria-label={`Edit ${p.title}`}
                      >
                        ✎
                      </Link>
                      <button
                        type="button"
                        className="adm-btn-icon adm-btn-icon-danger"
                        title="Delete"
                        aria-label={`Delete ${p.title}`}
                        onClick={() => setPendingDelete(p)}
                      >
                        ×
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {feedback && (
        <div className="adm-feedback" role="status" style={{ marginTop: 16 }}>
          {feedback}
        </div>
      )}

      <ConfirmModal
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          setFeedback(`"${pendingDelete?.title}" — delete will persist once the backend is wired up.`);
        }}
        title="Delete this post?"
        body={
          <p className="adm-modal-text">
            <strong style={{ color: 'var(--text)' }}>{pendingDelete?.title}</strong>
            <br />
            This will remove the post from the site. This action can't be undone.
          </p>
        }
        confirmLabel="Delete post"
        destructive
      />
    </div>
  );
}