/**
 * Brand logo — renders the official image asset.
 *
 * The asset is imported from src/assets/logo.png. Drop your real logo
 * file at that path and Vite will fingerprint and bundle it.
 *
 * If your file is a different format (svg, webp), update the import below.
 *
 * Props:
 *   height    Controls the displayed pixel height. Width is auto.
 *   className Optional extra class for one-off styling.
 *   alt       Accessible alt text. Defaults to "GroowFuse Consult".
 */

import logoSrc from '../assets/logo.png';

export default function Logo({
  height = 36,
  className = '',
  alt = 'GroowFuse Consult',
}) {
  return (
    <img
      src={logoSrc}
      alt={alt}
      className={`gf-logo ${className}`.trim()}
      style={{
        height: `${height}px`,
        width: 'auto',
        display: 'block',
      }}
    />
  );
}