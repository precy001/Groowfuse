/**
 * Admin Dashboard. Shows quick stats plus a feed of recent activity
 * (latest messages, latest subscribers).
 */

import { Link } from 'react-router-dom';
import {
  dashboardStats,
  MOCK_MESSAGES,
  MOCK_SUBSCRIBERS,
  timeAgo,
} from '../lib/mock-data';

export default function Dashboard() {
  const stats = dashboardStats();

  const recentMessages = [...MOCK_MESSAGES]
    .sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt))
    .slice(0, 4);

  const recentSubs = [...MOCK_SUBSCRIBERS]
    .sort((a, b) => new Date(b.subscribedAt) - new Date(a.subscribedAt))
    .slice(0, 5);

  return (
    <div className="adm-dashboard">
      {/* Page header */}
      <header className="adm-page-header">
        <div>
          <span className="adm-eyebrow">Overview</span>
          <h1 className="adm-page-title">Dashboard</h1>
        </div>
        <div className="adm-page-actions">
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

        {/* Recent subscribers */}
        <article className="adm-panel">
          <header className="adm-panel-header">
            <div>
              <span className="adm-eyebrow">Recent subscribers</span>
              <h2 className="adm-panel-title">Newsletter</h2>
            </div>
            <Link to="/admin/newsletter" className="adm-link-sm">
              View all →
            </Link>
          </header>
          <ul className="adm-list">
            {recentSubs.map((s) => (
              <li key={s.id} className="adm-list-row">
                <span className="adm-list-primary">{s.email}</span>
                <span className="adm-list-meta">
                  <span className={`adm-pill adm-pill-${s.status}`}>{s.status}</span>
                  <span className="adm-list-time">{timeAgo(s.subscribedAt)}</span>
                </span>
              </li>
            ))}
          </ul>
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
