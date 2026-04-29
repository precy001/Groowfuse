import ComingSoon from '../components/ComingSoon';

export default function Blog() {
  return (
    <ComingSoon
      eyebrow="Blog"
      title={
        <>
          Insights are{' '}
          <span style={{ whiteSpace: 'nowrap' }}>
            <span className="gf-serif" style={{ color: 'var(--green)' }}>brewing</span>.
          </span>
        </>
      }
      body="Our blog launches soon — practical guides for SME leaders on process, procurement, and digital transformation. Subscribe to the newsletter below to get notified."
    />
  );
}