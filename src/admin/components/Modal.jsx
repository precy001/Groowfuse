/**
 * Reusable modal for admin dialogs. Renders into document.body via a portal
 * so it sits above everything regardless of stacking context.
 *
 * Closes on Escape, click on backdrop, or clicking the × button.
 * The first focusable element inside is auto-focused on open.
 *
 * Usage:
 *   <Modal open={open} onClose={() => setOpen(false)} title="Delete post?" size="sm">
 *     <p>Are you sure?</p>
 *     <ModalFooter>
 *       <button onClick={cancel}>Cancel</button>
 *       <button onClick={confirm}>Delete</button>
 *     </ModalFooter>
 *   </Modal>
 */

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({
  open,
  onClose,
  title,
  size = 'sm',           // 'sm' | 'md' | 'lg'
  children,
  hideClose = false,
  initialFocus,          // optional ref to the element that should receive focus on open
}) {
  const cardRef = useRef(null);
  const previouslyFocused = useRef(null);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Focus management — restore focus on close, auto-focus on open
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement;

    // Defer to next tick so the DOM exists
    const t = setTimeout(() => {
      if (initialFocus?.current) {
        initialFocus.current.focus();
      } else if (cardRef.current) {
        const focusable = cardRef.current.querySelector(
          'input, textarea, button:not([data-modal-close]), select, [tabindex]:not([tabindex="-1"])'
        );
        focusable?.focus();
      }
    }, 50);

    return () => {
      clearTimeout(t);
      previouslyFocused.current?.focus?.();
    };
  }, [open, initialFocus]);

  if (!open) return null;

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return createPortal(
    <div
      className="adm-modal-backdrop"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'adm-modal-title' : undefined}
    >
      <div
        ref={cardRef}
        className={`adm-modal adm-modal-${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || !hideClose) && (
          <header className="adm-modal-header">
            {title && <h2 id="adm-modal-title" className="adm-modal-title">{title}</h2>}
            {!hideClose && (
              <button
                type="button"
                onClick={onClose}
                className="adm-modal-close"
                aria-label="Close dialog"
                data-modal-close
              >
                ×
              </button>
            )}
          </header>
        )}
        <div className="adm-modal-body">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export function ModalFooter({ children }) {
  return <div className="adm-modal-footer">{children}</div>;
}
