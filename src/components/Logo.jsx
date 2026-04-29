/**
 * Brand mark — leaf + infinity, paired with the GroowFuse wordmark.
 *
 * The two motifs come from the official brand logo:
 *   • Sprouting leaf — growth ("Groow")
 *   • Infinity loop — fusion ("Fuse")
 *
 * Implemented as inline SVG so it scales cleanly and inherits the theme's
 * green token. Use the raw asset at /public/logo.png for light-theme
 * contexts (PDFs, email signatures, social cards, etc.).
 *
 * Display modes:
 *   <Logo />         → mark only
 *   <Logo withWord /> → mark + "GroowFuse" wordmark beside it
 */

export default function Logo({ size = 32, withWord = false }) {
  return (
    <span
      className="gf-logo"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        lineHeight: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="GroowFuse"
        role="img"
      >
        {/* Leaf — top-right, the growth motif */}
        <path
          d="M44 6
             C 51 7   57 13  57 21
             C 57 30  49 38  39 38
             C 35 38  31 35  31 31
             C 31 22  35 11  44 6 Z"
          fill="var(--green, #1FE07A)"
        />
        {/* Stem — connects leaf into the lower mark */}
        <path
          d="M37 38 C 37 44 35 48 32 52"
          stroke="var(--green, #1FE07A)"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.5"
        />
        {/* Infinity — bottom, the fusion motif (two interlocking loops) */}
        <path
          d="M 16 50
             C 16 46  19 43  23 43
             C 28 43  30 47  32 50
             C 34 53  36 57  41 57
             C 45 57  48 54  48 50
             C 48 46  45 43  41 43
             C 36 43  34 47  32 50
             C 30 53  28 57  23 57
             C 19 57  16 54  16 50 Z"
          stroke="var(--green, #1FE07A)"
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {withWord && (
        <span
          style={{
            fontSize: 15,
            letterSpacing: '-0.015em',
            fontWeight: 500,
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          Groow<span style={{ color: 'var(--green)' }}>Fuse</span>
        </span>
      )}
    </span>
  );
}