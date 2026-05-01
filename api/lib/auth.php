<?php
/**
 * Admin authentication.
 * --------------------------------------------------------
 * Session-cookie based auth, with the session itself stored in the DB
 * `sessions` table so we can invalidate it server-side at any time.
 *
 * Why not JWT: simpler ops, easier to revoke, no client-side token expiry
 * surprises, and we already have a DB. JWT would only win if we needed
 * stateless verification across many services — we don't.
 *
 * Cookie:
 *   Name:    gf_admin_session
 *   Value:   random opaque token (NOT the session id, NOT a JWT)
 *   Flags:   HttpOnly + Secure + SameSite (set per .env)
 *
 * Public surface:
 *   admin_login($email, $password)         => bool
 *   admin_logout()
 *   current_admin()                        => array|null { id, email, name, role }
 *   require_admin()                        Sends 401 if not authenticated.
 *   admin_password_hash($plain)            For seeding/setup.
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/response.php';

const SESSION_COOKIE = 'gf_admin_session';

/**
 * Generate a strong opaque token. We store its sha256 in the DB so even
 * if the table is dumped, no one can authenticate as a live user.
 */
function generate_session_token(): string {
    return rtrim(strtr(base64_encode(random_bytes(36)), '+/', '-_'), '=');
}

function hash_session_token(string $token): string {
    return hash('sha256', $token);
}

/**
 * Set the session cookie with proper flags. Pass $token = '' to clear.
 */
function set_session_cookie(string $token, int $ttl): void {
    $secure   = env_bool('COOKIE_SECURE', true);
    $sameSite = env('COOKIE_SAMESITE', 'None');
    $domain   = env('COOKIE_DOMAIN', '');

    $opts = [
        'expires'  => $token === '' ? time() - 3600 : time() + $ttl,
        'path'     => '/',
        'secure'   => $secure,
        'httponly' => true,
        'samesite' => $sameSite,
    ];
    if ($domain !== '') $opts['domain'] = $domain;

    setcookie(SESSION_COOKIE, $token, $opts);
}

/**
 * Look up the current session from the cookie. Returns null if no valid
 * session. Also extends the session's expiry on each successful read so
 * an active admin doesn't get logged out mid-task.
 */
function current_session(): ?array {
    $cookie = $_COOKIE[SESSION_COOKIE] ?? '';
    if ($cookie === '') return null;

    $tokenHash = hash_session_token($cookie);

    $stmt = db()->prepare(
        'SELECT s.id, s.user_id, s.expires_at,
                u.email, u.name, u.role
           FROM sessions s
           JOIN admin_users u ON u.id = s.user_id
          WHERE s.token_hash = :h
            AND s.expires_at > NOW()
          LIMIT 1'
    );
    $stmt->execute([':h' => $tokenHash]);
    $row = $stmt->fetch();

    if (!$row) return null;

    // Slide the expiry forward on activity
    $ttl = env_int('SESSION_TTL', 43200);
    db()->prepare('UPDATE sessions SET expires_at = DATE_ADD(NOW(), INTERVAL :s SECOND) WHERE id = :id')
        ->execute([':s' => $ttl, ':id' => $row['id']]);

    return $row;
}

/**
 * The current admin user (without sensitive session fields), or null.
 */
function current_admin(): ?array {
    $s = current_session();
    if (!$s) return null;
    return [
        'id'    => (int)$s['user_id'],
        'email' => $s['email'],
        'name'  => $s['name'],
        'role'  => $s['role'],
    ];
}

/**
 * Send 401 unless authenticated. Returns the admin row on success.
 */
function require_admin(): array {
    $admin = current_admin();
    if (!$admin) fail('Not authenticated.', 401);
    return $admin;
}

/**
 * Attempt login. On success, sets the session cookie and returns the
 * admin user array. Returns null on failure.
 *
 * Caller is responsible for rate limiting and writing the audit log.
 */
function admin_login(string $email, string $password): ?array {
    $email = strtolower(trim($email));
    if ($email === '' || $password === '') return null;

    $stmt = db()->prepare(
        'SELECT id, email, name, role, password_hash
           FROM admin_users
          WHERE email = :e
          LIMIT 1'
    );
    $stmt->execute([':e' => $email]);
    $row = $stmt->fetch();

    if (!$row) {
        // Run a dummy hash to keep timing roughly constant against email enumeration
        password_verify($password, '$2y$10$invalidsaltinvalidsaltinvalidsalti0123456789abcdefghi');
        return null;
    }

    if (!password_verify($password, $row['password_hash'])) return null;

    // Issue session
    $token     = generate_session_token();
    $tokenHash = hash_session_token($token);
    $ttl       = env_int('SESSION_TTL', 43200);

    db()->prepare(
        'INSERT INTO sessions (token_hash, user_id, expires_at, ip_hash, user_agent)
         VALUES (:h, :u, DATE_ADD(NOW(), INTERVAL :s SECOND), :ip, :ua)'
    )->execute([
        ':h'  => $tokenHash,
        ':u'  => $row['id'],
        ':s'  => $ttl,
        ':ip' => hash_ip(client_ip()),
        ':ua' => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500),
    ]);

    db()->prepare('UPDATE admin_users SET last_login_at = NOW() WHERE id = :id')
        ->execute([':id' => $row['id']]);

    set_session_cookie($token, $ttl);

    return [
        'id'    => (int)$row['id'],
        'email' => $row['email'],
        'name'  => $row['name'],
        'role'  => $row['role'],
    ];
}

/**
 * Destroy the current session (DB row + cookie).
 */
function admin_logout(): void {
    $cookie = $_COOKIE[SESSION_COOKIE] ?? '';
    if ($cookie !== '') {
        db()->prepare('DELETE FROM sessions WHERE token_hash = :h')
            ->execute([':h' => hash_session_token($cookie)]);
    }
    set_session_cookie('', 0);
}

/**
 * Helper for seeding admin users with bcrypt hashes.
 *   php -r "require 'lib/auth.php'; echo admin_password_hash('admin101'), \"\n\";"
 */
function admin_password_hash(string $plain): string {
    return password_hash($plain, PASSWORD_BCRYPT);
}
