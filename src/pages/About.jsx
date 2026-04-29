import ComingSoon from '../components/ComingSoon';

export default function About() {
  return (
    <ComingSoon
      eyebrow="About"
      title={
        <>
          The story is{' '}
          <span style={{ whiteSpace: 'nowrap' }}>
            <span className="gf-serif" style={{ color: 'var(--green)' }}>still</span>{' '}
            <span className="gf-serif" style={{ color: 'var(--green)' }}>being</span> written.
          </span>
        </>
      }
      body="Our about page is in the works. In the meantime, the best way to get to know us is to get in touch — we respond within one business day."
    />
  );
}