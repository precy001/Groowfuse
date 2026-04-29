/**
 * Brand logo. Used by Nav and Footer.
 */
export default function Logo({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="gf-float"
      aria-label="Groow Fuse"
    >
      <circle cx="14" cy="14" r="13" stroke="currentColor" strokeOpacity="0.25" />
      <circle cx="14" cy="14" r="4" fill="var(--green)" />
      <path
        d="M14 1 L14 9 M14 19 L14 27 M1 14 L9 14 M19 14 L27 14"
        stroke="var(--green)"
        strokeOpacity="0.5"
        strokeWidth="1"
      />
    </svg>
  );
}