/**
 * Shared formatters for admin views.
 * --------------------------------------------------------
 * These previously lived in mock-data.js alongside the fake data.
 * Mock data is gone; formatters stay because every admin page uses them.
 */

export function formatAdminDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatAdminDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function timeAgo(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';

  const now      = new Date();
  const diffMs   = now - d;
  const diffMin  = Math.floor(diffMs / 60_000);
  const diffHr   = Math.floor(diffMs / 3_600_000);
  const diffDay  = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1)   return 'just now';
  if (diffMin < 60)  return `${diffMin}m ago`;
  if (diffHr  < 24)  return `${diffHr}h ago`;
  if (diffDay < 7)   return `${diffDay}d ago`;
  return formatAdminDate(iso);
}
