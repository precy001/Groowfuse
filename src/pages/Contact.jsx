import ComingSoon from '../components/ComingSoon';

export default function Contact() {
  return (
    <ComingSoon
      eyebrow="Contact"
      title={
        <>
          Let's{' '}
          <span style={{ whiteSpace: 'nowrap' }}>
            <span className="gf-serif" style={{ color: 'var(--green)' }}>talk</span>.
          </span>
        </>
      }
      body="The contact form is on the way. Until then, send us an email and we'll get back to you within one business day with availability and next steps."
    />
  );
}