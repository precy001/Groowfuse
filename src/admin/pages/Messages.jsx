/**
 * Contact form messages — admin view.
 *
 * Reads from GET /admin/messages.php with a status filter.
 * Single-message detail via GET /admin/messages.php?id=
 * Archive via PATCH /admin/messages.php?id= { status: 'archived' }
 */

import { useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import { formatAdminDateTime, timeAgo } from '../lib/format';
import { useMessages, useMessage } from '../lib/data-hooks';
import { useAsyncCallback } from '../../lib/use-async';
import { api } from '../../lib/api';
import { getUser } from '../lib/auth';

export default function Messages() {
  const { id } = useParams();
  const [filter, setFilter] = useState('inbox'); // 'inbox' | 'unread' | 'archived'
  const [query, setQuery]   = useState('');

  const list = useMessages(filter);
  const messages = list.data?.messages || [];
  const counts   = list.data?.counts   || { unread: 0, total: 0, archived: 0 };

  const filtered = useMemo(() => {
    if (!query.trim()) return messages;
    const q = query.trim().toLowerCase();
    return messages.filter(
      (m) =>
        (m.contactName || '').toLowerCase().includes(q) ||
        (m.companyName || '').toLowerCase().includes(q) ||
        (m.message || '').toLowerCase().includes(q) ||
        (m.contactEmail || '').toLowerCase().includes(q)
    );
  }, [messages, query]);

  return (
    <div className="adm-messages">
      <header className="adm-page-header">
        <div>
          <span className="adm-eyebrow">Engagement</span>
          <h1 className="adm-page-title">Messages</h1>
          <p className="adm-page-sub">{counts.unread} unread · {counts.total} total</p>
        </div>
      </header>

      {list.error && (
        <div className="adm-feedback" role="alert" style={{ borderColor: 'var(--red)', color: 'var(--red)', marginBottom: 16 }}>
          Could not load messages: {list.error.message}
          <button type="button" onClick={list.reload} className="adm-btn adm-btn-ghost" style={{ marginLeft: 12 }}>
            Retry
          </button>
        </div>
      )}

      <div className={`adm-msg-layout ${id ? 'has-detail' : ''}`}>
        <section className="adm-msg-list-col">
          <div className="adm-tabs" role="tablist">
            {[
              { id: 'inbox',    label: 'Inbox' },
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

          <ul className="adm-msg-list" role="list">
            {list.loading ? (
              <li className="adm-empty adm-empty-block">Loading…</li>
            ) : filtered.length === 0 ? (
              <li className="adm-empty adm-empty-block">No messages match.</li>
            ) : (
              filtered.map((m) => (
                <li key={m.id}>
                  <Link
                    to={`/admin/messages/${m.id}`}
                    className={`adm-msg-row ${String(id) === String(m.id) ? 'is-selected' : ''} ${m.status === 'unread' ? 'is-unread' : ''}`}
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

        <section className="adm-msg-detail-col">
          {id ? (
            <MessageDetail id={id} onMutated={list.reload} />
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

function MessageDetail({ id, onMutated }) {
  const navigate = useNavigate();
  const { data, error, loading, reload } = useMessage(id);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  const archiver = useAsyncCallback(() =>
    api.patch(`/admin/messages.php?id=${id}`, { status: 'archived' })
  );

  const message = data?.message;

  if (loading) {
    return (
      <article className="adm-msg-detail">
        <div className="adm-msg-detail-body">
          <p style={{ color: 'var(--muted)' }}>Loading…</p>
        </div>
      </article>
    );
  }
  if (error) {
    return (
      <article className="adm-msg-detail">
        <div className="adm-msg-detail-body">
          <p style={{ color: 'var(--red)' }}>{error.message}</p>
          <button type="button" onClick={reload} className="adm-btn adm-btn-ghost" style={{ marginTop: 12 }}>
            Retry
          </button>
        </div>
      </article>
    );
  }
  if (!message) return null;

  const handleReply = () => {
    const body = encodeURIComponent(
      `\n\n----\nIn reply to your enquiry from ${formatAdminDateTime(message.receivedAt)}:\n\n${message.message}`
    );
    window.location.href =
      `mailto:${message.contactEmail}?subject=Re: Your enquiry to GroowFuse&body=${body}`;
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
          <button
            type="button"
            onClick={() => setArchiveOpen(true)}
            className="adm-btn adm-btn-ghost"
            disabled={message.status === 'archived'}
          >
            {message.status === 'archived' ? 'Archived' : 'Archive'}
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
          <div><dt>Company</dt>       <dd>{message.companyName || '—'}</dd></div>
          <div><dt>Company email</dt> <dd>{message.companyEmail || '—'}</dd></div>
          <div><dt>Country</dt>       <dd>{message.country || '—'}</dd></div>
          <div><dt>Sector</dt>        <dd>{message.sector || '—'}</dd></div>
          <div>
            <dt>Service type</dt>
            <dd>
              {message.serviceType || '—'}
              {message.serviceTypeOther && ` — ${message.serviceTypeOther}`}
            </dd>
          </div>
          <div><dt>Received</dt>      <dd>{formatAdminDateTime(message.receivedAt)}</dd></div>
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
        onConfirm={async () => {
          try {
            await archiver.run();
            const user = getUser();
            setFeedback(`Archived by ${user?.email || 'admin'} just now.`);
            reload();
            onMutated?.();
          } catch (err) {
            setFeedback(`Could not archive: ${err.message}`);
          }
        }}
        title="Archive this message?"
        body={
          <p className="adm-modal-text">
            <strong style={{ color: 'var(--text)' }}>{message.contactName}</strong>
            <br />
            It'll be hidden from the inbox but kept in the Archived tab.
          </p>
        }
        confirmLabel={archiver.loading ? 'Archiving…' : 'Archive'}
      />
    </article>
  );
}