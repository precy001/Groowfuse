/**
 * Settings page.
 * --------------------------------------------------------
 * Two tabs:
 *   - Account  : everyone can edit own profile + password
 *   - Users    : owner-only — manage other admin users
 *
 * Tab visibility is decided client-side from getUser().role; the backend
 * also enforces it (any non-owner who pokes /admin/users.php gets 403),
 * so the client check is purely a UX nicety.
 */

import { useEffect, useState } from 'react';
import ConfirmModal from '../components/ConfirmModal';
import Modal, { ModalFooter } from '../components/Modal';
import { useAdminUsers } from '../lib/data-hooks';
import { useAsyncCallback } from '../../lib/use-async';
import { api } from '../../lib/api';
import { getUser, bootstrap } from '../lib/auth';
import { formatAdminDateTime, timeAgo } from '../lib/format';

export default function Settings() {
  const [user, setUser] = useState(getUser());
  const [tab, setTab]   = useState('account');

  // Refresh the locally-cached user on mount in case role/email changed
  useEffect(() => {
    bootstrap().then(() => setUser(getUser()));
  }, []);

  const isOwner = user?.role === 'owner';

  return (
    <div className="adm-settings">
      <header className="adm-page-header">
        <div>
          <span className="adm-eyebrow">Account</span>
          <h1 className="adm-page-title">Settings</h1>
          <p className="adm-page-sub">
            {isOwner
              ? 'Manage your account and other admin users.'
              : 'Manage your account.'}
          </p>
        </div>
      </header>

      <div className="adm-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'account'}
          onClick={() => setTab('account')}
          className={`adm-tab ${tab === 'account' ? 'is-active' : ''}`}
        >
          Account
        </button>
        {isOwner && (
          <button
            role="tab"
            aria-selected={tab === 'users'}
            onClick={() => setTab('users')}
            className={`adm-tab ${tab === 'users' ? 'is-active' : ''}`}
          >
            Users
          </button>
        )}
      </div>

      {tab === 'account'
        ? <AccountTab user={user} onUpdated={setUser} />
        : <UsersTab currentUser={user} />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * Account tab — own profile + password
 * ───────────────────────────────────────────────────────────────── */

function AccountTab({ user, onUpdated }) {
  const [name, setName]                       = useState(user?.name || '');
  const [email, setEmail]                     = useState(user?.email || '');
  const [profileFeedback, setProfileFeedback] = useState('');
  const [profileErrors, setProfileErrors]     = useState({});

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdFeedback, setPwdFeedback]         = useState('');
  const [pwdErrors, setPwdErrors]             = useState({});

  // Sync if user prop changes (after bootstrap)
  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
  }, [user]);

  const profileSaver = useAsyncCallback((payload) => api.patch('/admin/me.php', payload));
  const passwordSaver = useAsyncCallback((payload) => api.patch('/admin/me.php', payload));

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileFeedback('');
    setProfileErrors({});
    try {
      const res = await profileSaver.run({ name, email });
      onUpdated?.(res.user);
      setProfileFeedback('Profile updated.');
    } catch (err) {
      if (err.fields) setProfileErrors(err.fields);
      setProfileFeedback(err.message || 'Could not update.');
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPwdFeedback('');
    setPwdErrors({});

    if (newPassword !== confirmPassword) {
      setPwdErrors({ confirmPassword: "Passwords don't match." });
      setPwdFeedback('Please fix the highlighted fields.');
      return;
    }

    try {
      await passwordSaver.run({ currentPassword, newPassword });
      setPwdFeedback('Password updated. Other sessions have been signed out.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (err.fields) setPwdErrors(err.fields);
      setPwdFeedback(err.message || 'Could not update password.');
    }
  };

  return (
    <div className="adm-settings-grid">
      {/* Profile */}
      <form onSubmit={handleProfileSave} className="adm-panel">
        <header className="adm-panel-header">
          <h2 className="adm-panel-title">Profile</h2>
        </header>
        <div className="adm-panel-body">
          <label className="adm-field">
            <span className="adm-field-label">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="adm-input"
              maxLength={120}
            />
            {profileErrors.name && <span className="adm-modal-error">{profileErrors.name}</span>}
          </label>

          <label className="adm-field">
            <span className="adm-field-label">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="adm-input"
              maxLength={190}
            />
            {profileErrors.email && <span className="adm-modal-error">{profileErrors.email}</span>}
          </label>

          {profileFeedback && (
            <p
              className="adm-feedback"
              role={profileSaver.error ? 'alert' : 'status'}
              style={profileSaver.error ? { borderColor: 'var(--red)', color: 'var(--red)' } : null}
            >
              {profileFeedback}
            </p>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button
              type="submit"
              className="adm-btn adm-btn-primary"
              disabled={profileSaver.loading}
            >
              {profileSaver.loading ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </div>
      </form>

      {/* Password */}
      <form onSubmit={handlePasswordSave} className="adm-panel">
        <header className="adm-panel-header">
          <h2 className="adm-panel-title">Change password</h2>
        </header>
        <div className="adm-panel-body">
          <label className="adm-field">
            <span className="adm-field-label">Current password</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="adm-input"
              autoComplete="current-password"
              required
            />
            {pwdErrors.currentPassword && <span className="adm-modal-error">{pwdErrors.currentPassword}</span>}
          </label>

          <label className="adm-field">
            <span className="adm-field-label">
              New password
              <span className="adm-field-hint">at least 8 characters</span>
            </span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="adm-input"
              autoComplete="new-password"
              minLength={8}
              required
            />
            {pwdErrors.newPassword && <span className="adm-modal-error">{pwdErrors.newPassword}</span>}
          </label>

          <label className="adm-field">
            <span className="adm-field-label">Confirm new password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="adm-input"
              autoComplete="new-password"
              minLength={8}
              required
            />
            {pwdErrors.confirmPassword && <span className="adm-modal-error">{pwdErrors.confirmPassword}</span>}
          </label>

          {pwdFeedback && (
            <p
              className="adm-feedback"
              role={passwordSaver.error || pwdErrors.confirmPassword ? 'alert' : 'status'}
              style={
                passwordSaver.error || pwdErrors.confirmPassword
                  ? { borderColor: 'var(--red)', color: 'var(--red)' }
                  : null
              }
            >
              {pwdFeedback}
            </p>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button
              type="submit"
              className="adm-btn adm-btn-primary"
              disabled={passwordSaver.loading || !currentPassword || !newPassword || !confirmPassword}
            >
              {passwordSaver.loading ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * Users tab — owner-only management of admin users
 * ───────────────────────────────────────────────────────────────── */

function UsersTab({ currentUser }) {
  const list = useAdminUsers();
  const [createOpen, setCreateOpen]   = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [feedback, setFeedback]       = useState('');

  const deleter = useAsyncCallback((id) => api.del(`/admin/users.php?id=${id}`));

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleter.run(deleteTarget.id);
      setFeedback(`Deleted ${deleteTarget.email}.`);
      list.reload();
    } catch (err) {
      setFeedback(err.message || 'Could not delete.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const users = list.data?.users || [];

  return (
    <>
      <header className="adm-page-header" style={{ marginTop: 0 }}>
        <div>
          <h2 className="adm-panel-title">Admin users</h2>
          <p className="adm-page-sub">
            Owners can create, edit, reset passwords, and delete other admins.
          </p>
        </div>
        <div className="adm-page-actions">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="adm-btn adm-btn-primary"
          >
            New admin →
          </button>
        </div>
      </header>

      {list.error && (
        <div className="adm-feedback" role="alert" style={{ borderColor: 'var(--red)', color: 'var(--red)', marginBottom: 16 }}>
          Could not load users: {list.error.message}
          <button type="button" onClick={list.reload} className="adm-btn adm-btn-ghost" style={{ marginLeft: 12 }}>
            Retry
          </button>
        </div>
      )}

      {feedback && (
        <div className="adm-feedback" role="status" style={{ marginBottom: 16 }}>
          {feedback}
        </div>
      )}

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Last sign-in</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {list.loading ? (
              <tr><td colSpan={5} className="adm-empty">Loading users…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="adm-empty">No admin users yet.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <span className="adm-table-title">{u.name}</span>
                    {u.id === currentUser?.id && (
                      <span className="adm-table-secondary"> · you</span>
                    )}
                  </td>
                  <td className="adm-table-muted">{u.email}</td>
                  <td>
                    <span className={`adm-pill adm-pill-${u.role === 'owner' ? 'confirmed' : 'pending'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="adm-table-muted">
                    {u.lastLoginAt
                      ? <>{formatAdminDateTime(u.lastLoginAt)} <span className="adm-table-secondary">· {timeAgo(u.lastLoginAt)}</span></>
                      : 'Never'}
                  </td>
                  <td>
                    <div className="adm-row-actions">
                      <button
                        type="button"
                        className="adm-btn-icon"
                        onClick={() => setEditTarget(u)}
                        title="Edit"
                        aria-label={`Edit ${u.email}`}
                      >✎</button>
                      <button
                        type="button"
                        className="adm-btn-icon"
                        onClick={() => setResetTarget(u)}
                        title="Reset password"
                        aria-label={`Reset password for ${u.email}`}
                      >🔑</button>
                      {u.id !== currentUser?.id && (
                        <button
                          type="button"
                          className="adm-btn-icon adm-btn-icon-danger"
                          onClick={() => setDeleteTarget(u)}
                          title="Delete"
                          aria-label={`Delete ${u.email}`}
                        >×</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CreateUserModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => { list.reload(); setFeedback('User created.'); }}
      />
      <EditUserModal
        user={editTarget}
        currentUser={currentUser}
        onClose={() => setEditTarget(null)}
        onSaved={() => { list.reload(); setFeedback('User updated.'); }}
      />
      <ResetPasswordModal
        user={resetTarget}
        onClose={() => setResetTarget(null)}
        onSaved={() => setFeedback(`Password reset for ${resetTarget?.email}.`)}
      />
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this admin?"
        body={
          <p className="adm-modal-text">
            <strong style={{ color: 'var(--text)' }}>{deleteTarget?.email}</strong>
            <br />
            They'll lose access immediately. Their authored posts stay but lose attribution.
          </p>
        }
        confirmLabel={deleter.loading ? 'Deleting…' : 'Delete'}
        destructive
      />
    </>
  );
}

/* ─── Create user ─── */
function CreateUserModal({ open, onClose, onCreated }) {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPwd]    = useState('');
  const [role, setRole]       = useState('admin');
  const [errors, setErrors]   = useState({});
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (open) {
      setName(''); setEmail(''); setPwd(''); setRole('admin');
      setErrors({}); setFeedback('');
    }
  }, [open]);

  const creator = useAsyncCallback((payload) => api.post('/admin/users.php', payload));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); setFeedback('');
    try {
      await creator.run({ name, email, password, role });
      onCreated?.();
      onClose?.();
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      setFeedback(err.message || 'Could not create user.');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New admin user" size="md">
      <form onSubmit={handleSubmit}>
        <label className="adm-field">
          <span className="adm-field-label">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="adm-input" required />
          {errors.name && <span className="adm-modal-error">{errors.name}</span>}
        </label>
        <label className="adm-field">
          <span className="adm-field-label">Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="adm-input" required />
          {errors.email && <span className="adm-modal-error">{errors.email}</span>}
        </label>
        <label className="adm-field">
          <span className="adm-field-label">
            Initial password
            <span className="adm-field-hint">at least 8 characters · they can change it after sign-in</span>
          </span>
          <input type="text" value={password} onChange={(e) => setPwd(e.target.value)} className="adm-input" minLength={8} required />
          {errors.password && <span className="adm-modal-error">{errors.password}</span>}
        </label>
        <label className="adm-field">
          <span className="adm-field-label">Role</span>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="adm-input adm-select">
            <option value="admin">Admin (manage content)</option>
            <option value="owner">Owner (manage content + users)</option>
          </select>
        </label>

        {feedback && <p className="adm-modal-error">{feedback}</p>}

        <ModalFooter>
          <button type="button" onClick={onClose} className="adm-btn adm-btn-ghost">Cancel</button>
          <button type="submit" className="adm-btn adm-btn-primary" disabled={creator.loading}>
            {creator.loading ? 'Creating…' : 'Create admin'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

/* ─── Edit user ─── */
function EditUserModal({ user, currentUser, onClose, onSaved }) {
  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole]   = useState('admin');
  const [errors, setErrors]   = useState({});
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setRole(user.role || 'admin');
      setErrors({}); setFeedback('');
    }
  }, [user]);

  const saver = useAsyncCallback((payload) => api.patch(`/admin/users.php?id=${user.id}`, payload));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); setFeedback('');
    try {
      await saver.run({ name, email, role });
      onSaved?.();
      onClose?.();
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      setFeedback(err.message || 'Could not save.');
    }
  };

  const isSelf = user && currentUser && user.id === currentUser.id;

  return (
    <Modal open={!!user} onClose={onClose} title="Edit admin" size="md">
      <form onSubmit={handleSubmit}>
        <label className="adm-field">
          <span className="adm-field-label">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="adm-input" required />
          {errors.name && <span className="adm-modal-error">{errors.name}</span>}
        </label>
        <label className="adm-field">
          <span className="adm-field-label">Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="adm-input" required />
          {errors.email && <span className="adm-modal-error">{errors.email}</span>}
        </label>
        <label className="adm-field">
          <span className="adm-field-label">
            Role
            {isSelf && (
              <span className="adm-field-hint">you can't demote yourself</span>
            )}
          </span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="adm-input adm-select"
            disabled={isSelf}
          >
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
          </select>
        </label>

        {feedback && <p className="adm-modal-error">{feedback}</p>}

        <ModalFooter>
          <button type="button" onClick={onClose} className="adm-btn adm-btn-ghost">Cancel</button>
          <button type="submit" className="adm-btn adm-btn-primary" disabled={saver.loading}>
            {saver.loading ? 'Saving…' : 'Save changes'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

/* ─── Reset password (owner overrides target's password) ─── */
function ResetPasswordModal({ user, onClose, onSaved }) {
  const [password, setPassword] = useState('');
  const [errors, setErrors]     = useState({});
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (user) { setPassword(''); setErrors({}); setFeedback(''); }
  }, [user]);

  const resetter = useAsyncCallback(() =>
    api.post(`/admin/users.php?id=${user.id}&action=reset-password`, { password })
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); setFeedback('');
    try {
      await resetter.run();
      onSaved?.();
      onClose?.();
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      setFeedback(err.message || 'Could not reset.');
    }
  };

  return (
    <Modal open={!!user} onClose={onClose} title={`Reset password for ${user?.email || ''}`} size="sm">
      <p className="adm-modal-text">
        Set a new password for this user. All their other sessions will be signed out
        immediately. Tell them the password through a secure channel.
      </p>
      <form onSubmit={handleSubmit}>
        <label className="adm-field">
          <span className="adm-field-label">
            New password
            <span className="adm-field-hint">at least 8 characters</span>
          </span>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="adm-input"
            minLength={8}
            required
            autoFocus
          />
          {errors.password && <span className="adm-modal-error">{errors.password}</span>}
        </label>

        {feedback && <p className="adm-modal-error">{feedback}</p>}

        <ModalFooter>
          <button type="button" onClick={onClose} className="adm-btn adm-btn-ghost">Cancel</button>
          <button type="submit" className="adm-btn adm-btn-primary" disabled={resetter.loading}>
            {resetter.loading ? 'Resetting…' : 'Reset password'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
