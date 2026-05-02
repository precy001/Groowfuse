/**
 * Newsletter — admin view.
 *
 * Reads from GET /admin/subscribers.php
 * Remove via DELETE /admin/subscribers.php?id=
 * Send via POST /admin/newsletter-send.php
 */

import { useMemo, useState } from 'react';
import ConfirmModal from '../components/ConfirmModal';
import { formatAdminDate, timeAgo } from '../lib/format';
import { useSubscribers } from '../lib/data-hooks';
import { useAsyncCallback } from '../../lib/use-async';
import { api } from '../../lib/api';
import { getUser } from '../lib/auth';

export default function Newsletter() {
  const [view, setView] = useState('subscribers'); // 'subscribers' | 'compose'

  const subs = useSubscribers('all');
  const counts = subs.data?.counts || { confirmed: 0, pending: 0, unsubscribed: 0, total: 0 };

  return (
    <div className="adm-newsletter">
      <header className="adm-page-header">
        <div>
          <span className="adm-eyebrow">Engagement</span>
          <h1 className="adm-page-title">Newsletter</h1>
          <p className="adm-page-sub">
            {counts.confirmed} confirmed · {counts.pending} pending · {counts.unsubscribed} unsubscribed
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

      {view === 'subscribers'
        ? <SubscribersTable subs={subs} counts={counts} />
        : <ComposeForm counts={counts} />}
    </div>
  );
}

/* ─── Subscribers table ─── */
function SubscribersTable({ subs, counts }) {
  const [query, setQuery]               = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pendingRemove, setPendingRemove] = useState(null);
  const [feedback, setFeedback]         = useState('');

  const remover = useAsyncCallback((id) => api.del(`/admin/subscribers.php?id=${id}`));

  const list = useMemo(() => {
    let l = subs.data?.subscribers || [];
    if (statusFilter !== 'all') l = l.filter((s) => s.status === statusFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      l = l.filter((s) => s.email.toLowerCase().includes(q));
    }
    return l;
  }, [subs.data, query, statusFilter]);

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
      {subs.error && (
        <div className="adm-feedback" role="alert" style={{ borderColor: 'var(--red)', color: 'var(--red)', marginBottom: 16 }}>
          Could not load subscribers: {subs.error.message}
          <button type="button" onClick={subs.reload} className="adm-btn adm-btn-ghost" style={{ marginLeft: 12 }}>
            Retry
          </button>
        </div>
      )}

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
              <option value="all">All ({counts.total})</option>
              <option value="confirmed">Confirmed ({counts.confirmed})</option>
              <option value="pending">Pending ({counts.pending})</option>
              <option value="unsubscribed">Unsubscribed ({counts.unsubscribed})</option>
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
            {subs.loading ? (
              <tr><td colSpan={5} className="adm-empty">Loading…</td></tr>
            ) : list.length === 0 ? (
              <tr><td colSpan={5} className="adm-empty">No subscribers match.</td></tr>
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
        onConfirm={async () => {
          if (!pendingRemove) return;
          try {
            await remover.run(pendingRemove.id);
            const user = getUser();
            setFeedback(`Removed ${pendingRemove.email} (by ${user?.email || 'admin'}).`);
            subs.reload();
          } catch (err) {
            setFeedback(`Could not remove: ${err.message}`);
          }
        }}
        title="Remove subscriber?"
        body={
          <p className="adm-modal-text">
            <strong style={{ color: 'var(--text)' }}>{pendingRemove?.email}</strong>
            <br />
            They'll stop receiving newsletters. They can re-subscribe at any time.
          </p>
        }
        confirmLabel={remover.loading ? 'Removing…' : 'Remove'}
        destructive
      />
    </>
  );
}

/* ─── Compose form ─── */
function ComposeForm({ counts }) {
  const [subject, setSubject]     = useState('');
  const [preheader, setPreheader] = useState('');
  const [body, setBody]           = useState('');
  const [audience, setAudience]   = useState('confirmed');
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState('');

  const sender = useAsyncCallback((payload) => api.post('/admin/newsletter-send.php', payload));

  const recipientCount = audience === 'confirmed'
    ? counts.confirmed
    : (counts.confirmed + counts.pending);

  const handleSend = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await sender.run({ subject, preheader, body, audience });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Could not send.');
    }
  };

  if (result) {
    return (
      <div className="adm-panel adm-compose-success">
        <div className="adm-panel-body" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div className="adm-success-mark" aria-hidden>✓</div>
          <h2 style={{ marginTop: 16, fontSize: 22, fontWeight: 500 }}>
            Newsletter <span className="gf-serif" style={{ color: 'var(--green)' }}>sent</span>.
          </h2>
          <p style={{ marginTop: 12, color: 'var(--muted)', maxWidth: 460, marginInline: 'auto' }}>
            Sent by <span style={{ color: 'var(--text)' }}>{getUser()?.email || 'admin'}</span> to{' '}
            <strong style={{ color: 'var(--text)' }}>{result.recipientCount}</strong> recipient{result.recipientCount === 1 ? '' : 's'}
            {typeof result.failed === 'number' && result.failed > 0 ? ` (${result.failed} failed)` : ''}.
          </p>
          <button
            type="button"
            onClick={() => { setSubject(''); setPreheader(''); setBody(''); setResult(null); }}
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
              disabled={sender.loading}
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
              disabled={sender.loading}
            />
          </label>

          <label className="adm-field">
            <span className="adm-field-label">Body</span>
            <textarea
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={14}
              placeholder="Write the email body. Plain text supported."
              className="adm-input adm-textarea"
              disabled={sender.loading}
            />
          </label>

          {error && <p className="adm-modal-error" role="alert">{error}</p>}
        </div>
      </div>

      <div className="adm-compose-footer">
        <label className="adm-select-wrap">
          <span className="adm-select-label">Audience</span>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="adm-input adm-select"
            disabled={sender.loading}
          >
            <option value="confirmed">Confirmed only ({counts.confirmed})</option>
            <option value="all">All active ({counts.confirmed + counts.pending})</option>
          </select>
        </label>

        <span className="adm-compose-recipients">
          → {recipientCount} recipient{recipientCount === 1 ? '' : 's'}
        </span>

        <button
          type="submit"
          disabled={sender.loading || !subject || !body}
          className="adm-btn adm-btn-primary"
        >
          {sender.loading ? 'Sending…' : 'Send newsletter →'}
        </button>
      </div>
    </form>
  );
}