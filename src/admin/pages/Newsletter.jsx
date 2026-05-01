/**
 * Newsletter — subscriber list + compose dialog.
 *
 * Compose is fronted by an inline panel (no modal complexity) — write
 * subject + body, click send, get a "queued for delivery" confirmation.
 * Real send happens once the backend is wired up.
 */

import { useMemo, useState } from 'react';
import {
  MOCK_SUBSCRIBERS,
  formatAdminDate,
  timeAgo,
} from '../lib/mock-data';
import ConfirmModal from '../components/ConfirmModal';
import { logAction } from '../lib/audit-log';
import { getUser } from '../lib/auth';

export default function Newsletter() {
  const [view, setView] = useState('subscribers'); // 'subscribers' | 'compose'

  return (
    <div className="adm-newsletter">
      <header className="adm-page-header">
        <div>
          <span className="adm-eyebrow">Engagement</span>
          <h1 className="adm-page-title">Newsletter</h1>
          <p className="adm-page-sub">
            {MOCK_SUBSCRIBERS.filter((s) => s.status === 'confirmed').length} confirmed ·{' '}
            {MOCK_SUBSCRIBERS.filter((s) => s.status === 'pending').length} pending ·{' '}
            {MOCK_SUBSCRIBERS.filter((s) => s.status === 'unsubscribed').length} unsubscribed
          </p>
        </div>
        <div className="adm-page-actions">
          <button
            type="button"
            onClick={() => setView('compose')}
            className="adm-btn adm-btn-primary"
            disabled={view === 'compose'}
          >
            Compose newsletter →
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="adm-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={view === 'subscribers'}
          onClick={() => setView('subscribers')}
          className={`adm-tab ${view === 'subscribers' ? 'is-active' : ''}`}
        >
          Subscribers
        </button>
        <button
          role="tab"
          aria-selected={view === 'compose'}
          onClick={() => setView('compose')}
          className={`adm-tab ${view === 'compose' ? 'is-active' : ''}`}
        >
          Compose
        </button>
      </div>

      {view === 'subscribers' ? <SubscribersTable /> : <ComposeForm />}
    </div>
  );
}

/* ─── Subscribers table ─── */
function SubscribersTable() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pendingRemove, setPendingRemove] = useState(null);
  const [feedback, setFeedback] = useState('');

  const list = useMemo(() => {
    let l = [...MOCK_SUBSCRIBERS];
    if (statusFilter !== 'all') l = l.filter((s) => s.status === statusFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      l = l.filter((s) => s.email.toLowerCase().includes(q));
    }
    return l.sort((a, b) => new Date(b.subscribedAt) - new Date(a.subscribedAt));
  }, [query, statusFilter]);

  const handleExport = () => {
    const csv = ['Email,Status,Source,Subscribed at']
      .concat(list.map((s) => `${s.email},${s.status},${s.source},${s.subscribedAt}`))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="adm-toolbar">
        <div className="adm-toolbar-search">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by email…"
            className="adm-input"
            aria-label="Search subscribers"
          />
        </div>
        <div className="adm-toolbar-filters">
          <label className="adm-select-wrap">
            <span className="adm-select-label">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="adm-input adm-select"
            >
              <option value="all">All ({MOCK_SUBSCRIBERS.length})</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="unsubscribed">Unsubscribed</option>
            </select>
          </label>
          <button type="button" onClick={handleExport} className="adm-btn adm-btn-ghost">
            Export CSV
          </button>
        </div>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Status</th>
              <th>Source</th>
              <th>Subscribed</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={5} className="adm-empty">No subscribers match.</td>
              </tr>
            ) : (
              list.map((s) => (
                <tr key={s.id}>
                  <td><span className="adm-table-title">{s.email}</span></td>
                  <td>
                    <span className={`adm-pill adm-pill-${s.status}`}>{s.status}</span>
                  </td>
                  <td className="adm-table-muted">{s.source}</td>
                  <td className="adm-table-muted">
                    {formatAdminDate(s.subscribedAt)}
                    <span className="adm-table-secondary"> · {timeAgo(s.subscribedAt)}</span>
                  </td>
                  <td>
                    <div className="adm-row-actions">
                      <button
                        type="button"
                        className="adm-btn-icon adm-btn-icon-danger"
                        title="Remove subscriber"
                        aria-label={`Remove ${s.email}`}
                        onClick={() => setPendingRemove(s)}
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
        open={!!pendingRemove}
        onClose={() => setPendingRemove(null)}
        onConfirm={() => {
          logAction('subscriber.remove', {
            type:  'subscriber',
            id:    pendingRemove?.id,
            label: pendingRemove?.email,
          });
          const user = getUser();
          setFeedback(`Removed ${pendingRemove?.email} (by ${user?.email || 'admin'}). Removal will persist once the backend is wired up.`);
        }}
        title="Remove subscriber?"
        body={
          <p className="adm-modal-text">
            <strong style={{ color: 'var(--text)' }}>{pendingRemove?.email}</strong>
            <br />
            They'll stop receiving newsletters. They can re-subscribe at any time.
          </p>
        }
        confirmLabel="Remove"
        destructive
      />
    </>
  );
}

/* ─── Compose form ─── */
function ComposeForm() {
  const [subject, setSubject] = useState('');
  const [preheader, setPreheader] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('confirmed');
  const [status, setStatus] = useState('idle'); // 'idle' | 'sending' | 'sent'

  const recipientCount = MOCK_SUBSCRIBERS.filter((s) => {
    if (audience === 'confirmed') return s.status === 'confirmed';
    if (audience === 'all')       return s.status !== 'unsubscribed';
    return false;
  }).length;

  const handleSend = async (e) => {
    e.preventDefault();
    setStatus('sending');
    await new Promise((r) => setTimeout(r, 700));
    logAction('newsletter.send', {
      type:  'newsletter',
      id:    `nl_${Date.now()}`,
      label: subject,
    }, {
      audience,
      recipientCount,
    });
    setStatus('sent');
  };

  if (status === 'sent') {
    return (
      <div className="adm-panel adm-compose-success">
        <div className="adm-panel-body" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div className="adm-success-mark" aria-hidden>✓</div>
          <h2 style={{ marginTop: 16, fontSize: 22, fontWeight: 500 }}>
            Newsletter <span className="gf-serif" style={{ color: 'var(--green)' }}>queued</span>.
          </h2>
          <p style={{ marginTop: 12, color: 'var(--muted)', maxWidth: 420, marginInline: 'auto' }}>
            Sent by <span style={{ color: 'var(--text)' }}>{getUser()?.email || 'admin'}</span> just now.
            Once the backend is wired up, this will reach {recipientCount} subscriber{recipientCount === 1 ? '' : 's'}.
          </p>
          <button
            type="button"
            onClick={() => { setSubject(''); setPreheader(''); setBody(''); setStatus('idle'); }}
            className="adm-btn adm-btn-ghost"
            style={{ marginTop: 24 }}
          >
            Compose another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSend} className="adm-compose">
      <div className="adm-panel">
        <div className="adm-panel-body">
          <label className="adm-field">
            <span className="adm-field-label">Subject</span>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What's the email about?"
              className="adm-input adm-input-lg"
              disabled={status === 'sending'}
            />
          </label>

          <label className="adm-field">
            <span className="adm-field-label">
              Preheader
              <span className="adm-field-hint">shows after the subject in most inboxes</span>
            </span>
            <input
              type="text"
              value={preheader}
              onChange={(e) => setPreheader(e.target.value)}
              placeholder="A short hook to entice opens…"
              className="adm-input"
              disabled={status === 'sending'}
            />
          </label>

          <label className="adm-field">
            <span className="adm-field-label">Body</span>
            <textarea
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={14}
              placeholder="Write the email body. Plain text for now — rich formatting comes when the backend lands."
              className="adm-input adm-textarea"
              disabled={status === 'sending'}
            />
          </label>
        </div>
      </div>

      <div className="adm-compose-footer">
        <label className="adm-select-wrap">
          <span className="adm-select-label">Audience</span>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="adm-input adm-select"
            disabled={status === 'sending'}
          >
            <option value="confirmed">
              Confirmed only ({MOCK_SUBSCRIBERS.filter((s) => s.status === 'confirmed').length})
            </option>
            <option value="all">
              All active ({MOCK_SUBSCRIBERS.filter((s) => s.status !== 'unsubscribed').length})
            </option>
          </select>
        </label>

        <span className="adm-compose-recipients">
          → {recipientCount} recipient{recipientCount === 1 ? '' : 's'}
        </span>

        <button
          type="submit"
          disabled={status === 'sending' || !subject || !body}
          className="adm-btn adm-btn-primary"
        >
          {status === 'sending' ? 'Sending…' : 'Send newsletter →'}
        </button>
      </div>
    </form>
  );
}