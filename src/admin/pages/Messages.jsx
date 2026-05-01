/**
 * Contact form messages — inbox-style list with detail panel.
 *
 * On desktop: split layout — list left, detail right.
 * On mobile: list shows; tapping a row navigates to the detail.
 */

import { useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  MOCK_MESSAGES,
  formatAdminDateTime,
  timeAgo,
} from '../lib/mock-data';
import ConfirmModal from '../components/ConfirmModal';

export default function Messages() {
  const { id } = useParams();
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'archived'
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = [...MOCK_MESSAGES];

    if (filter === 'unread')   list = list.filter((m) => m.status === 'unread');
    if (filter === 'archived') list = list.filter((m) => m.status === 'archived');
    if (filter === 'all')      list = list.filter((m) => m.status !== 'archived');

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (m) =>
          m.contactName.toLowerCase().includes(q) ||
          m.companyName.toLowerCase().includes(q) ||
          m.message.toLowerCase().includes(q) ||
          m.contactEmail.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));
  }, [filter, query]);

  const selected = id ? MOCK_MESSAGES.find((m) => m.id === id) : null;

  return (
    <div className="adm-messages">
      <header className="adm-page-header">
        <div>
          <span className="adm-eyebrow">Engagement</span>
          <h1 className="adm-page-title">Messages</h1>
          <p className="adm-page-sub">
            {MOCK_MESSAGES.filter((m) => m.status === 'unread').length} unread ·{' '}
            {MOCK_MESSAGES.length} total
          </p>
        </div>
      </header>

      <div className={`adm-msg-layout ${selected ? 'has-detail' : ''}`}>
        {/* List column */}
        <section className="adm-msg-list-col">
          {/* Filter tabs */}
          <div className="adm-tabs" role="tablist">
            {[
              { id: 'all',      label: 'Inbox' },
              { id: 'unread',   label: 'Unread' },
              { id: 'archived', label: 'Archived' },
            ].map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={filter === t.id}
                onClick={() => setFilter(t.id)}
                className={`adm-tab ${filter === t.id ? 'is-active' : ''}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, company, or content…"
            className="adm-input adm-msg-search"
            aria-label="Search messages"
          />

          {/* List */}
          <ul className="adm-msg-list" role="list">
            {filtered.length === 0 ? (
              <li className="adm-empty adm-empty-block">No messages match.</li>
            ) : (
              filtered.map((m) => (
                <li key={m.id}>
                  <Link
                    to={`/admin/messages/${m.id}`}
                    className={`adm-msg-row ${selected?.id === m.id ? 'is-selected' : ''} ${m.status === 'unread' ? 'is-unread' : ''}`}
                  >
                    <span className={`adm-dot ${m.status === 'unread' ? 'is-unread' : ''}`} aria-hidden />
                    <div className="adm-msg-row-body">
                      <div className="adm-msg-row-top">
                        <span className="adm-msg-name">{m.contactName}</span>
                        <span className="adm-msg-time">{timeAgo(m.receivedAt)}</span>
                      </div>
                      <span className="adm-msg-meta">
                        {m.companyName} · {m.serviceType || m.serviceTypeOther || '—'}
                      </span>
                      <span className="adm-msg-preview">{m.message}</span>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Detail column */}
        <section className="adm-msg-detail-col">
          {selected ? (
            <MessageDetail message={selected} />
          ) : (
            <div className="adm-msg-detail-empty">
              <span className="adm-eyebrow">Select a message</span>
              <p>Pick one from the list to read the full enquiry.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function MessageDetail({ message }) {
  const navigate = useNavigate();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleReply = () => {
    const body = encodeURIComponent(`\n\n----\nIn reply to your enquiry from ${formatAdminDateTime(message.receivedAt)}:\n\n${message.message}`);
    window.location.href = `mailto:${message.contactEmail}?subject=Re: Your enquiry to GroowFuse&body=${body}`;
  };

  return (
    <article className="adm-msg-detail">
      <header className="adm-msg-detail-header">
        <button
          type="button"
          className="adm-msg-back"
          onClick={() => navigate('/admin/messages')}
          aria-label="Back to message list"
        >
          ←
        </button>
        <div className="adm-msg-detail-actions">
          <button type="button" onClick={() => setArchiveOpen(true)} className="adm-btn adm-btn-ghost">
            Archive
          </button>
          <button type="button" onClick={handleReply} className="adm-btn adm-btn-primary">
            Reply via email →
          </button>
        </div>
      </header>

      <div className="adm-msg-detail-body">
        <h2 className="adm-msg-detail-title">{message.contactName}</h2>
        <a href={`mailto:${message.contactEmail}`} className="adm-msg-detail-email">
          {message.contactEmail}
        </a>

        <dl className="adm-msg-detail-grid">
          <div>
            <dt>Company</dt>
            <dd>{message.companyName}</dd>
          </div>
          <div>
            <dt>Company email</dt>
            <dd>{message.companyEmail || '—'}</dd>
          </div>
          <div>
            <dt>Country</dt>
            <dd>{message.country || '—'}</dd>
          </div>
          <div>
            <dt>Sector</dt>
            <dd>{message.sector || '—'}</dd>
          </div>
          <div>
            <dt>Service type</dt>
            <dd>
              {message.serviceType}
              {message.serviceTypeOther && ` — ${message.serviceTypeOther}`}
            </dd>
          </div>
          <div>
            <dt>Received</dt>
            <dd>{formatAdminDateTime(message.receivedAt)}</dd>
          </div>
        </dl>

        <div className="adm-msg-detail-message">
          <span className="adm-eyebrow">Message</span>
          <p>{message.message}</p>
        </div>

        {feedback && (
          <div className="adm-feedback" role="status" style={{ marginTop: 16 }}>
            {feedback}
          </div>
        )}
      </div>

      <ConfirmModal
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        onConfirm={() => {
          setFeedback('Archive will persist once the backend is wired up.');
        }}
        title="Archive this message?"
        body={
          <p className="adm-modal-text">
            <strong style={{ color: 'var(--text)' }}>{message.contactName}</strong>
            <br />
            It'll be hidden from the inbox but kept in the Archived tab.
          </p>
        }
        confirmLabel="Archive"
      />
    </article>
  );
}