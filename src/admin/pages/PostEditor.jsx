/**
 * Post editor — used for both create (no slug param) and edit (with slug param).
 * Layout: title + slug + meta in main column, sidebar with category, tags,
 * cover image, status, and publish button.
 *
 * Save / publish actions are placeholders until the API exists. They show
 * a clear warning that nothing persists yet.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import RichTextEditor from '../components/RichTextEditor';
import ImagePickerModal from '../components/ImagePickerModal';
import { CATEGORIES, getPostBySlug } from '../../data/posts';

const blank = {
  slug: '',
  title: '',
  excerpt: '',
  categoryId: 'procurement',
  authorName: 'GroowFuse Editorial',
  authorRole: 'Practice Team',
  date: new Date().toISOString().slice(0, 10),
  readMinutes: 6,
  coverImage: '',
  coverAlt: '',
  tagsRaw: '',
  body: '',
  status: 'draft',
};

export default function PostEditor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isEditing = !!slug;

  const initial = useMemo(() => {
    if (!isEditing) return blank;
    const post = getPostBySlug(slug);
    if (!post) return blank;

    return {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      categoryId: post.category.id,
      authorName: post.author.name,
      authorRole: post.author.role,
      date: post.date,
      readMinutes: post.readMinutes,
      coverImage: post.coverImage,
      coverAlt: post.coverAlt,
      tagsRaw: (post.tags || []).join(', '),
      body: blocksToHtml(post.content || []),
      status: 'published',
    };
  }, [slug, isEditing]);

  const [form, setForm] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [savingMode, setSavingMode] = useState(null); // 'draft' | 'publish' | null
  const [feedback, setFeedback] = useState('');
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);

  useEffect(() => {
    setForm(initial);
    setDirty(false);
  }, [initial]);

  const set = (key) => (value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };
  const setEvt = (key) => (e) => set(key)(e.target.value);

  const onTitleChange = (e) => {
    const newTitle = e.target.value;
    setForm((prev) => {
      // Auto-fill slug from title when creating a new post and slug is empty
      const next = { ...prev, title: newTitle };
      if (!isEditing && !prev.slug) {
        next.slug = slugify(newTitle);
      }
      return next;
    });
    setDirty(true);
  };

  const handleSave = async (status) => {
    setSavingMode(status === 'published' ? 'publish' : 'draft');
    setFeedback('');
    // Simulate the future API call
    await new Promise((r) => setTimeout(r, 600));
    setSavingMode(null);
    setFeedback(
      `Saved locally. ${
        status === 'published' ? 'Publishing' : 'Drafts'
      } will persist once the backend is wired up.`
    );
    setDirty(false);
  };

  return (
    <div className="adm-editor">
      {/* Header */}
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
            disabled={!!savingMode}
            onClick={() => handleSave('draft')}
            className="adm-btn adm-btn-secondary"
          >
            {savingMode === 'draft' ? 'Saving…' : 'Save draft'}
          </button>
          <button
            type="button"
            disabled={!!savingMode}
            onClick={() => handleSave('published')}
            className="adm-btn adm-btn-primary"
          >
            {savingMode === 'publish' ? 'Publishing…' : isEditing ? 'Update post' : 'Publish'}
          </button>
        </div>
      </header>

      {feedback && (
        <div className="adm-feedback" role="status">{feedback}</div>
      )}

      {/* Body grid: main + sidebar */}
      <div className="adm-editor-grid">
        {/* Main column */}
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
              placeholder="Write the article here. Toolbar above has formatting tools…"
            />
          </div>
        </div>

        {/* Sidebar */}
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
                  {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
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
                  <img src={form.coverImage} alt={form.coverAlt || ''} />
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
                <span className="adm-field-label">
                  Image URL
                  <span className="adm-field-hint">or use the picker above</span>
                </span>
                <input
                  type="url"
                  value={form.coverImage.startsWith('data:') ? '(uploaded file)' : form.coverImage}
                  onChange={setEvt('coverImage')}
                  placeholder="https://…"
                  className="adm-input"
                  disabled={form.coverImage.startsWith('data:')}
                />
              </label>
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
              {form.coverImage.startsWith('data:') && (
                <p className="adm-hint">
                  Uploaded files are stored inline until the upload endpoint is wired up.
                </p>
              )}
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
    .replace(/[\u0300-\u036f]/g, '')   // strip diacritics
    .replace(/[^a-z0-9\s-]/g, '')      // drop punctuation
    .trim()
    .replace(/\s+/g, '-');             // spaces to dashes
  if (!allowDashes) {
    out = out.replace(/-+/g, '-');     // collapse multiple dashes
  }
  return out;
}

/**
 * Convert the existing posts.js block-array shape to HTML so we can edit
 * existing posts in the rich-text editor.
 */
function blocksToHtml(blocks) {
  return blocks
    .map((b) => {
      if (b.type === 'paragraph') return `<p>${escapeHtml(b.text)}</p>`;
      if (b.type === 'heading') {
        const level = b.level === 3 ? 3 : 2;
        return `<h${level}>${escapeHtml(b.text)}</h${level}>`;
      }
      if (b.type === 'list') {
        const tag = b.style === 'numbered' ? 'ol' : 'ul';
        const items = (b.items || []).map((i) => `<li>${escapeHtml(i)}</li>`).join('');
        return `<${tag}>${items}</${tag}>`;
      }
      if (b.type === 'quote') {
        const cite = b.cite ? `<cite>${escapeHtml(b.cite)}</cite>` : '';
        return `<blockquote><p>${escapeHtml(b.text)}</p>${cite}</blockquote>`;
      }
      return '';
    })
    .join('\n');
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}