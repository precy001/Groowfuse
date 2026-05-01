/**
 * Confirm dialog — for destructive or one-way actions.
 * Replaces window.confirm/alert with a themed modal.
 *
 * Usage:
 *   <ConfirmModal
 *     open={open}
 *     onClose={close}
 *     onConfirm={doIt}
 *     title="Delete post?"
 *     body="This cannot be undone."
 *     confirmLabel="Delete"
 *     destructive
 *   />
 */

import Modal, { ModalFooter } from './Modal';

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
}) {
  const handleConfirm = () => {
    onConfirm?.();
    onClose?.();
  };

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      {typeof body === 'string' ? (
        <p className="adm-modal-text">{body}</p>
      ) : (
        body
      )}

      <ModalFooter>
        <button type="button" onClick={onClose} className="adm-btn adm-btn-ghost">
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className={`adm-btn ${destructive ? 'adm-btn-danger' : 'adm-btn-primary'}`}
        >
          {confirmLabel}
        </button>
      </ModalFooter>
    </Modal>
  );
}
