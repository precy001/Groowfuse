<?php
/**
 * Analytics dashboard data.
 *
 * GET /api/admin/analytics.php?range=7d|30d|90d
 *   default range = 30d
 *
 * Returns one big payload so the frontend renders the whole page from a
 * single round-trip:
 *
 *   {
 *     range: { days, from, to },
 *     summary: {
 *       visits:        { total, prev, delta },
 *       uniqueVisitors:{ total, prev, delta },
 *       posts:         { total, prev, delta },
 *       subscribers:   { total, prev, delta },
 *       messages:      { total, prev, delta }
 *     },
 *     visitsOverTime:    [{ date, visits, uniques }, ...],
 *     topPages:          [{ path, count }, ...],
 *     topReferrers:      [{ referrer, count }, ...],
 *     subscriberGrowth:  [{ date, total }, ...],   // cumulative confirmed
 *     messageVolume:     [{ date, count }, ...],
 *     auditByUser:       [{ user, count }, ...],
 *     contentByCategory: [{ category, count }, ...]
 *   }
 *
 * `delta` is a percentage change vs the immediately preceding window of
 * the same length. Frontend formats it (e.g. "+12%" / "—").
 */

declare(strict_types=1);

require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/auth.php';

cors_or_die();
require_method('GET');
require_admin();

// ─── Range ────────────────────────────────────────────────────────
$range = $_GET['range'] ?? '30d';
$days  = match ($range) {
    '7d'  => 7,
    '90d' => 90,
    default => 30,
};

$from     = (new DateTimeImmutable("-{$days} days"))->format('Y-m-d 00:00:00');
$to       = (new DateTimeImmutable('now'))->format('Y-m-d 23:59:59');
$prevFrom = (new DateTimeImmutable('-' . ($days * 2) . ' days'))->format('Y-m-d 00:00:00');
$prevTo   = (new DateTimeImmutable("-{$days} days"))->format('Y-m-d 23:59:59');

// ─── Helper for safe percent delta ─────────────────────────────────
function pct_delta(int $current, int $prev): ?float {
    if ($prev === 0) return $current > 0 ? null : 0.0;   // null = "new"
    return round((($current - $prev) / $prev) * 100, 1);
}

function summary_pair(string $sql, array $paramsCurrent, array $paramsPrev): array {
    $stmt = db()->prepare($sql);
    $stmt->execute($paramsCurrent);
    $current = (int)$stmt->fetch()['n'];

    $stmt->execute($paramsPrev);
    $prev = (int)$stmt->fetch()['n'];

    return [
        'total' => $current,
        'prev'  => $prev,
        'delta' => pct_delta($current, $prev),
    ];
}

// ─── Summary cards ─────────────────────────────────────────────────
$visits = summary_pair(
    'SELECT COUNT(*) AS n FROM page_views WHERE created_at BETWEEN :from AND :to',
    [':from' => $from, ':to' => $to],
    [':from' => $prevFrom, ':to' => $prevTo]
);

$uniqueVisitors = summary_pair(
    'SELECT COUNT(DISTINCT visitor_hash) AS n FROM page_views WHERE created_at BETWEEN :from AND :to',
    [':from' => $from, ':to' => $to],
    [':from' => $prevFrom, ':to' => $prevTo]
);

$posts = summary_pair(
    'SELECT COUNT(*) AS n FROM posts WHERE status = "published" AND COALESCE(published_at, created_at) BETWEEN :from AND :to',
    [':from' => $from, ':to' => $to],
    [':from' => $prevFrom, ':to' => $prevTo]
);

$subscribers = summary_pair(
    'SELECT COUNT(*) AS n FROM subscribers WHERE status = "confirmed" AND subscribed_at BETWEEN :from AND :to',
    [':from' => $from, ':to' => $to],
    [':from' => $prevFrom, ':to' => $prevTo]
);

$messages = summary_pair(
    'SELECT COUNT(*) AS n FROM messages WHERE received_at BETWEEN :from AND :to',
    [':from' => $from, ':to' => $to],
    [':from' => $prevFrom, ':to' => $prevTo]
);

// ─── Visits over time (per day) ────────────────────────────────────
$stmt = db()->prepare(
    'SELECT DATE(created_at) AS day,
            COUNT(*) AS visits,
            COUNT(DISTINCT visitor_hash) AS uniques
       FROM page_views
      WHERE created_at BETWEEN :from AND :to
      GROUP BY day
      ORDER BY day ASC'
);
$stmt->execute([':from' => $from, ':to' => $to]);
$visitsOverTime = fill_daily_series(
    $stmt->fetchAll(),
    'day',
    $from,
    $to,
    fn($row) => [
        'visits'  => $row ? (int)$row['visits'] : 0,
        'uniques' => $row ? (int)$row['uniques'] : 0,
    ]
);

// ─── Top pages ─────────────────────────────────────────────────────
$stmt = db()->prepare(
    'SELECT path, COUNT(*) AS n
       FROM page_views
      WHERE created_at BETWEEN :from AND :to
      GROUP BY path
      ORDER BY n DESC
      LIMIT 10'
);
$stmt->execute([':from' => $from, ':to' => $to]);
$topPages = array_map(fn($r) => [
    'path'  => $r['path'],
    'count' => (int)$r['n'],
], $stmt->fetchAll());

// ─── Top referrers ─────────────────────────────────────────────────
// Referrer is the FULL URL — we'd want hostname-grouping for a real chart.
// Done in PHP because MySQL string ops for this are awkward.
$stmt = db()->prepare(
    'SELECT referrer, COUNT(*) AS n
       FROM page_views
      WHERE created_at BETWEEN :from AND :to
      GROUP BY referrer'
);
$stmt->execute([':from' => $from, ':to' => $to]);
$refMap = [];
foreach ($stmt->fetchAll() as $row) {
    $ref  = $row['referrer'];
    $host = $ref === '' ? 'Direct' : (parse_url($ref, PHP_URL_HOST) ?: 'Other');
    $refMap[$host] = ($refMap[$host] ?? 0) + (int)$row['n'];
}
arsort($refMap);
$topReferrers = [];
foreach (array_slice($refMap, 0, 10, true) as $host => $count) {
    $topReferrers[] = ['referrer' => $host, 'count' => $count];
}

// ─── Subscriber growth (cumulative) ────────────────────────────────
// We accumulate from the very first confirmed subscriber so the line
// chart shows the trajectory, not just per-day signups.
$stmt = db()->prepare(
    'SELECT DATE(confirmed_at) AS day, COUNT(*) AS n
       FROM subscribers
      WHERE status = "confirmed"
        AND confirmed_at BETWEEN :from AND :to
      GROUP BY day
      ORDER BY day ASC'
);
$stmt->execute([':from' => $from, ':to' => $to]);

// Starting count = everyone confirmed before $from
$startStmt = db()->prepare(
    'SELECT COUNT(*) AS n FROM subscribers WHERE status = "confirmed" AND confirmed_at < :from'
);
$startStmt->execute([':from' => $from]);
$running = (int)$startStmt->fetch()['n'];

$signupsByDay = [];
foreach ($stmt->fetchAll() as $r) {
    $signupsByDay[$r['day']] = (int)$r['n'];
}

$subscriberGrowth = fill_daily_series(
    [],   // we synthesise the rows below
    'day',
    $from,
    $to,
    function ($_, $day) use (&$running, $signupsByDay) {
        $running += $signupsByDay[$day] ?? 0;
        return ['total' => $running];
    }
);

// ─── Message volume per day ────────────────────────────────────────
$stmt = db()->prepare(
    'SELECT DATE(received_at) AS day, COUNT(*) AS n
       FROM messages
      WHERE received_at BETWEEN :from AND :to
      GROUP BY day
      ORDER BY day ASC'
);
$stmt->execute([':from' => $from, ':to' => $to]);
$messageVolume = fill_daily_series(
    $stmt->fetchAll(),
    'day',
    $from,
    $to,
    fn($row) => ['count' => $row ? (int)$row['n'] : 0]
);

// ─── Audit activity per admin ──────────────────────────────────────
$stmt = db()->prepare(
    'SELECT COALESCE(user_email, "(deleted)") AS user, COUNT(*) AS n
       FROM audit_log
      WHERE created_at BETWEEN :from AND :to
      GROUP BY user
      ORDER BY n DESC
      LIMIT 10'
);
$stmt->execute([':from' => $from, ':to' => $to]);
$auditByUser = array_map(fn($r) => [
    'user'  => $r['user'],
    'count' => (int)$r['n'],
], $stmt->fetchAll());

// ─── Content by category (all-time, not range-bound) ───────────────
$stmt = db()->query(
    'SELECT c.label AS category, COUNT(p.id) AS n
       FROM categories c
       LEFT JOIN posts p ON p.category_id = c.id AND p.status = "published"
      GROUP BY c.id
      ORDER BY n DESC'
);
$contentByCategory = array_map(fn($r) => [
    'category' => $r['category'],
    'count'    => (int)$r['n'],
], $stmt->fetchAll());

// ─── Done ──────────────────────────────────────────────────────────
ok([
    'range' => [
        'days' => $days,
        'from' => $from,
        'to'   => $to,
    ],
    'summary' => [
        'visits'         => $visits,
        'uniqueVisitors' => $uniqueVisitors,
        'posts'          => $posts,
        'subscribers'    => $subscribers,
        'messages'       => $messages,
    ],
    'visitsOverTime'    => $visitsOverTime,
    'topPages'          => $topPages,
    'topReferrers'      => $topReferrers,
    'subscriberGrowth'  => $subscriberGrowth,
    'messageVolume'     => $messageVolume,
    'auditByUser'       => $auditByUser,
    'contentByCategory' => $contentByCategory,
]);

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════

/**
 * Pad a daily aggregation so missing days show up as zero. This keeps
 * line charts from showing misleading flat segments — the chart x-axis
 * shows every day in the range whether or not there was activity.
 *
 * @param array    $rows       DB rows with $dayKey set
 * @param string   $dayKey     Column name holding the date string
 * @param string   $from       'Y-m-d H:i:s'
 * @param string   $to         'Y-m-d H:i:s'
 * @param callable $shaper     fn($row|null, $dayString): array — extra fields
 */
function fill_daily_series(array $rows, string $dayKey, string $from, string $to, callable $shaper): array {
    $byDay = [];
    foreach ($rows as $r) $byDay[$r[$dayKey]] = $r;

    $start = new DateTimeImmutable(substr($from, 0, 10));
    $end   = new DateTimeImmutable(substr($to,   0, 10));

    $out = [];
    for ($d = $start; $d <= $end; $d = $d->modify('+1 day')) {
        $key  = $d->format('Y-m-d');
        $row  = $byDay[$key] ?? null;
        $base = ['date' => $key];
        $out[] = array_merge($base, $shaper($row, $key));
    }
    return $out;
}
