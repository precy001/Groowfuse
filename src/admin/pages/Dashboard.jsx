/**
 * Admin Dashboard.
 *
 * Stat cards on top. Below: two-column activity area — recent contact
 * messages on the left, audit-log activity on the right.
 *
 * The "Take the tour" link sits in the page-actions row so first-time admins
 * who skip can come back to it whenever.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  dashboardStats,
  MOCK_MESSAGES,
  timeAgo,
} from '../lib/mock-data';
import {
  getRecentActions,
  describeAction,
  onAuditChange,
} from '../lib/audit-log';
import { onTourChange, openTour, resetForUser } from '../lib/tour';
import { getUser } from '../lib/auth';

export default function Dashboard() {
  const stats = dashboardStats();

  const recentMessages = [...MOCK_MESSAGES]
    .sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt))
    .slice(0, 4);

  // Audit feed — re-renders whenever an action is logged anywhere
  const [recentActions, setRecentActions] = useState(() => getRecentActions(8));
  useEffect(() => {
    const unsub = onAuditChange((next) => setRecentActions(next));
    return unsub;
  }, []);

  // Force a re-render if the tour state changes (so we can show "Take the tour" )
  const [, setTourTick] = useState(0);
  useEffect(() => onTourChange(() => setTourTick((n) => n + 1)), []);

  return (
    <div className="adm-dashboard">
      {/* Page header */}
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

      {/* Stat cards */}
      <section className="adm-stats">
        <StatCard
          label="Published posts"
          value={stats.posts}
          sub={stats.drafts > 0 ? `${stats.drafts} draft${stats.drafts === 1 ? '' : 's'}` : 'No drafts'}
          to="/admin/posts"
          accent="green"
        />
        <StatCard
          label="Messages"
          value={stats.messages}
          sub={stats.unreadMessages > 0 ? `${stats.unreadMessages} unread` : 'All read'}
          to="/admin/messages"
          accent={stats.unreadMessages > 0 ? 'green' : 'neutral'}
          alert={stats.unreadMessages > 0}
        />
        <StatCard
          label="Subscribers"
          value={stats.subscribers}
          sub={stats.pendingSubs > 0 ? `${stats.pendingSubs} pending confirmation` : 'All confirmed'}
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

      {/* Two-column activity */}
      <section className="adm-grid-2">
        {/* Recent messages — incoming engagement */}
        <article className="adm-panel" data-tour-id="dashboard-messages">
          <header className="adm-panel-header">
            <div>
              <span className="adm-eyebrow">Recent messages</span>
              <h2 className="adm-panel-title">Inbox</h2>
            </div>
            <Link to="/admin/messages" className="adm-link-sm">
              View all →
            </Link>
          </header>
          <ul className="adm-activity">
            {recentMessages.map((m) => (
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
        </article>

        {/* Audit activity — who did what */}
        <article className="adm-panel" data-tour-id="dashboard-audit">
          <header className="adm-panel-header">
            <div>
              <span className="adm-eyebrow">Activity log</span>
              <h2 className="adm-panel-title">Recent actions</h2>
            </div>
          </header>
          {recentActions.length === 0 ? (
            <div className="adm-empty" style={{ padding: '32px 18px' }}>
              No actions yet — once you publish, archive, or send something, it'll show here.
            </div>
          ) : (
            <ul className="adm-activity">
              {recentActions.map((entry) => (
                <li key={entry.id}>
                  <div className="adm-activity-row" style={{ cursor: 'default' }}>
                    <span className="adm-audit-avatar" aria-hidden>
                      {(entry.user.email || 'A').charAt(0).toUpperCase()}
                    </span>
                    <div className="adm-activity-body">
                      <div className="adm-activity-top">
                        <span className="adm-activity-name">
                          <span style={{ color: 'var(--green)' }}>{entry.user.email}</span>{' '}
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

/* ─── Stat card ─── */
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