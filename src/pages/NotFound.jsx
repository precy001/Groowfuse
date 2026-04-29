import ComingSoon from '../components/ComingSoon';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <>
      <SEO
        title="Page not found"
        description="The page you're looking for doesn't exist or has moved."
        noindex
      />
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
    </>
  );
}