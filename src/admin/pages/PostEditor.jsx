/**
 * Post editor — admin view.
 *
 * /admin/posts/new           → create
 * /admin/posts/:id/edit      → edit existing post (id is the numeric post id)
 *
 * Reads from GET /admin/posts.php?id= for edit mode.
 * Saves via POST /admin/posts.php (create) or PUT /admin/posts.php?id= (update).
 *
 * Cover image picker uploads via POST /admin/upload.php and stores the
 * returned URL — never a base64 data URL.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import RichTextEditor from '../components/RichTextEditor';
import ImagePickerModal from '../components/ImagePickerModal';
import { useAdminPost } from '../lib/data-hooks';
import { useActionsForTarget, describeAction } from '../lib/audit-log';
import { timeAgo } from '../lib/format';
import { useAsyncCallback } from '../../lib/use-async';
import { api, apiUrl } from '../../lib/api';

const blank = {
  slug:        '',
  title:       '',
  excerpt:     '',
  categoryId:  '',
  authorName:  'GroowFuse Editorial',
  authorRole:  'Practice Team',
  date:        new Date().toISOString().slice(0, 10),
  readMinutes: 6,
  coverImage:  '',
  coverAlt:    '',
  tagsRaw:     '',
  body:        '',
  status:      'draft',
};

export default function PostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  // Load existing post when editing
  const { data, error, loading } = useAdminPost(isEditing ? id : null);
  const post = data?.post;

  // Activity feed for this specific post
  const audit = useActionsForTarget('post', isEditing ? id : null, 5);

  // Categories — pulled from public posts endpoint (it returns the catalog)
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    let alive = true;
    api.get('/posts.php?limit=1')
      .then((res) => { if (alive) setCategories(res?.categories || []); })
      .catch(() => { /* non-fatal */ });
    return () => { alive = false; };
  }, []);

  // Map server post → form shape
  const initial = useMemo(() => {
    if (!isEditing || !post) return blank;
    return {
      slug:        post.slug || '',
      title:       post.title || '',
      excerpt:     post.excerpt || '',
      categoryId:  post.category?.id || '',
      authorName:  post.authorName || post.author?.name || 'GroowFuse Editorial',
      authorRole:  post.authorRole || post.author?.role || 'Practice Team',
      date:        post.date || new Date().toISOString().slice(0, 10),
      readMinutes: post.readMinutes || 6,
      coverImage:  post.coverImage || '',
      coverAlt:    post.coverAlt || '',
      tagsRaw:     (post.tags || []).join(', '),
      body:        post.body || '',
      status:      post.status || 'draft',
    };
  }, [post, isEditing]);

  const [form, setForm]                       = useState(initial);
  const [dirty, setDirty]                     = useState(false);
  const [feedback, setFeedback]               = useState('');
  const [serverErrors, setServerErrors]       = useState({});
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);

  useEffect(() => {
    setForm(initial);
    setDirty(false);
    setServerErrors({});
  }, [initial]);

  const set = (key) => (value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };
  const setEvt = (key) => (e) => set(key)(e.target.value);

  const onTitleChange = (e) => {
    const newTitle = e.target.value;
    setForm((prev) => {
      const next = { ...prev, title: newTitle };
      if (!isEditing && !prev.slug) {
        next.slug = slugify(newTitle);
      }
      return next;
    });
    setDirty(true);
  };

  const saver = useAsyncCallback((status) => {
    const payload = {
      title:        form.title,
      slug:         form.slug,
      excerpt:      form.excerpt,
      body:         form.body,
      // Slug-based category — backend resolves to id
      category:     form.categoryId,
      authorName:   form.authorName,
      authorRole:   form.authorRole,
      coverImage:   form.coverImage,
      coverAlt:     form.coverAlt,
      readMinutes:  form.readMinutes,
      tagsRaw:      form.tagsRaw,
      date:         form.date,
      status,
    };
    return isEditing
      ? api.put(`/admin/posts.php?id=${id}`, payload)
      : api.post('/admin/posts.php', payload);
  });

  const handleSave = async (status) => {
    setFeedback('');
    setServerErrors({});
    try {
      const res = await saver.run(status);
      const savedPost = res?.post;
      setDirty(false);
      setFeedback(
        status === 'published'
          ? `Published.`
          : `Saved as draft.`
      );
      // After create, redirect to the edit URL so further saves use PUT
      if (!isEditing && savedPost?.id) {
        navigate(`/admin/posts/${savedPost.id}/edit`, { replace: true });
      }
    } catch (err) {
      if (err.fields) setServerErrors(err.fields);
      setFeedback(err.message || 'Could not save.');
    }
  };

  if (loading) {
    return <div style={{ padding: 40, color: 'var(--muted)' }}>Loading post…</div>;
  }
  if (error) {
    return (
      <div style={{ padding: 40 }}>
        <p style={{ color: 'var(--red)' }}>Could not load post: {error.message}</p>
        <Link to="/admin/posts" className="adm-btn adm-btn-ghost" style={{ marginTop: 12 }}>
          ← Back to posts
        </Link>
      </div>
    );
  }

  const lastAction = audit.data?.actions?.[0];

  return (
    <div className="adm-editor">
      <header className="adm-page-header">
        <div>
          <span className="adm-eyebrow">
            <Link to="/admin/posts" className="adm-eyebrow-link">Blog posts</Link> /
            {isEditing ? ' Edit' : ' New post'}
          </span>
          <h1 className="adm-page-title">
            {isEditing ? form.title || 'Untitled' : 'New post'}
          </h1>
          {dirty && (
            <span className="adm-editor-dirty">
              <span className="adm-dot is-unread" aria-hidden /> Unsaved changes
            </span>
          )}
        </div>
        <div className="adm-page-actions">
          <Link to="/admin/posts" className="adm-btn adm-btn-ghost">Cancel</Link>
          <button
            type="button"
            disabled={saver.loading}
            onClick={() => handleSave('draft')}
            className="adm-btn adm-btn-secondary"
          >
            {saver.loading ? 'Saving…' : 'Save draft'}
          </button>
          <button
            type="button"
            disabled={saver.loading}
            onClick={() => handleSave('published')}
            className="adm-btn adm-btn-primary"
          >
            {saver.loading ? 'Publishing…' : (form.status === 'published' ? 'Update post' : 'Publish')}
          </button>
        </div>
      </header>

      {feedback && (
        <div className="adm-feedback" role="status">{feedback}</div>
      )}

      <div className="adm-editor-grid">
        <div className="adm-editor-main">
          <label className="adm-field">
            <span className="adm-field-label">Title</span>
            <input
              type="text"
              value={form.title}
              onChange={onTitleChange}
              placeholder="A descriptive, decisive title"
              className="adm-input adm-input-lg"
            />
            {serverErrors.title && <span className="adm-modal-error">{serverErrors.title}</span>}
          </label>

          <label className="adm-field">
            <span className="adm-field-label">Slug</span>
            <div className="adm-input-wrap">
              <span className="adm-input-prefix">/blog/</span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => set('slug')(slugify(e.target.value, true))}
                placeholder="auto-generated-from-title"
                className="adm-input adm-input-with-prefix"
              />
            </div>
          </label>

          <label className="adm-field">
            <span className="adm-field-label">
              Excerpt
              <span className="adm-field-hint">{form.excerpt.length} chars · aim for 1–2 sentences</span>
            </span>
            <textarea
              value={form.excerpt}
              onChange={setEvt('excerpt')}
              rows={3}
              placeholder="One or two sentences that summarize the article. Shows on the blog index."
              className="adm-input adm-textarea"
            />
          </label>

          <div className="adm-field">
            <span className="adm-field-label">Body</span>
            <RichTextEditor
              value={form.body}
              onChange={set('body')}
              placeholder="Write the article here…"
            />
          </div>
        </div>

        <aside className="adm-editor-side">
          <div className="adm-panel">
            <header className="adm-panel-header">
              <h3 className="adm-panel-title">Status</h3>
            </header>
            <div className="adm-panel-body">
              <div className="adm-status-row">
                <span>Status</span>
                <span className={`adm-pill adm-pill-${form.status === 'published' ? 'confirmed' : 'pending'}`}>
                  {form.status}
                </span>
              </div>
              <div className="adm-status-row">
                <span>Visibility</span>
                <span style={{ color: 'var(--text)' }}>Public</span>
              </div>
              {lastAction && (
                <div className="adm-status-row adm-status-row-stack">
                  <span>Last activity</span>
                  <div className="adm-status-attribution">
                    <span style={{ color: 'var(--text)' }}>{describeAction(lastAction.action)}</span>
                    <span className="adm-status-by">
                      by {lastAction.user.email} · {timeAgo(lastAction.at)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="adm-panel">
            <header className="adm-panel-header">
              <h3 className="adm-panel-title">Classification</h3>
            </header>
            <div className="adm-panel-body">
              <label className="adm-field">
                <span className="adm-field-label">Category</span>
                <select
                  value={form.categoryId}
                  onChange={setEvt('categoryId')}
                  className="adm-input adm-select"
                >
                  <option value="">— pick a category —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </label>

              <label className="adm-field">
                <span className="adm-field-label">
                  Tags
                  <span className="adm-field-hint">comma-separated</span>
                </span>
                <input
                  type="text"
                  value={form.tagsRaw}
                  onChange={setEvt('tagsRaw')}
                  placeholder="SME, Procurement, Cost Optimisation"
                  className="adm-input"
                />
              </label>
            </div>
          </div>

          <div className="adm-panel">
            <header className="adm-panel-header">
              <h3 className="adm-panel-title">Author</h3>
            </header>
            <div className="adm-panel-body">
              <label className="adm-field">
                <span className="adm-field-label">Name</span>
                <input
                  type="text"
                  value={form.authorName}
                  onChange={setEvt('authorName')}
                  className="adm-input"
                />
              </label>
              <label className="adm-field">
                <span className="adm-field-label">Role</span>
                <input
                  type="text"
                  value={form.authorRole}
                  onChange={setEvt('authorRole')}
                  className="adm-input"
                />
              </label>
            </div>
          </div>

          <div className="adm-panel">
            <header className="adm-panel-header">
              <h3 className="adm-panel-title">Meta</h3>
            </header>
            <div className="adm-panel-body">
              <label className="adm-field">
                <span className="adm-field-label">Publish date</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={setEvt('date')}
                  className="adm-input"
                />
              </label>
              <label className="adm-field">
                <span className="adm-field-label">Read time (min)</span>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={form.readMinutes}
                  onChange={(e) => set('readMinutes')(Number(e.target.value) || 1)}
                  className="adm-input"
                />
              </label>
            </div>
          </div>

          <div className="adm-panel">
            <header className="adm-panel-header">
              <h3 className="adm-panel-title">Cover image</h3>
            </header>
            <div className="adm-panel-body">
              {form.coverImage ? (
                <div className="adm-cover-preview">
                  <img src={apiUrl(form.coverImage)} alt={form.coverAlt || ''} />
                  <button
                    type="button"
                    onClick={() => { set('coverImage')(''); set('coverAlt')(''); }}
                    className="adm-cover-remove"
                    aria-label="Remove cover image"
                  >
                    × Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setCoverPickerOpen(true)}
                  className="adm-cover-empty"
                >
                  <span className="adm-cover-empty-icon" aria-hidden>↑</span>
                  <span className="adm-cover-empty-text">
                    <strong>Choose cover image</strong>
                    <span>Upload from device or paste a URL</span>
                  </span>
                </button>
              )}

              {form.coverImage && (
                <button
                  type="button"
                  onClick={() => setCoverPickerOpen(true)}
                  className="adm-btn adm-btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
                >
                  Replace image
                </button>
              )}

              <label className="adm-field">
                <span className="adm-field-label">Alt text</span>
                <input
                  type="text"
                  value={form.coverAlt}
                  onChange={setEvt('coverAlt')}
                  placeholder="Describes the image for screen readers"
                  className="adm-input"
                />
              </label>
            </div>
          </div>
        </aside>
      </div>

      <ImagePickerModal
        open={coverPickerOpen}
        onClose={() => setCoverPickerOpen(false)}
        onPick={(src, alt) => {
          set('coverImage')(src);
          if (alt) set('coverAlt')(alt);
        }}
        title="Choose cover image"
      />
    </div>
  );
}

/* ─── helpers ─── */

function slugify(s, allowDashes = false) {
  let out = (s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  if (!allowDashes) out = out.replace(/-+/g, '-');
  return out;
}