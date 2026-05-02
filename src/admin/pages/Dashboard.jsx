/**
 * Admin Dashboard.
 *
 * All data is live now:
 *   - GET /admin/dashboard-stats.php   for counters
 *   - GET /admin/messages.php?status=inbox  for recent enquiries
 *   - GET /admin/audit-log.php          for activity feed
 *
 * The "Take the tour" button still works — tour state is local-only
 * (per-user-per-device localStorage flag) which is fine since the tour
 * is purely a UI concern, not data.
 */

import { Link } from 'react-router-dom';
import { useDashboardStats, useMessages } from '../lib/data-hooks';
import { useRecentActions, describeAction } from '../lib/audit-log';
import { timeAgo } from '../lib/format';
import { openTour, resetForUser } from '../lib/tour';
import { getUser } from '../lib/auth';

export default function Dashboard() {
  const stats          = useDashboardStats();
  const inbox          = useMessages('inbox');
  const recentActions  = useRecentActions(8);

  const s = stats.data || {};
  const messages = (inbox.data?.messages || []).slice(0, 4);
  const actions  = recentActions.data?.actions || [];

  return (
    <div className="adm-dashboard">
      <header className="adm-page-header">
        <div>
          <span className="adm-eyebrow">Overview</span>
          <h1 className="adm-page-title">Dashboard</h1>
        </div>
        <div className="adm-page-actions">
          <button
            type="button"
            onClick={() => {
              const user = getUser();
              if (user) resetForUser(user.email);
              openTour();
            }}
            className="adm-btn adm-btn-ghost"
            title="Walk through the admin panel"
          >
            ↺ Take the tour
          </button>
          <Link to="/admin/posts/new" className="adm-btn adm-btn-primary">
            New post →
          </Link>
        </div>
      </header>

      {stats.error && (
        <div className="adm-feedback" role="alert" style={{ borderColor: 'var(--red)', color: 'var(--red)', marginBottom: 16 }}>
          Could not load stats: {stats.error.message}
          <button type="button" onClick={stats.reload} className="adm-btn adm-btn-ghost" style={{ marginLeft: 12 }}>
            Retry
          </button>
        </div>
      )}

      <section className="adm-stats">
        <StatCard
          label="Published posts"
          value={stats.loading ? '…' : (s.posts ?? 0)}
          sub={s.drafts > 0 ? `${s.drafts} draft${s.drafts === 1 ? '' : 's'}` : 'No drafts'}
          to="/admin/posts"
          accent="green"
        />
        <StatCard
          label="Messages"
          value={stats.loading ? '…' : (s.messages ?? 0)}
          sub={s.unreadMessages > 0 ? `${s.unreadMessages} unread` : 'All read'}
          to="/admin/messages"
          accent={s.unreadMessages > 0 ? 'green' : 'neutral'}
          alert={s.unreadMessages > 0}
        />
        <StatCard
          label="Subscribers"
          value={stats.loading ? '…' : (s.subscribers ?? 0)}
          sub={s.pendingSubs > 0 ? `${s.pendingSubs} pending confirmation` : 'All confirmed'}
          to="/admin/newsletter"
          accent="neutral"
        />
        <StatCard
          label="Site health"
          value="●"
          valueClass="adm-stat-value-pulse"
          sub="All systems normal"
          accent="neutral"
        />
      </section>

      <section className="adm-grid-2">
        {/* Recent messages */}
        <article className="adm-panel">
          <header className="adm-panel-header">
            <div>
              <span className="adm-eyebrow">Recent messages</span>
              <h2 className="adm-panel-title">Inbox</h2>
            </div>
            <Link to="/admin/messages" className="adm-link-sm">
              View all →
            </Link>
          </header>
          {inbox.loading ? (
            <div className="adm-empty" style={{ padding: '32px 18px' }}>Loading…</div>
          ) : inbox.error ? (
            <div className="adm-empty" style={{ padding: '32px 18px', color: 'var(--red)' }}>
              {inbox.error.message}
            </div>
          ) : messages.length === 0 ? (
            <div className="adm-empty" style={{ padding: '32px 18px' }}>
              No incoming messages yet.
            </div>
          ) : (
            <ul className="adm-activity">
              {messages.map((m) => (
                <li key={m.id}>
                  <Link to={`/admin/messages/${m.id}`} className="adm-activity-row">
                    <span className={`adm-dot ${m.status === 'unread' ? 'is-unread' : ''}`} aria-hidden />
                    <div className="adm-activity-body">
                      <div className="adm-activity-top">
                        <span className="adm-activity-name">{m.contactName}</span>
                        <span className="adm-activity-time">{timeAgo(m.receivedAt)}</span>
                      </div>
                      <span className="adm-activity-meta">
                        {m.companyName} · {m.serviceType || '—'}
                      </span>
                      <span className="adm-activity-preview">{m.message}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </article>

        {/* Audit activity */}
        <article className="adm-panel">
          <header className="adm-panel-header">
            <div>
              <span className="adm-eyebrow">Activity log</span>
              <h2 className="adm-panel-title">Recent actions</h2>
            </div>
            <button type="button" onClick={recentActions.reload} className="adm-link-sm" style={{ background: 'none', border: 0, cursor: 'pointer' }}>
              Refresh
            </button>
          </header>
          {recentActions.loading ? (
            <div className="adm-empty" style={{ padding: '32px 18px' }}>Loading…</div>
          ) : recentActions.error ? (
            <div className="adm-empty" style={{ padding: '32px 18px', color: 'var(--red)' }}>
              {recentActions.error.message}
            </div>
          ) : actions.length === 0 ? (
            <div className="adm-empty" style={{ padding: '32px 18px' }}>
              No actions yet — once you publish, archive, or send something, it'll show here.
            </div>
          ) : (
            <ul className="adm-activity">
              {actions.map((entry) => (
                <li key={entry.id}>
                  <div className="adm-activity-row" style={{ cursor: 'default' }}>
                    <span className="adm-audit-avatar" aria-hidden>
                      {(entry.user?.email || 'A').charAt(0).toUpperCase()}
                    </span>
                    <div className="adm-activity-body">
                      <div className="adm-activity-top">
                        <span className="adm-activity-name">
                          <span style={{ color: 'var(--green)' }}>{entry.user?.email}</span>{' '}
                          <span style={{ color: 'var(--muted)', fontWeight: 400 }}>
                            {describeAction(entry.action)}
                          </span>
                        </span>
                        <span className="adm-activity-time">{timeAgo(entry.at)}</span>
                      </div>
                      {entry.target?.label && (
                        <span className="adm-activity-meta">
                          {entry.target.label}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </div>
  );
}

function StatCard({ label, value, sub, to, accent = 'neutral', alert = false, valueClass = '' }) {
  const content = (
    <>
      <div className="adm-stat-head">
        <span className="adm-stat-label">{label}</span>
        {alert && <span className="adm-stat-alert" aria-label="Needs attention" />}
      </div>
      <span className={`adm-stat-value adm-stat-value-${accent} ${valueClass}`}>
        {value}
      </span>
      <span className="adm-stat-sub">{sub}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className="adm-stat-card adm-stat-card-link">
        {content}
      </Link>
    );
  }
  return <div className="adm-stat-card">{content}</div>;
}