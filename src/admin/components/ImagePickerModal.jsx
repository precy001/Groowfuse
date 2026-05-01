/**
 * Image picker modal — two ways in: paste a URL, or upload from disk.
 *
 * For uploads, currently inlines the image as a base64 data URL (works
 * without a backend). Once the upload endpoint exists, swap the
 * FileReader path for a fetch to /api/upload and use the returned URL.
 *
 * Resolves with: { src, alt } — calls onPick(src, alt) and closes.
 */

import { useEffect, useRef, useState } from 'react';
import Modal, { ModalFooter } from './Modal';

const MAX_FILE_BYTES = 5 * 1024 * 1024;  // 5 MB safety cap on inline base64

export default function ImagePickerModal({ open, onClose, onPick, title = 'Insert image' }) {
  const [tab, setTab] = useState('upload'); // 'upload' | 'url'
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [preview, setPreview] = useState('');     // displayed in preview pane
  const [pendingSrc, setPendingSrc] = useState(''); // what gets passed to onPick
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Reset when reopened
  useEffect(() => {
    if (open) {
      setTab('upload');
      setUrl('');
      setAlt('');
      setPreview('');
      setPendingSrc('');
      setError('');
      setBusy(false);
    }
  }, [open]);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('That file does not look like an image.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError(`Image must be under ${(MAX_FILE_BYTES / 1024 / 1024).toFixed(0)} MB.`);
      return;
    }

    setError('');
    setBusy(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setPreview(dataUrl);
      setPendingSrc(dataUrl);
      setBusy(false);
    };
    reader.onerror = () => {
      setError('Could not read that file.');
      setBusy(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (value) => {
    setUrl(value);
    setError('');
    if (value && /^https?:\/\//i.test(value)) {
      setPreview(value);
      setPendingSrc(value);
    } else {
      setPreview('');
      setPendingSrc('');
    }
  };

  const handleConfirm = () => {
    if (!pendingSrc) {
      setError('Pick an image first.');
      return;
    }
    onPick?.(pendingSrc, alt);
    onClose?.();
  };

  return (
    <Modal open={open} onClose={onClose} title={title} size="md">
      {/* Tab strip */}
      <div className="adm-modal-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'upload'}
          onClick={() => setTab('upload')}
          className={`adm-modal-tab ${tab === 'upload' ? 'is-active' : ''}`}
        >
          Upload from device
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'url'}
          onClick={() => setTab('url')}
          className={`adm-modal-tab ${tab === 'url' ? 'is-active' : ''}`}
        >
          Paste URL
        </button>
      </div>

      {tab === 'upload' ? (
        <UploadTab onFile={handleFile} busy={busy} />
      ) : (
        <UrlTab url={url} onChange={handleUrlChange} />
      )}

      {/* Preview */}
      {preview && (
        <div className="adm-modal-preview">
          <img src={preview} alt="" />
        </div>
      )}

      {/* Alt text — applies to both tabs */}
      <label className="adm-field" style={{ marginTop: 16, marginBottom: 0 }}>
        <span className="adm-field-label">
          Alt text
          <span className="adm-field-hint">describes the image for screen readers and search</span>
        </span>
        <input
          type="text"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="A short, plain description"
          className="adm-input"
        />
      </label>

      {error && <p className="adm-modal-error" role="alert">{error}</p>}

      <ModalFooter>
        <button type="button" onClick={onClose} className="adm-btn adm-btn-ghost">Cancel</button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!pendingSrc || busy}
          className="adm-btn adm-btn-primary"
        >
          Insert image
        </button>
      </ModalFooter>
    </Modal>
  );
}

/* ─── Tabs ─── */

function UploadTab({ onFile, busy }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    onFile(file);
  };

  return (
    <div
      className={`adm-dropzone ${dragOver ? 'is-over' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => onFile(e.target.files?.[0])}
        style={{ display: 'none' }}
      />
      <div className="adm-dropzone-icon" aria-hidden>↑</div>
      <p className="adm-dropzone-primary">
        {busy ? 'Reading file…' : 'Drop an image here, or click to browse'}
      </p>
      <p className="adm-dropzone-secondary">
        PNG, JPG, GIF, or WebP — up to 5 MB
      </p>
      <p className="adm-dropzone-note">
        Stored inline for now. Real upload endpoint plugs in when the backend lands.
      </p>
    </div>
  );
}

function UrlTab({ url, onChange }) {
  return (
    <label className="adm-field">
      <span className="adm-field-label">Image URL</span>
      <input
        type="url"
        value={url}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://…"
        className="adm-input adm-input-lg"
        autoFocus
      />
    </label>
  );
}
