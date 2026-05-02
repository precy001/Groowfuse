/**
 * API fetch wrapper.
 * --------------------------------------------------------
 * Single place that knows the API base URL, sends cookies for auth,
 * decodes JSON, and turns non-2xx responses into thrown errors with a
 * predictable shape:
 *
 *   { status, message, fields?, data? }
 *
 * The base URL comes from VITE_API_URL. In dev that's typically:
 *   VITE_API_URL=http://localhost/Groowfuse/api
 * In production it's whatever host the API is deployed to.
 *
 * Usage:
 *   const data = await api.get('/posts.php?slug=foo');
 *   const data = await api.post('/admin/login.php', { email, password });
 *   const data = await api.put('/admin/posts.php?id=42', { title: '...' });
 *   const data = await api.del('/admin/messages.php?id=7');
 *   const data = await api.upload('/admin/upload.php', file);
 */

const RAW_BASE = import.meta.env.VITE_API_URL || '';

// Trim trailing slash so callers can write '/posts.php' consistently
const BASE = RAW_BASE.replace(/\/+$/, '');

if (!BASE && import.meta.env.DEV) {
  // Loud during development so missing config is impossible to miss
  // eslint-disable-next-line no-console
  console.warn(
    '[GroowFuse API] VITE_API_URL is not set. ' +
    'Add it to .env.development (e.g. VITE_API_URL=http://localhost/Groowfuse/api).'
  );
}

/**
 * Build full URL from a path. Accepts either '/posts.php' or
 * 'posts.php' style and never doubles slashes.
 */
function url(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${p}`;
}

/**
 * Custom error class so callers can `if (err instanceof ApiError)` and
 * inspect status/fields without parsing strings.
 */
export class ApiError extends Error {
  constructor(message, { status, fields, data } = {}) {
    super(message);
    this.name   = 'ApiError';
    this.status = status;
    this.fields = fields;
    this.data   = data;
  }
}

/**
 * Core request runner.
 *
 * - credentials: 'include' so the session cookie travels cross-origin
 * - signal:      forwarded so callers can AbortController-cancel
 * - 204 No Content responses return null cleanly
 */
async function request(path, { method = 'GET', body, headers = {}, signal, isForm = false } = {}) {
  const opts = {
    method,
    credentials: 'include',
    signal,
    headers: { ...headers },
  };

  if (body !== undefined && body !== null) {
    if (isForm) {
      // FormData — do NOT set Content-Type, browser adds boundary
      opts.body = body;
    } else {
      opts.body = JSON.stringify(body);
      opts.headers['Content-Type'] = 'application/json';
    }
  }

  let res;
  try {
    res = await fetch(url(path), opts);
  } catch (e) {
    if (e?.name === 'AbortError') throw e;
    throw new ApiError(
      'Could not reach the server. Check your connection and try again.',
      { status: 0 }
    );
  }

  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch {
    // Non-JSON response — usually a server misconfiguration or wrong base URL
    if (!res.ok) {
      throw new ApiError(
        `Server returned an unexpected response (${res.status}).`,
        { status: res.status }
      );
    }
    return null;
  }

  if (!res.ok || data?.ok === false) {
    throw new ApiError(
      data?.error || `Request failed (${res.status}).`,
      {
        status: res.status,
        fields: data?.fields,
        data,
      }
    );
  }

  return data;
}

export const api = {
  get:    (path, opts)        => request(path, { ...opts, method: 'GET' }),
  post:   (path, body, opts)  => request(path, { ...opts, method: 'POST',   body }),
  put:    (path, body, opts)  => request(path, { ...opts, method: 'PUT',    body }),
  patch:  (path, body, opts)  => request(path, { ...opts, method: 'PATCH',  body }),
  del:    (path, opts)        => request(path, { ...opts, method: 'DELETE' }),

  /**
   * Upload a single file using multipart/form-data. The file is sent
   * under the field name `file` to match the backend.
   */
  upload(path, file, extraFields = {}) {
    const fd = new FormData();
    fd.append('file', file);
    for (const [k, v] of Object.entries(extraFields)) fd.append(k, v);
    return request(path, { method: 'POST', body: fd, isForm: true });
  },
};

/**
 * Convenience: build an absolute URL for a relative API path. Used
 * whenever an <img src> needs to display a server-stored asset.
 *
 * Handles three input shapes:
 *   1. Absolute URL          → returned untouched
 *   2. API-relative path     → BASE + path
 *      e.g. "/uploads/foo.jpg" → "http://localhost/Groowfuse/api/uploads/foo.jpg"
 *   3. Legacy host-rooted    → strips a leading "/api/" so paths from old
 *      data still work after the URL contract changed
 *      e.g. "/api/uploads/foo.jpg" → BASE + "/uploads/foo.jpg"
 */
export function apiUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (!BASE) return path;          // misconfigured — return as-is rather than break

  // If the server returned a host-rooted path that includes "/api/", strip
  // it. Whatever follows is API-root-relative and we can join it with BASE.
  let rel = path.startsWith('/api/') ? path.slice(4) : path;
  if (!rel.startsWith('/')) rel = '/' + rel;

  return BASE + rel;
}
