<?php
/**
 * Public blog posts endpoint.
 *
 * GET /api/posts.php
 *   ?slug=<slug>            → single published post + related
 *   ?category=<slug>        → filter by category
 *   ?limit=N&offset=M       → pagination (defaults: 20 / 0)
 *
 * Only `status = published` posts are returned.
 *
 * Response shape mirrors the existing src/data/posts.js export so the
 * frontend swap is just changing the data source — no rendering changes.
 */

declare(strict_types=1);

require_once __DIR__ . '/lib/response.php';
require_once __DIR__ . '/lib/db.php';

cors_or_die();
require_method('GET');

if (!empty($_GET['slug'])) {
    handle_single_post(trim($_GET['slug']));
}

handle_post_list();

// ═══════════════════════════════════════════════════════════════════

function handle_single_post(string $slug): never {
    $slug = preg_replace('/[^a-z0-9\-]/i', '', strtolower($slug));
    if ($slug === '') fail('Invalid slug.', 400);

    $row = fetch_post_row(['slug' => $slug, 'published_only' => true]);
    if (!$row) fail('Post not found.', 404);

    // Related: same category, exclude self, top 3 by published_at
    $related = db()->prepare(
        "SELECT p.id, p.slug, p.title, p.excerpt,
                p.cover_image, p.cover_alt, p.read_minutes,
                p.published_at,
                p.author_name, p.author_role,
                c.slug AS category_slug, c.label AS category_label
           FROM posts p
           LEFT JOIN categories c ON c.id = p.category_id
          WHERE p.status = 'published'
            AND p.category_id = :cid
            AND p.id != :self
          ORDER BY p.published_at DESC
          LIMIT 3"
    );
    $related->execute([':cid' => $row['category_id'], ':self' => $row['id']]);
    $relatedRows = array_map(fn($r) => format_post_summary($r), $related->fetchAll());

    ok([
        'post'    => format_post_full($row),
        'related' => $relatedRows,
    ]);
}

function handle_post_list(): never {
    $where  = ['p.status = "published"'];
    $params = [];

    if (!empty($_GET['category']) && $_GET['category'] !== 'all') {
        $cat = preg_replace('/[^a-z0-9\-]/i', '', strtolower($_GET['category']));
        if ($cat !== '') {
            $where[]            = 'c.slug = :cat';
            $params[':cat']     = $cat;
        }
    }

    $limit  = max(1, min(100, (int)($_GET['limit']  ?? 20)));
    $offset = max(0,           (int)($_GET['offset'] ?? 0));

    $whereSql = 'WHERE ' . implode(' AND ', $where);

    // Count first (for pagination on the client)
    $countStmt = db()->prepare(
        "SELECT COUNT(*) AS n
           FROM posts p
           LEFT JOIN categories c ON c.id = p.category_id
           {$whereSql}"
    );
    $countStmt->execute($params);
    $total = (int)$countStmt->fetch()['n'];

    // Then the rows
    $rowsStmt = db()->prepare(
        "SELECT p.id, p.slug, p.title, p.excerpt,
                p.cover_image, p.cover_alt, p.read_minutes,
                p.published_at,
                p.author_name, p.author_role,
                c.slug AS category_slug, c.label AS category_label
           FROM posts p
           LEFT JOIN categories c ON c.id = p.category_id
           {$whereSql}
          ORDER BY p.published_at DESC
          LIMIT {$limit} OFFSET {$offset}"
    );
    $rowsStmt->execute($params);
    $rows = $rowsStmt->fetchAll();

    // Categories for the filter chips
    $cats = db()->query(
        'SELECT c.slug, c.label, COUNT(p.id) AS post_count
           FROM categories c
           LEFT JOIN posts p
             ON p.category_id = c.id AND p.status = "published"
          GROUP BY c.id
          ORDER BY post_count DESC'
    )->fetchAll();

    ok([
        'posts'      => array_map('format_post_summary', $rows),
        'total'      => $total,
        'limit'      => $limit,
        'offset'     => $offset,
        'categories' => array_map(fn($c) => [
            'id'    => $c['slug'],
            'label' => $c['label'],
            'count' => (int)$c['post_count'],
        ], $cats),
    ]);
}

// ─── Helpers ───────────────────────────────────────────────────────

function fetch_post_row(array $opts): ?array {
    $where = [];
    $params = [];
    if ($opts['published_only'] ?? false) $where[] = 'p.status = "published"';
    if (isset($opts['slug'])) {
        $where[]        = 'p.slug = :slug';
        $params[':slug'] = $opts['slug'];
    }
    $sql = 'SELECT p.id, p.slug, p.title, p.excerpt, p.body,
                   p.cover_image, p.cover_alt, p.read_minutes,
                   p.published_at, p.created_at, p.updated_at,
                   p.author_id, p.author_name, p.author_role,
                   p.category_id, p.status,
                   c.slug AS category_slug, c.label AS category_label
              FROM posts p
              LEFT JOIN categories c ON c.id = p.category_id'
         . ($where ? ' WHERE ' . implode(' AND ', $where) : '')
         . ' LIMIT 1';

    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetch() ?: null;
}

function fetch_tags_for_post(int $postId): array {
    $stmt = db()->prepare(
        'SELECT t.label
           FROM tags t
           JOIN post_tags pt ON pt.tag_id = t.id
          WHERE pt.post_id = :id
          ORDER BY t.label'
    );
    $stmt->execute([':id' => $postId]);
    return array_map(fn($r) => $r['label'], $stmt->fetchAll());
}

function format_post_summary(array $r): array {
    return [
        'slug'        => $r['slug'],
        'title'       => $r['title'],
        'excerpt'     => $r['excerpt'],
        'date'        => $r['published_at'] ? substr($r['published_at'], 0, 10) : null,
        'readMinutes' => (int)$r['read_minutes'],
        'coverImage'  => $r['cover_image'],
        'coverAlt'    => $r['cover_alt'],
        'category'    => [
            'id'    => $r['category_slug'],
            'label' => $r['category_label'],
        ],
        'author' => [
            'name' => $r['author_name'],
            'role' => $r['author_role'],
        ],
    ];
}

function format_post_full(array $r): array {
    return array_merge(
        format_post_summary($r),
        [
            'body' => $r['body'],
            'tags' => fetch_tags_for_post((int)$r['id']),
        ]
    );
}
