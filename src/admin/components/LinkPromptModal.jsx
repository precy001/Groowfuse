/**
 * Link prompt modal — for the rich text editor's link button.
 * Replaces window.prompt with a proper themed dialog.
 *
 * Pre-fills with the existing link if the cursor is inside one.
 */

import { useEffect, useRef, useState } from 'react';
import Modal, { ModalFooter } from './Modal';

export default function LinkPromptModal({ open, onClose, onSubmit, initialUrl = '' }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUrl(initialUrl);
      setError('');
    }
  }, [open, initialUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = url.trim();

    // Empty submit means "remove the link" — handled by parent
    if (!trimmed) {
      onSubmit?.('');
      onClose?.();
      return;
    }

    // Loose URL check — accept http(s)://, mailto:, tel:, anchors
    if (!/^(https?:\/\/|mailto:|tel:|#|\/)/.test(trimmed)) {
      setError('Use a full URL (https://…) or mailto:, tel:, # or /');
      return;
    }

    onSubmit?.(trimmed);
    onClose?.();
  };

  const handleRemove = () => {
    onSubmit?.('');
    onClose?.();
  };

  return (
    <Modal open={open} onClose={onClose} title="Insert link" size="sm" initialFocus={inputRef}>
      <form onSubmit={handleSubmit}>
        <label className="adm-field">
          <span className="adm-field-label">URL</span>
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(''); }}
            placeholder="https://example.com or mailto:hi@…"
            className="adm-input adm-input-lg"
          />
        </label>

        {error && <p className="adm-modal-error" role="alert">{error}</p>}

        <ModalFooter>
          {initialUrl && (
            <button
              type="button"
              onClick={handleRemove}
              className="adm-btn adm-btn-ghost"
              style={{ marginRight: 'auto' }}
            >
              Remove link
            </button>
          )}
          <button type="button" onClick={onClose} className="adm-btn adm-btn-ghost">Cancel</button>
          <button type="submit" className="adm-btn adm-btn-primary">
            {initialUrl ? 'Update' : 'Insert'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
