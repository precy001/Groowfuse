<?php
/**
 * Admin image upload.
 *
 * POST /api/admin/upload.php
 *   multipart/form-data with one field: `file`
 *
 * Saves the file under api/uploads/<year>/<month>/, returns the public URL.
 *
 * Security:
 *   - Auth required
 *   - Whitelisted MIME types
 *   - Filename sanitized (slugified base + random suffix)
 *   - Size capped (default 5 MB)
 *   - Image is verified by getimagesize() — not just by extension
 */

declare(strict_types=1);

require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/../lib/audit.php';

cors_or_die();
require_method('POST');
$admin = require_admin();

if (empty($_FILES['file'])) {
    fail('No file uploaded.', 400);
}

$file = $_FILES['file'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    fail('Upload failed (code ' . $file['error'] . ').', 400);
}

$maxBytes = env_int('UPLOAD_MAX_BYTES', 5242880);
if ($file['size'] > $maxBytes) {
    fail('File too large (max ' . round($maxBytes / 1024 / 1024) . ' MB).', 413);
}

// Verify it's actually an image by reading the file
$info = @getimagesize($file['tmp_name']);
if ($info === false) {
    fail('File is not a recognised image.', 415);
}

// Allowed MIME types → extension map. Trust the inspector, not the upload header
$mimeMap = [
    IMAGETYPE_JPEG => 'jpg',
    IMAGETYPE_PNG  => 'png',
    IMAGETYPE_GIF  => 'gif',
    IMAGETYPE_WEBP => 'webp',
];
if (!isset($mimeMap[$info[2]])) {
    fail('Unsupported image format. Use JPG, PNG, GIF, or WebP.', 415);
}
$ext = $mimeMap[$info[2]];

// Build a safe filename
$base = pathinfo($file['name'], PATHINFO_FILENAME);
$base = strtolower(preg_replace('/[^a-z0-9\-_]+/i', '-', (string)$base));
$base = trim(preg_replace('/-+/', '-', $base), '-');
if ($base === '' || strlen($base) > 60) $base = 'image';

$randomSuffix = bin2hex(random_bytes(4));
$filename     = $base . '-' . $randomSuffix . '.' . $ext;

// Year/month bucketing keeps directories small
$year   = date('Y');
$month  = date('m');
$relDir = "uploads/{$year}/{$month}";
$absDir = __DIR__ . '/../' . $relDir;

if (!is_dir($absDir) && !@mkdir($absDir, 0755, true)) {
    fail('Could not create upload directory.', 500);
}

$absPath = $absDir . '/' . $filename;

if (!@move_uploaded_file($file['tmp_name'], $absPath)) {
    fail('Could not save uploaded file.', 500);
}

// Public URL — host-relative; the frontend will prefix it with the API base URL
$urlPrefix = rtrim((string)env('UPLOAD_URL_PREFIX', '/api/uploads'), '/');
$url       = $urlPrefix . "/{$year}/{$month}/{$filename}";

audit_log($admin, 'upload.create', [
    'type'  => 'upload',
    'id'    => $filename,
    'label' => $file['name'],
], [
    'size'   => (int)$file['size'],
    'width'  => $info[0],
    'height' => $info[1],
    'mime'   => image_type_to_mime_type($info[2]),
]);

ok([
    'url'      => $url,
    'filename' => $filename,
    'width'    => $info[0],
    'height'   => $info[1],
]);
