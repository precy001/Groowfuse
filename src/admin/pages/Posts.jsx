/**
 * Blog post management — admin view.
 *
 * Reads from GET /admin/posts.php (includes drafts).
 * Delete via DELETE /admin/posts.php?id=
 *
 * Search/filter/sort happen client-side over the fetched list since
 * the admin's volume is small. If we ever cross ~500 posts we should
 * push these into URL params and let the server filter.
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import { formatAdminDate } from '../lib/format';
import { useAdminPosts } from '../lib/data-hooks';
import { useAsyncCallback } from '../../lib/use-async';
import { api } from '../../lib/api';
import { getUser } from '../lib/auth';

export default function Posts() {
  const { data, error, loading, reload } = useAdminPosts();
  const posts = data?.posts || [];

  const [query, setQuery]                 = useState('');
  const [category, setCategory]           = useState('all');
  const [sort, setSort]                   = useState('date-desc');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [feedback, setFeedback]           = useState('');

  const deleter = useAsyncCallback((id) => api.del(`/admin/posts.php?id=${id}`));

  // Build category options from what's actually in the data
  const categories = useMemo(() => {
    const map = new Map();
    map.set('all', { id: 'all', label: `All (${posts.length})` });
    for (const p of posts) {
      const id = p.category?.id;
      if (!id) continue;
      const existing = map.get(id);
      if (existing) {
        existing.count = (existing.count || 1) + 1;
      } else {
        map.set(id, { id, label: p.category.label, count: 1 });
      }
    }
    return [...map.values()];
  }, [posts]);

  const filtered = useMemo(() => {
    let list = [...posts];

    if (category !== 'all') {
      list = list.filter((p) => p.category?.id === category);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.excerpt || '').toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      switch (sort) {
        case 'date-asc':   return new Date(a.date || 0) - new Date(b.date || 0);
        case 'title-asc':  return a.title.localeCompare(b.title);
        case 'title-desc': return b.title.localeCompare(a.title);
        case 'date-desc':
        default:           return new Date(b.date || 0) - new Date(a.date || 0);
      }
    });

    return list;
  }, [posts, query, category, sort]);

  const draftCount = posts.filter((p) => p.status === 'draft').length;
  const pubCount   = posts.filter((p) => p.status === 'published').length;

  return (
    <div className="adm-posts">
      <header className="adm-page-header">
        <div>
          <span className="adm-eyebrow">Content</span>
          <h1 className="adm-page-title">Blog posts</h1>
          <p className="adm-page-sub">{pubCount} published · {draftCount} draft{draftCount === 1 ? '' : 's'}</p>
        </div>
        <div className="adm-page-actions">
          <Link to="/admin/posts/new" className="adm-btn adm-btn-primary">
            New post →
          </Link>
        </div>
      </header>

      {error && (
        <div className="adm-feedback" role="alert" style={{ borderColor: 'var(--red)', color: 'var(--red)', marginBottom: 16 }}>
          Could not load posts: {error.message}
          <button type="button" onClick={reload} className="adm-btn adm-btn-ghost" style={{ marginLeft: 12 }}>
            Retry
          </button>
        </div>
      )}

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
              {categories.map((c) => (
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
            {loading ? (
              <tr><td colSpan={7} className="adm-empty">Loading posts…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="adm-empty">No posts match the current filters.</td></tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link to={`/admin/posts/${p.id}/edit`} className="adm-table-title">
                      {p.title}
                    </Link>
                    <span className="adm-table-slug">/{p.slug}</span>
                  </td>
                  <td>
                    <span className="adm-tag-cell">{p.category?.label || '—'}</span>
                  </td>
                  <td className="adm-table-muted">{p.author?.name}</td>
                  <td className="adm-table-muted">{p.readMinutes} min</td>
                  <td className="adm-table-muted">{p.date ? formatAdminDate(p.date) : '—'}</td>
                  <td>
                    <span className={`adm-pill adm-pill-${p.status === 'published' ? 'confirmed' : 'pending'}`}>
                      {p.status}
                    </span>
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
                        to={`/admin/posts/${p.id}/edit`}
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
        onConfirm={async () => {
          if (!pendingDelete) return;
          try {
            await deleter.run(pendingDelete.id);
            const user = getUser();
            setFeedback(`Deleted "${pendingDelete.title}" (by ${user?.email || 'admin'}).`);
            reload();
          } catch (err) {
            setFeedback(`Could not delete: ${err.message}`);
          }
        }}
        title="Delete this post?"
        body={
          <p className="adm-modal-text">
            <strong style={{ color: 'var(--text)' }}>{pendingDelete?.title}</strong>
            <br />
            This will remove the post from the site. This action can't be undone.
          </p>
        }
        confirmLabel={deleter.loading ? 'Deleting…' : 'Delete post'}
        destructive
      />
    </div>
  );
}