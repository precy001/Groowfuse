/**
 * Analytics page.
 * --------------------------------------------------------
 * Single-call dashboard. Pulls everything from /admin/analytics.php and
 * renders summary cards + 6 charts.
 *
 * Range selector flips the API call to 7d / 30d / 90d. Recharts handles
 * the visualizations; styles match the dark admin theme via CSS vars
 * read from the document root.
 */

import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart, Line,
  AreaChart, Area,
  BarChart,  Bar,
  XAxis, YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useAnalytics } from '../lib/data-hooks';

const RANGE_OPTIONS = [
  { id: '7d',  label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: '90d', label: 'Last 90 days' },
];

// Colors pulled to constants so all charts harmonize
const C_GREEN  = '#1FE07A';
const C_BLUE   = '#5B8DEF';
const C_AMBER  = '#E6B800';
const C_RED    = '#E06A6A';
const C_MUTED  = '#8A8A8E';
const C_GRID   = '#1E1E22';
const C_AXIS   = '#555558';

export default function Analytics() {
  const [range, setRange] = useState('30d');
  const { data, error, loading, reload } = useAnalytics(range);

  const summary = data?.summary || {};

  return (
    <div className="adm-analytics">
      <header className="adm-page-header">
        <div>
          <span className="adm-eyebrow">Overview</span>
          <h1 className="adm-page-title">Analytics</h1>
          <p className="adm-page-sub">
            Site traffic, content performance, and engagement.
          </p>
        </div>
        <div className="adm-page-actions">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="adm-input adm-select"
          >
            {RANGE_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={reload}
            className="adm-btn adm-btn-ghost"
            disabled={loading}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </header>

      {error && (
        <div className="adm-feedback" role="alert" style={{ borderColor: 'var(--red)', color: 'var(--red)', marginBottom: 16 }}>
          Could not load analytics: {error.message}
          <button type="button" onClick={reload} className="adm-btn adm-btn-ghost" style={{ marginLeft: 12 }}>
            Retry
          </button>
        </div>
      )}

      {/* Summary cards */}
      <section className="adm-stats">
        <Stat label="Page views"       data={summary.visits} />
        <Stat label="Unique visitors"  data={summary.uniqueVisitors} />
        <Stat label="New posts"        data={summary.posts} />
        <Stat label="New subscribers"  data={summary.subscribers} />
        <Stat label="New messages"     data={summary.messages} />
      </section>

      {/* Charts */}
      <section className="adm-grid-2">
        <ChartPanel title="Visits over time" subtitle="Page views and unique visitors per day" loading={loading}>
          <VisitsChart points={data?.visitsOverTime || []} />
        </ChartPanel>

        <ChartPanel title="Subscriber growth" subtitle="Cumulative confirmed subscribers" loading={loading}>
          <SubscriberGrowthChart points={data?.subscriberGrowth || []} />
        </ChartPanel>
      </section>

      <section className="adm-grid-2">
        <ChartPanel title="Top pages" subtitle="Most-visited paths in the selected range" loading={loading}>
          <TopPagesChart points={data?.topPages || []} />
        </ChartPanel>

        <ChartPanel title="Top referrers" subtitle="Where visitors came from" loading={loading}>
          <TopReferrersChart points={data?.topReferrers || []} />
        </ChartPanel>
      </section>

      <section className="adm-grid-2">
        <ChartPanel title="Message volume" subtitle="Contact-form submissions per day" loading={loading}>
          <MessageVolumeChart points={data?.messageVolume || []} />
        </ChartPanel>

        <ChartPanel title="Admin activity" subtitle="Audit-log entries by user" loading={loading}>
          <AuditByUserChart points={data?.auditByUser || []} />
        </ChartPanel>
      </section>

      <section>
        <ChartPanel title="Content by category" subtitle="Published posts grouped by category" loading={loading}>
          <ContentByCategoryChart points={data?.contentByCategory || []} />
        </ChartPanel>
      </section>
    </div>
  );
}

/* ─── Summary stat card ──────────────────────────────────────────── */
function Stat({ label, data = {} }) {
  const total = data.total ?? 0;
  const delta = data.delta;

  let deltaText = '—';
  let deltaClass = 'neutral';
  if (delta === null) {
    deltaText  = 'New';
    deltaClass = 'positive';
  } else if (typeof delta === 'number') {
    const sign = delta > 0 ? '+' : '';
    deltaText  = `${sign}${delta}%`;
    deltaClass = delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral';
  }

  return (
    <div className="adm-stat-card">
      <div className="adm-stat-head">
        <span className="adm-stat-label">{label}</span>
      </div>
      <span className="adm-stat-value adm-stat-value-green">
        {total.toLocaleString()}
      </span>
      <span className={`adm-stat-sub adm-stat-delta-${deltaClass}`}>
        {deltaText} vs previous
      </span>
    </div>
  );
}

/* ─── Chart panel wrapper ────────────────────────────────────────── */
function ChartPanel({ title, subtitle, loading, children }) {
  return (
    <article className="adm-panel">
      <header className="adm-panel-header">
        <div>
          <span className="adm-eyebrow">{subtitle}</span>
          <h2 className="adm-panel-title">{title}</h2>
        </div>
      </header>
      <div className="adm-chart-wrap">
        {loading ? (
          <div className="adm-empty" style={{ padding: '60px 20px' }}>Loading…</div>
        ) : (
          children
        )}
      </div>
    </article>
  );
}

/* ─── Tooltip styling (shared) ──────────────────────────────────── */
const tooltipStyle = {
  background: '#0F0F11',
  border: '1px solid #2A2A30',
  borderRadius: 6,
  fontSize: 12,
  color: '#F5F5F4',
};
const tooltipLabel = { color: '#8A8A8E', marginBottom: 4 };

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function shortPath(path) {
  if (!path) return '';
  return path.length > 28 ? path.slice(0, 26) + '…' : path;
}

/* ─── Charts ─────────────────────────────────────────────────────── */

function VisitsChart({ points }) {
  if (!points.length) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={points} margin={{ top: 10, right: 16, bottom: 0, left: -12 }}>
        <CartesianGrid stroke={C_GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tickFormatter={fmtDate} stroke={C_AXIS} fontSize={11} />
        <YAxis stroke={C_AXIS} fontSize={11} allowDecimals={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={tooltipLabel}
          labelFormatter={fmtDate}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: C_MUTED }} iconSize={8} />
        <Line type="monotone" dataKey="visits"  stroke={C_GREEN} strokeWidth={2} dot={false} name="Page views" />
        <Line type="monotone" dataKey="uniques" stroke={C_BLUE}  strokeWidth={2} dot={false} name="Unique visitors" />
      </LineChart>
    </ResponsiveContainer>
  );
}

function SubscriberGrowthChart({ points }) {
  if (!points.length) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={points} margin={{ top: 10, right: 16, bottom: 0, left: -12 }}>
        <defs>
          <linearGradient id="subFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={C_GREEN} stopOpacity={0.4} />
            <stop offset="100%" stopColor={C_GREEN} stopOpacity={0}   />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={C_GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tickFormatter={fmtDate} stroke={C_AXIS} fontSize={11} />
        <YAxis stroke={C_AXIS} fontSize={11} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabel} labelFormatter={fmtDate} />
        <Area type="monotone" dataKey="total" stroke={C_GREEN} strokeWidth={2} fill="url(#subFill)" name="Subscribers" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function MessageVolumeChart({ points }) {
  if (!points.length) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={points} margin={{ top: 10, right: 16, bottom: 0, left: -12 }}>
        <CartesianGrid stroke={C_GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tickFormatter={fmtDate} stroke={C_AXIS} fontSize={11} />
        <YAxis stroke={C_AXIS} fontSize={11} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabel} labelFormatter={fmtDate} />
        <Bar dataKey="count" fill={C_AMBER} radius={[3, 3, 0, 0]} name="Messages" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function TopPagesChart({ points }) {
  if (!points.length) return <Empty />;
  const data = points.map((p) => ({ ...p, label: shortPath(p.path) }));
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 32)}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={C_GRID} strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" stroke={C_AXIS} fontSize={11} allowDecimals={false} />
        <YAxis type="category" dataKey="label" stroke={C_AXIS} fontSize={11} width={150} />
        <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabel} />
        <Bar dataKey="count" fill={C_GREEN} radius={[0, 3, 3, 0]} name="Views" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function TopReferrersChart({ points }) {
  if (!points.length) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, points.length * 32)}>
      <BarChart data={points} layout="vertical" margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={C_GRID} strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" stroke={C_AXIS} fontSize={11} allowDecimals={false} />
        <YAxis type="category" dataKey="referrer" stroke={C_AXIS} fontSize={11} width={120} />
        <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabel} />
        <Bar dataKey="count" fill={C_BLUE} radius={[0, 3, 3, 0]} name="Visits" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function AuditByUserChart({ points }) {
  if (!points.length) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, points.length * 32)}>
      <BarChart data={points} layout="vertical" margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={C_GRID} strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" stroke={C_AXIS} fontSize={11} allowDecimals={false} />
        <YAxis type="category" dataKey="user" stroke={C_AXIS} fontSize={11} width={170} />
        <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabel} />
        <Bar dataKey="count" fill={C_GREEN} radius={[0, 3, 3, 0]} name="Actions" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function ContentByCategoryChart({ points }) {
  if (!points.length) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={points} margin={{ top: 10, right: 16, bottom: 0, left: -12 }}>
        <CartesianGrid stroke={C_GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="category" stroke={C_AXIS} fontSize={11} />
        <YAxis stroke={C_AXIS} fontSize={11} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabel} />
        <Bar dataKey="count" fill={C_GREEN} radius={[3, 3, 0, 0]} name="Posts" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function Empty() {
  return (
    <div className="adm-empty" style={{ padding: '60px 20px' }}>
      No data in this range yet.
    </div>
  );
}
