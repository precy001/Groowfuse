<?php
/**
 * Response + CORS helpers.
 * --------------------------------------------------------
 * Use these from every endpoint instead of bare echo/json_encode so the
 * status code, content type, security headers, and CORS layer stay
 * consistent across the API.
 *
 * Public surface:
 *   cors_or_die()      Call as the FIRST line in every endpoint.
 *                      Adds CORS headers, handles OPTIONS preflight,
 *                      sends security headers.
 *   require_method($methods) Validate request method or 405.
 *   read_json_body()   Decode the JSON request body. Returns []  if empty.
 *   json($data, $code = 200)
 *   ok($data = [])
 *   fail($message, $code = 400, $extra = [])
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';

/**
 * CORS gate. Call before doing anything else.
 *
 * Behavior:
 *  - Sends Access-Control-* headers if the request Origin is allowed.
 *  - For an OPTIONS preflight, replies 204 and exits.
 *  - For a request with a disallowed Origin, sends no CORS headers
 *    (which causes the browser to reject the response) but still lets
 *    the rest of the script run for non-browser clients (curl, server).
 *
 * Allowed origins come from FRONTEND_ORIGIN + EXTRA_ORIGINS in .env.
 */
function cors_or_die(): void {
    // Always lock down a few baseline security headers
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('X-Frame-Options: DENY');

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    $allowed = [];
    $primary = trim((string)env('FRONTEND_ORIGIN', ''));
    if ($primary !== '') $allowed[] = $primary;

    $extras = trim((string)env('EXTRA_ORIGINS', ''));
    if ($extras !== '') {
        foreach (explode(',', $extras) as $o) {
            $o = trim($o);
            if ($o !== '') $allowed[] = $o;
        }
    }

    // Reflect Origin only if it's in the allow-list
    if ($origin !== '' && in_array($origin, $allowed, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, X-CSRF-Token');
        header('Access-Control-Max-Age: 600');
    }

    // Preflight short-circuit
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

/**
 * Send a JSON response and exit.
 */
function json($data, int $status = 200): void {
    if (!headers_sent()) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
    }
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Success shape — always includes ok:true so the client has a single flag.
 */
function ok(array $data = []): void {
    json(array_merge(['ok' => true], $data), 200);
}

/**
 * Failure shape — always includes ok:false.
 *
 * @param array $extra Additional fields, e.g. ['fields' => ['email' => 'Required']]
 */
function fail(string $message, int $status = 400, array $extra = []): void {
    json(array_merge(['ok' => false, 'error' => $message], $extra), $status);
}

/**
 * Reject any request method not in $methods (case-insensitive).
 *
 * @param string|array $methods e.g. 'POST' or ['GET', 'POST']
 */
function require_method($methods): void {
    if (!is_array($methods)) $methods = [$methods];
    $methods = array_map('strtoupper', $methods);
    $current = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    if (!in_array($current, $methods, true)) {
        header('Allow: ' . implode(', ', $methods));
        fail('Method not allowed.', 405);
    }
}

/**
 * Read and decode the JSON request body.
 *
 * Returns [] for an empty body. Errors out for malformed JSON.
 */
function read_json_body(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') return [];

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        fail('Invalid JSON body.', 400);
    }
    return $data;
}
