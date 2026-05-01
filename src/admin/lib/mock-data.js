/**
 * Mock data for admin views, until the backend exists.
 *
 * When the real API lands, replace these arrays with fetch calls. The shape
 * here matches what each admin component expects, so frontend stays stable.
 */

/* ─── Contact form messages ─── */
export const MOCK_MESSAGES = [
  {
    id: 'msg_001',
    receivedAt: '2026-04-28T14:32:00Z',
    status: 'unread', // 'unread' | 'read' | 'archived'
    contactName: 'Sarah Onuoha',
    contactEmail: 'sarah.onuoha@brightedge.com',
    companyName: 'Brightedge Logistics',
    companyEmail: 'hello@brightedge.com',
    country: 'Nigeria',
    sector: 'Retail',
    serviceType: 'Workflow Automation',
    serviceTypeOther: '',
    message: "We've outgrown our spreadsheet-based dispatch tracking. Looking for advice on what tools to consider and a rough sense of timeline. Team of 28, three warehouse locations.",
  },
  {
    id: 'msg_002',
    receivedAt: '2026-04-27T09:18:00Z',
    status: 'unread',
    contactName: 'David Kim',
    contactEmail: 'd.kim@northridgehealth.ie',
    companyName: 'Northridge Health',
    companyEmail: 'info@northridgehealth.ie',
    country: 'Ireland',
    sector: 'Healthcare',
    serviceType: 'Digital Transformation',
    serviceTypeOther: '',
    message: 'Board has approved budget for a 12-month digital transformation program. Would like to scope a discovery engagement before we commit. When could we have an introductory call?',
  },
  {
    id: 'msg_003',
    receivedAt: '2026-04-25T16:45:00Z',
    status: 'read',
    contactName: 'Maria Castelli',
    contactEmail: 'maria@castellitextiles.it',
    companyName: 'Castelli Textiles',
    companyEmail: 'studio@castellitextiles.it',
    country: 'Italy',
    sector: 'Other',
    serviceType: 'Other',
    serviceTypeOther: 'ERP migration audit',
    message: "We're mid-migration from an in-house ERP to Odoo and our integrator left us hanging. Need a second opinion on what they completed vs what's still outstanding.",
  },
  {
    id: 'msg_004',
    receivedAt: '2026-04-22T11:02:00Z',
    status: 'read',
    contactName: 'James Okafor',
    contactEmail: 'james@treelinevc.com',
    companyName: 'Treeline Ventures',
    companyEmail: 'hello@treelinevc.com',
    country: 'Nigeria',
    sector: 'Finance',
    serviceType: 'Business Analysis',
    serviceTypeOther: '',
    message: 'Doing technical due-diligence on a portfolio company. Their tech lead just left and we need someone to evaluate what they actually have under the hood. Engagement would be ~2 weeks.',
  },
  {
    id: 'msg_005',
    receivedAt: '2026-04-19T08:30:00Z',
    status: 'archived',
    contactName: 'Anna Lindqvist',
    contactEmail: 'anna@flux.se',
    companyName: 'Flux Studio',
    companyEmail: '',
    country: 'Sweden',
    sector: 'Technology',
    serviceType: 'Digital Transformation',
    serviceTypeOther: '',
    message: 'Curious about your approach for very small teams (we are 6 people). Most consultancies seem aimed at much larger orgs.',
  },
];

/* ─── Newsletter subscribers ─── */
export const MOCK_SUBSCRIBERS = [
  { id: 'sub_001', email: 'sarah.onuoha@brightedge.com', subscribedAt: '2026-04-28T14:33:10Z', status: 'confirmed', source: 'footer' },
  { id: 'sub_002', email: 'mike.brennan@gmail.com',     subscribedAt: '2026-04-26T19:08:44Z', status: 'confirmed', source: 'blog'   },
  { id: 'sub_003', email: 'p.delacroix@havre-conseil.fr', subscribedAt: '2026-04-25T11:21:09Z', status: 'pending',   source: 'footer' },
  { id: 'sub_004', email: 'anna@flux.se',                subscribedAt: '2026-04-22T08:30:55Z', status: 'confirmed', source: 'footer' },
  { id: 'sub_005', email: 'james@treelinevc.com',        subscribedAt: '2026-04-21T16:42:30Z', status: 'confirmed', source: 'blog'   },
  { id: 'sub_006', email: 'maria@castellitextiles.it',   subscribedAt: '2026-04-19T12:18:00Z', status: 'confirmed', source: 'footer' },
  { id: 'sub_007', email: 'd.kim@northridgehealth.ie',   subscribedAt: '2026-04-18T09:50:12Z', status: 'confirmed', source: 'footer' },
  { id: 'sub_008', email: 'curious@example.com',         subscribedAt: '2026-04-15T22:04:19Z', status: 'unsubscribed', source: 'footer' },
];

/* ─── Quick stats for dashboard ─── */
export function dashboardStats() {
  return {
    posts:           5,                                                  // matches src/data/posts.js
    drafts:          0,
    messages:        MOCK_MESSAGES.length,
    unreadMessages:  MOCK_MESSAGES.filter((m) => m.status === 'unread').length,
    subscribers:     MOCK_SUBSCRIBERS.filter((s) => s.status === 'confirmed').length,
    pendingSubs:     MOCK_SUBSCRIBERS.filter((s) => s.status === 'pending').length,
  };
}

/* ─── Date formatter shared across admin views ─── */
export function formatAdminDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatAdminDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function timeAgo(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs  = now - d;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr  = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1)   return 'just now';
  if (diffMin < 60)  return `${diffMin}m ago`;
  if (diffHr  < 24)  return `${diffHr}h ago`;
  if (diffDay < 7)   return `${diffDay}d ago`;
  return formatAdminDate(iso);
}
