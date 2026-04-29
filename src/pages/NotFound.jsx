import ComingSoon from '../components/ComingSoon';

export default function NotFound() {
  return (
    <ComingSoon
      eyebrow="404"
      title={
        <>
          Page{' '}
          <span style={{ whiteSpace: 'nowrap' }}>
            <span className="gf-serif" style={{ color: 'var(--green)' }}>not</span> found.
          </span>
        </>
      }
      body="The page you're looking for doesn't exist or has moved. Use the navigation to find your way back, or get in touch if you think this is a mistake."
    />
  );
}