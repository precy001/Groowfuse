/**
 * Brand logo — renders the official image asset on a white badge.
 *
 * The image's glyphs are dark and would disappear against the site's dark
 * theme, so the logo always sits inside a white-background frame. The frame
 * uses a small radius + soft shadow so it reads as a deliberate brand badge,
 * not a stuck-on sticker.
 *
 * The asset is imported from src/assets/logo.png. Drop your real logo file at
 * that path and Vite will fingerprint and bundle it. For .svg or .webp,
 * update the import below.
 *
 * Props:
 *   height    Pixel height of the IMAGE inside the frame. Width is auto.
 *             The badge itself is taller by the vertical padding.
 *   className Extra class on the badge for one-off styling.
 *   alt       Accessible alt text. Defaults to "GroowFuse Consult".
 *   bare      Skip the white badge — render just the raw image.
 *             Use this if you're putting the logo on something already light.
 */

import logoSrc from '../assets/logo.png';

export default function Logo({
  height = 36,
  className = '',
  alt = 'GroowFuse Consult',
  bare = false,
}) {
  const img = (
    <img
      src={logoSrc}
      alt={alt}
      style={{
        height: `${height}px`,
        width: 'auto',
        display: 'block',
      }}
    />
  );

  if (bare) {
    return <span className={`gf-logo ${className}`.trim()}>{img}</span>;
  }

  return (
    <span className={`gf-logo gf-logo-badge ${className}`.trim()}>
      {img}
    </span>
  );
}