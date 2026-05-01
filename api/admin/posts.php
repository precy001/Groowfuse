<?php
/**
 * Admin posts CRUD.
 *
 * GET    /api/admin/posts.php                  list all (incl. drafts)
 * GET    /api/admin/posts.php?id=<id>          single post for editing
 * POST   /api/admin/posts.php                  create
 * PUT    /api/admin/posts.php?id=<id>          update
 * DELETE /api/admin/posts.php?id=<id>          delete
 *
 * All require an authenticated admin. Mutations are recorded in the
 * audit log.
 */

declare(strict_types=1);

require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/../lib/audit.php';
require_once __DIR__ . '/../lib/validate.php';

cors_or_die();
$admin = require_admin();

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$id     = isset($_GET['id']) ? (int)$_GET['id'] : 0;

switch ($method) {
    case 'GET':    $id ? handle_show($id)   : handle_list();         break;
    case 'POST':                              handle_create($admin); break;
    case 'PUT':    $id ? handle_update($admin, $id) : fail('Missing id.', 400); break;
    case 'DELETE': $id ? handle_delete($admin, $id) : fail('Missing id.', 400); break;
    default:       fail('Method not allowed.', 405);
}

// ═══════════════════════════════════════════════════════════════════

function handle_list(): never {
    $rows = db()->query(
        "SELECT p.id, p.slug, p.title, p.excerpt, p.status, p.read_minutes,
                p.published_at, p.created_at, p.updated_at,
                p.author_name, p.author_role, p.cover_image,
                c.slug AS category_slug, c.label AS category_label
           FROM posts p
           LEFT JOIN categories c ON c.id = p.category_id
          ORDER BY COALESCE(p.published_at, p.created_at) DESC"
    )->fetchAll();

    ok(['posts' => array_map('format_post_admin', $rows)]);
}

function handle_show(int $id): never {
    $stmt = db()->prepare(
        "SELECT p.*,
                c.slug AS category_slug, c.label AS category_label
           FROM posts p
           LEFT JOIN categories c ON c.id = p.category_id
          WHERE p.id = :id
          LIMIT 1"
    );
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!$row) fail('Post not found.', 404);

    $row['tags'] = fetch_tag_labels((int)$row['id']);
    ok(['post' => format_post_admin_full($row)]);
}

function handle_create(array $admin): never {
    $body = read_json_body();
    $data = validate_post_input($body, isCreate: true);

    // Ensure unique slug — bump with -2, -3 etc. if collision
    $data['slug'] = unique_slug($data['slug']);

    $stmt = db()->prepare(
        'INSERT INTO posts
            (slug, title, excerpt, body,
             category_id, author_id, author_name, author_role,
             cover_image, cover_alt,
             status, read_minutes, published_at,
             created_at, updated_at)
         VALUES
            (:slug, :title, :excerpt, :body,
             :category_id, :author_id, :author_name, :author_role,
             :cover_image, :cover_alt,
             :status, :read_minutes, :published_at,
             NOW(), NOW())'
    );

    $stmt->execute([
        ':slug'         => $data['slug'],
        ':title'        => $data['title'],
        ':excerpt'      => $data['excerpt'],
        ':body'         => $data['body'],
        ':category_id'  => $data['category_id'],
        ':author_id'    => $admin['id'],
        ':author_name'  => $data['author_name'],
        ':author_role'  => $data['author_role'],
        ':cover_image'  => $data['cover_image'],
        ':cover_alt'    => $data['cover_alt'],
        ':status'       => $data['status'],
        ':read_minutes' => $data['read_minutes'],
        ':published_at' => $data['status'] === 'published' ? ($data['published_at'] ?: date('Y-m-d H:i:s')) : null,
    ]);

    $id = (int)db()->lastInsertId();
    sync_tags($id, $data['tags']);

    audit_log(
        $admin,
        $data['status'] === 'published' ? 'post.publish' : 'post.create',
        ['type' => 'post', 'id' => (string)$id, 'label' => $data['title']]
    );

    handle_show($id);
}

function handle_update(array $admin, int $id): never {
    // Confirm exists
    $existing = db()->prepare('SELECT id, slug, status FROM posts WHERE id = :id LIMIT 1');
    $existing->execute([':id' => $id]);
    $row = $existing->fetch();
    if (!$row) fail('Post not found.', 404);

    $body = read_json_body();
    $data = validate_post_input($body, isCreate: false);

    // Slug uniqueness — only check if slug changed
    if ($data['slug'] !== $row['slug']) {
        $data['slug'] = unique_slug($data['slug'], excludeId: $id);
    }

    // Decide published_at — set on first publish, leave alone otherwise
    $publishedAtSql  = '';
    $publishedAtVal  = null;
    if ($data['status'] === 'published' && $row['status'] !== 'published') {
        $publishedAtSql = ', published_at = COALESCE(:published_at, NOW())';
        $publishedAtVal = $data['published_at'];
    } elseif ($data['status'] === 'published' && $data['published_at']) {
        // Allow editing the published_at on already-published posts
        $publishedAtSql = ', published_at = :published_at';
        $publishedAtVal = $data['published_at'];
    } elseif ($data['status'] === 'draft') {
        $publishedAtSql = ', published_at = NULL';
    }

    $sql = 'UPDATE posts
               SET slug = :slug, title = :title, excerpt = :excerpt, body = :body,
                   category_id = :category_id,
                   author_name = :author_name, author_role = :author_role,
                   cover_image = :cover_image, cover_alt = :cover_alt,
                   status = :status, read_minutes = :read_minutes,
                   updated_at = NOW()
                   ' . $publishedAtSql . '
             WHERE id = :id';

    $params = [
        ':slug'         => $data['slug'],
        ':title'        => $data['title'],
        ':excerpt'      => $data['excerpt'],
        ':body'         => $data['body'],
        ':category_id'  => $data['category_id'],
        ':author_name'  => $data['author_name'],
        ':author_role'  => $data['author_role'],
        ':cover_image'  => $data['cover_image'],
        ':cover_alt'    => $data['cover_alt'],
        ':status'       => $data['status'],
        ':read_minutes' => $data['read_minutes'],
        ':id'           => $id,
    ];
    if ($publishedAtVal !== null && str_contains($publishedAtSql, ':published_at')) {
        $params[':published_at'] = $publishedAtVal;
    }

    db()->prepare($sql)->execute($params);

    sync_tags($id, $data['tags']);

    // Pick the right verb — first publish vs ordinary edit
    $verb = ($data['status'] === 'published' && $row['status'] !== 'published')
          ? 'post.publish'
          : 'post.update';

    audit_log(
        $admin,
        $verb,
        ['type' => 'post', 'id' => (string)$id, 'label' => $data['title']]
    );

    handle_show($id);
}

function handle_delete(array $admin, int $id): never {
    $stmt = db()->prepare('SELECT id, title FROM posts WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!$row) fail('Post not found.', 404);

    db()->prepare('DELETE FROM posts WHERE id = :id')->execute([':id' => $id]);

    audit_log($admin, 'post.delete', [
        'type'  => 'post',
        'id'    => (string)$id,
        'label' => $row['title'],
    ]);

    ok(['deleted' => $id]);
}

// ─── Validation + helpers ──────────────────────────────────────────

function validate_post_input(array $body, bool $isCreate): array {
    $v = new Validator($body);

    $v->required('title')->maxLength('title', 255);
    $v->maxLength('excerpt',     500);
    $v->maxLength('cover_image', 65535);  // text column, but cap at sane size
    $v->maxLength('cover_alt',   255);
    $v->maxLength('author_name', 120);
    $v->maxLength('author_role', 120);

    $status = strtolower(trim((string)($body['status'] ?? 'draft')));
    if (!in_array($status, ['draft', 'published'], true)) {
        $status = 'draft';
    }

    if ($errors = $v->errors()) {
        fail('Please fix the highlighted fields.', 422, ['fields' => $errors]);
    }

    // Slug — generate from title if missing
    $slug = strtolower(trim((string)($body['slug'] ?? '')));
    $slug = preg_replace('/[^a-z0-9\-]+/', '-', $slug);
    $slug = preg_replace('/-+/', '-', $slug);
    $slug = trim($slug, '-');
    if ($slug === '') $slug = slugify($v->get('title') ?? 'untitled');

    // Category
    $categoryId = null;
    if (!empty($body['category_id'])) {
        $categoryId = (int)$body['category_id'];
    } elseif (!empty($body['categoryId'])) {     // accept camelCase from frontend
        $categoryId = (int)$body['categoryId'];
    } elseif (!empty($body['category'])) {
        // Resolve by slug
        $stmt = db()->prepare('SELECT id FROM categories WHERE slug = :s LIMIT 1');
        $stmt->execute([':s' => preg_replace('/[^a-z0-9\-]/i', '', strtolower($body['category']))]);
        $r = $stmt->fetch();
        if ($r) $categoryId = (int)$r['id'];
    }

    // Tags — accept array of labels OR comma-separated string
    $tags = [];
    if (isset($body['tags'])) {
        if (is_array($body['tags'])) {
            $tags = $body['tags'];
        } elseif (is_string($body['tags'])) {
            $tags = array_filter(array_map('trim', explode(',', $body['tags'])));
        }
    } elseif (isset($body['tagsRaw']) && is_string($body['tagsRaw'])) {
        $tags = array_filter(array_map('trim', explode(',', $body['tagsRaw'])));
    }

    return [
        'slug'         => $slug,
        'title'        => $v->get('title'),
        'excerpt'      => $v->get('excerpt', ''),
        'body'         => (string)($body['body'] ?? ''),
        'category_id'  => $categoryId,
        'author_name'  => $v->get('author_name')  ?? $v->get('authorName')
                                                    ?? 'GroowFuse Editorial',
        'author_role'  => $v->get('author_role')  ?? $v->get('authorRole')
                                                    ?? 'Practice Team',
        'cover_image'  => $v->get('cover_image')  ?? ($body['coverImage'] ?? null),
        'cover_alt'    => $v->get('cover_alt')    ?? ($body['coverAlt']   ?? ''),
        'status'       => $status,
        'read_minutes' => max(1, min(120, (int)($body['read_minutes']
                                                  ?? $body['readMinutes']
                                                  ?? 5))),
        'published_at' => isset($body['date']) ? normalize_date($body['date']) :
                          (isset($body['published_at']) ? normalize_date($body['published_at']) : null),
        'tags'         => $tags,
    ];
}

function normalize_date(?string $s): ?string {
    if (!$s) return null;
    $t = strtotime($s);
    return $t ? date('Y-m-d H:i:s', $t) : null;
}

function slugify(string $s): string {
    $s = strtolower(trim($s));
    $s = preg_replace('/[^a-z0-9\s\-]/', '', $s);
    $s = preg_replace('/\s+/', '-', $s);
    return preg_replace('/-+/', '-', $s) ?: 'untitled';
}

function unique_slug(string $base, ?int $excludeId = null): string {
    $candidate = $base;
    $i = 2;
    while (true) {
        $stmt = db()->prepare(
            'SELECT id FROM posts WHERE slug = :s' . ($excludeId ? ' AND id != :ex' : '') . ' LIMIT 1'
        );
        $params = [':s' => $candidate];
        if ($excludeId) $params[':ex'] = $excludeId;
        $stmt->execute($params);
        if (!$stmt->fetch()) return $candidate;
        $candidate = $base . '-' . $i;
        $i++;
        if ($i > 99) return $base . '-' . uniqid();    // pathological case
    }
}

function sync_tags(int $postId, array $labels): void {
    db()->prepare('DELETE FROM post_tags WHERE post_id = :id')
        ->execute([':id' => $postId]);

    if (empty($labels)) return;

    $tagIds = [];
    foreach ($labels as $label) {
        $label = trim((string)$label);
        if ($label === '') continue;
        $slug  = preg_replace('/[^a-z0-9\-]+/', '-', strtolower($label));
        $slug  = trim(preg_replace('/-+/', '-', $slug), '-');
        if ($slug === '') continue;

        // Get or create
        $stmt = db()->prepare('SELECT id FROM tags WHERE slug = :s LIMIT 1');
        $stmt->execute([':s' => $slug]);
        $row = $stmt->fetch();
        if ($row) {
            $tagIds[] = (int)$row['id'];
        } else {
            db()->prepare('INSERT INTO tags (slug, label) VALUES (:s, :l)')
                ->execute([':s' => $slug, ':l' => $label]);
            $tagIds[] = (int)db()->lastInsertId();
        }
    }

    if (empty($tagIds)) return;

    $insert = db()->prepare('INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES (:p, :t)');
    foreach ($tagIds as $tid) {
        $insert->execute([':p' => $postId, ':t' => $tid]);
    }
}

function fetch_tag_labels(int $postId): array {
    $stmt = db()->prepare(
        'SELECT t.label FROM tags t
           JOIN post_tags pt ON pt.tag_id = t.id
          WHERE pt.post_id = :id ORDER BY t.label'
    );
    $stmt->execute([':id' => $postId]);
    return array_map(fn($r) => $r['label'], $stmt->fetchAll());
}

function format_post_admin(array $r): array {
    return [
        'id'           => (int)$r['id'],
        'slug'         => $r['slug'],
        'title'        => $r['title'],
        'excerpt'      => $r['excerpt'],
        'status'       => $r['status'],
        'readMinutes'  => (int)$r['read_minutes'],
        'date'         => $r['published_at']  ? substr($r['published_at'], 0, 10) : null,
        'createdAt'    => $r['created_at']    ?? null,
        'updatedAt'    => $r['updated_at']    ?? null,
        'coverImage'   => $r['cover_image'],
        'category'     => [
            'id'    => $r['category_slug'],
            'label' => $r['category_label'],
        ],
        'author'       => [
            'name' => $r['author_name'],
            'role' => $r['author_role'],
        ],
    ];
}

function format_post_admin_full(array $r): array {
    return array_merge(
        format_post_admin($r),
        [
            'body'        => $r['body'],
            'coverAlt'    => $r['cover_alt'],
            'tags'        => $r['tags'] ?? [],
            'authorName'  => $r['author_name'],
            'authorRole'  => $r['author_role'],
        ]
    );
}
