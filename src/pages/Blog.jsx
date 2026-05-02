/**
 * Groow Fuse Consult — Blog index
 * --------------------------------------------------------
 * Posts come from src/data/posts.js (hardcoded for now).
 * Replace with API/CMS calls when the backend is ready.
 *
 * Visual rhythm:
 *   1. Hero with category filter chips
 *   2. Featured post — the most recent, large card
 *   3. Post grid — filtered by selected category
 *   4. Newsletter strip
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useReveal, useMouseGlow } from '../lib/hooks';
import { usePostList, useCategoriesFromList, formatDate } from '../lib/posts';
import { apiUrl } from '../lib/api';

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('all');

  // Fetch all posts in one call (admin volume is small enough that we don't
  // need server-side category filtering for the index page — we sort + filter
  // client-side so the category chips switch instantly without a refetch).
  const { data, error, loading, reload } = usePostList({ category: 'all', limit: 100 });

  const posts      = data?.posts || [];
  const categories = useCategoriesFromList(data);

  // Most recent post (by date) is always featured at top
  const featured = useMemo(() => {
    if (posts.length === 0) return null;
    return [...posts].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  }, [posts]);

  // Grid posts: everything except the featured, filtered by category
  const gridPosts = useMemo(() => {
    if (!featured) return [];
    return posts
      .filter((p) => p.slug !== featured.slug)
      .filter((p) => activeCategory === 'all' || p.category?.id === activeCategory)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [posts, activeCategory, featured]);

  // Blog index structured data — surfaces all posts to crawlers in one shot
  const jsonLd = posts.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    'name': 'GroowFuse — Insights',
    'url': 'https://groowfuse.com/blog',
    'description': 'Field notes from the engagements we run — on procurement, process, automation, and digital transformation.',
    'publisher': {
      '@type': 'Organization',
      'name': 'GroowFuse Consult',
      'url': 'https://groowfuse.com',
    },
    'blogPost': posts.map((p) => ({
      '@type': 'BlogPosting',
      'headline': p.title,
      'description': p.excerpt,
      'datePublished': p.date,
      'url': `https://groowfuse.com/blog/${p.slug}`,
      'author': { '@type': 'Organization', 'name': p.author?.name || 'GroowFuse Editorial' },
    })),
  } : null;

  return (
    <div className="gf-root">
      <SEO
        title="Insights"
        description="Practical insights for SME leaders — field notes on procurement, process, automation, and digital transformation. No fluff, no vendor pitches."
        url="https://groowfuse.com/blog"
        jsonLd={jsonLd}
        jsonLdId="blog"
      />
      <Nav />
      <BlogHero
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        categories={categories}
      />

      {loading ? (
        <BlogStatus>Loading articles…</BlogStatus>
      ) : error ? (
        <BlogStatus>
          <p style={{ color: 'var(--text)', marginBottom: 12 }}>
            We couldn't load the articles right now.
          </p>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>
            {error.message}
          </p>
          <button
            type="button"
            onClick={reload}
            className="gf-btn-primary"
            style={{ padding: '10px 18px' }}
          >
            Try again
          </button>
        </BlogStatus>
      ) : posts.length === 0 ? (
        <BlogStatus>No articles published yet. Check back soon.</BlogStatus>
      ) : (
        <>
          <FeaturedPost post={featured} />
          <PostList posts={gridPosts} category={activeCategory} categories={categories} />
        </>
      )}

      <NewsletterStrip />
      <Footer />
    </div>
  );
}

/* Tiny status panel used for loading / error / empty */
function BlogStatus({ children }) {
  return (
    <section className="relative py-24 lg:py-32 border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-[800px] mx-auto px-6 lg:px-10 text-center">
        {children}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * Hero
 * ──────────────────────────────────────────────────────────── */

function BlogHero({ activeCategory, onCategoryChange, categories = [] }) {
  const spotRef = useMouseGlow();

  return (
    <section ref={spotRef} className="gf-hero gf-spotlight">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=2400&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.16,
          filter: 'grayscale(100%) contrast(1.05)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,10,11,0.7) 0%, rgba(10,10,11,0.45) 45%, rgba(10,10,11,0.95) 100%)',
        }}
      />
      <div className="absolute inset-0 gf-grid gf-drift opacity-80 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-[200px] pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, var(--bg), transparent)' }} />
      <div className="absolute inset-x-0 bottom-0 h-[160px] pointer-events-none"
        style={{ background: 'linear-gradient(to top, var(--bg), transparent)' }} />
      <div
        aria-hidden
        className="gf-orb absolute"
        style={{
          left: '50%', top: '65%', width: 520, height: 520,
          background: 'radial-gradient(circle, rgba(31,224,122,0.28) 0%, rgba(31,224,122,0.08) 35%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      <div className="absolute inset-0 gf-noise opacity-25 pointer-events-none mix-blend-overlay" />

      <div className="gf-hero-inner">
        {/* TOP — eyebrow + breadcrumb */}
        <div className="flex items-center justify-between gf-rise" style={{ animationDelay: '.05s' }}>
          <span className="gf-eyebrow">Insights</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--dim)', letterSpacing: '0.22em' }}>
            <Link to="/" style={{ color: 'var(--dim)' }}>HOME</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--green)' }}>BLOG</span>
          </span>
        </div>

        {/* CENTER */}
        <div className="gf-hero-center">
          <div className="gf-rise" style={{ animationDelay: '.15s' }}>
            <h1 className="gf-h1" style={{ maxWidth: '20ch' }}>
              Practical{' '}
              <span className="gf-serif" style={{ color: 'var(--green)' }}>insights</span>{' '}
              for SME{' '}
              <span style={{ whiteSpace: 'nowrap' }}>
                leaders.
                <span className="gf-caret" />
              </span>
            </h1>
            <p className="mt-8 max-w-[60ch] text-[16px] md:text-[18px] leading-relaxed"
              style={{ color: 'var(--muted)' }}>
              Field notes from the engagements we run — on procurement, process,
              automation, and the messy work of digital transformation. No fluff.
              No vendor pitches.
            </p>
          </div>
        </div>

        {/* BOTTOM — category filter chips */}
        <div className="gf-rise" style={{ animationDelay: '.4s' }}>
          <div className="pt-5 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-x-3 gap-y-3 flex-wrap">
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)', letterSpacing: '0.18em', marginRight: 8 }}>
                FILTER /
              </span>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onCategoryChange(cat.id)}
                  className={`gf-chip ${activeCategory === cat.id ? 'is-active' : ''}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * Featured post — large highlight card
 * ──────────────────────────────────────────────────────────── */

function FeaturedPost({ post }) {
  const [ref, shown] = useReveal(0.1);

  return (
    <section
      ref={ref}
      className="relative py-24 lg:py-32 border-t"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="absolute inset-0 gf-grid-dense opacity-20 pointer-events-none" />
      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className={`gf-reveal ${shown ? 'is-shown' : ''} mb-10 flex items-baseline justify-between gap-6 flex-wrap`}>
          <span className="gf-eyebrow">Latest</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--dim)', letterSpacing: '0.18em' }}>
            FEATURED / 01
          </span>
        </div>

        <Link to={`/blog/${post.slug}`} className="gf-featured-card block">
          <article className="gf-featured-grid">
            {/* Image */}
            <div className="gf-featured-image">
              <img src={apiUrl(post.coverImage)} alt={post.coverAlt} loading="lazy" />
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(10,10,11,0.35) 0%, rgba(10,10,11,0.15) 50%, rgba(10,10,11,0.7) 100%)',
                }}
              />
              <div className="absolute inset-0 gf-grid-dense opacity-25 pointer-events-none" />
              {/* Corner brackets */}
              <span className="absolute" style={{ top: 12, left: 12, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--green)' }}>┌</span>
              <span className="absolute" style={{ top: 12, right: 12, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--green)' }}>┐</span>
              <span className="absolute" style={{ bottom: 12, left: 12, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--green)' }}>└</span>
              <span className="absolute" style={{ bottom: 12, right: 12, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--green)' }}>┘</span>
              {/* Category badge */}
              <span className="gf-category-badge" style={{ top: 20, left: 20 }}>
                {post.category.label}
              </span>
            </div>

            {/* Content */}
            <div className={`gf-featured-content gf-reveal gf-reveal-1 ${shown ? 'is-shown' : ''}`}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--green)', letterSpacing: '0.2em' }}>
                CONTINUE READING ↗
              </span>
              <h2 className="gf-h2 mt-6" style={{ fontSize: 'clamp(28px, 3.6vw, 44px)', lineHeight: 1.1 }}>
                {post.title}
              </h2>
              <p className="mt-6 max-w-[52ch] text-[15px] md:text-[16px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                {post.excerpt}
              </p>

              <div className="mt-10 flex items-center gap-5 flex-wrap">
                <PostMeta post={post} />
              </div>

              <span className="gf-link mt-12 text-[14px] font-medium" style={{ display: 'inline-flex' }}>
                Read article
                <span aria-hidden>→</span>
              </span>
            </div>
          </article>
        </Link>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * Post list — vertical stack of horizontal expandable cards
 * ──────────────────────────────────────────────────────────── */

function PostList({ posts, category, categories = [] }) {
  const [ref, shown] = useReveal(0.05);

  return (
    <section
      ref={ref}
      className="relative py-24 lg:py-32 border-t"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <div className="absolute inset-0 gf-grid-dense opacity-25 pointer-events-none" />
      <div className="relative max-w-[1100px] mx-auto px-6 lg:px-10">
        <div className={`gf-reveal ${shown ? 'is-shown' : ''} mb-14 flex items-baseline justify-between gap-6 flex-wrap`}>
          <div>
            <span className="gf-eyebrow">All posts</span>
            <h2 className="gf-h2 mt-6" style={{ fontSize: 'clamp(26px, 3.2vw, 40px)' }}>
              {category === 'all'
                ? <>From the <span className="gf-serif" style={{ color: 'var(--green)' }}>field</span>.</>
                : <>Filtered to <span className="gf-serif" style={{ color: 'var(--green)' }}>{categories.find((c) => c.id === category)?.label}</span>.</>
              }
            </h2>
          </div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--dim)', letterSpacing: '0.18em' }}>
            {posts.length} {posts.length === 1 ? 'POST' : 'POSTS'}
          </span>
        </div>

        {posts.length > 0 ? (
          <div className="gf-post-list">
            {posts.map((post, i) => (
              <ExpandableListCard
                key={post.slug}
                post={post}
                index={i}
                delay={i}
                shown={shown}
              />
            ))}
          </div>
        ) : (
          <div className="gf-empty-state">
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--dim)', letterSpacing: '0.18em' }}>
              No posts in this category yet.
            </span>
            <p className="mt-4 max-w-[40ch] mx-auto text-[15px]" style={{ color: 'var(--muted)' }}>
              We're working on more — check back soon, or browse all posts.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function ExpandableListCard({ post, index, delay = 0, shown }) {
  const [expanded, setExpanded] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const toggleExpanded = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const toggleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarked(!bookmarked);
  };

  const number = String(index + 1).padStart(2, '0');

  return (
    <article
      className={`gf-list-card gf-reveal gf-reveal-${(delay % 4) + 1} ${shown ? 'is-shown' : ''} ${expanded ? 'is-expanded' : ''}`}
    >
      {/* Image — itself a link to the article */}
      <Link to={`/blog/${post.slug}`} className="gf-list-card-image" aria-label={`Read: ${post.title}`}>
        <img src={apiUrl(post.coverImage)} alt={post.coverAlt} loading="lazy" />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(10,10,11,0.2) 0%, rgba(10,10,11,0.0) 40%, rgba(10,10,11,0.55) 100%)',
          }}
        />
        <div className="absolute inset-0 gf-grid-dense opacity-20 pointer-events-none" />
        <span className="gf-category-badge" style={{ top: 12, left: 12 }}>
          {post.category.label}
        </span>
        <span className="gf-list-card-num" aria-hidden>{number}</span>
      </Link>

      {/* Content */}
      <div className="gf-list-card-content">
        <div className="gf-list-card-header">
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)', letterSpacing: '0.18em' }}>
            {formatDate(post.date).toUpperCase()} · {post.readMinutes} MIN READ
          </span>
          <div className="gf-list-card-actions">
            <button
              type="button"
              onClick={toggleBookmark}
              className={`gf-list-card-action ${bookmarked ? 'is-active' : ''}`}
              aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this post'}
              aria-pressed={bookmarked}
            >
              <BookmarkIcon filled={bookmarked} />
            </button>
            <button
              type="button"
              onClick={toggleExpanded}
              className={`gf-list-card-action gf-list-card-toggle ${expanded ? 'is-active' : ''}`}
              aria-label={expanded ? 'Collapse details' : 'Expand details'}
              aria-expanded={expanded}
            >
              <ChevronIcon />
            </button>
          </div>
        </div>

        <Link to={`/blog/${post.slug}`} className="gf-list-card-title-link">
          <h3 className="gf-list-card-title">{post.title}</h3>
        </Link>

        <div className="gf-list-card-meta">
          <span className="gf-post-meta-avatar" aria-hidden>
            {post.author.name.charAt(0)}
          </span>
          <span className="gf-list-card-author">{post.author.name}</span>
          <span style={{ color: 'var(--dim)' }}>·</span>
          <span style={{ color: 'var(--muted)' }}>{post.author.role}</span>
        </div>

        {/* Expandable body */}
        <div className="gf-list-card-body">
          <div className="gf-list-card-body-inner">
            <p className="gf-list-card-excerpt">{post.excerpt}</p>

            {post.tags?.length > 0 && (
              <div className="gf-list-card-tags">
                {post.tags.map((t) => (
                  <span key={t} className="gf-tag-pill">{t}</span>
                ))}
              </div>
            )}

            <Link
              to={`/blog/${post.slug}`}
              className="gf-btn-primary gf-list-card-cta"
            >
              Read full article
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 5 L7 9 L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Shared meta line: author / date / read time */
function PostMeta({ post, compact }) {
  return (
    <div className="gf-post-meta">
      <span className="gf-post-meta-avatar" aria-hidden>
        {post.author.name.charAt(0)}
      </span>
      <span className="gf-post-meta-text">
        <span className="gf-post-meta-author">{post.author.name}</span>
        <span className="gf-post-meta-sep">·</span>
        <span className="gf-post-meta-date">{formatDate(post.date)}</span>
        {!compact && (
          <>
            <span className="gf-post-meta-sep">·</span>
            <span className="gf-post-meta-read">{post.readMinutes} min read</span>
          </>
        )}
      </span>
      {compact && (
        <span className="gf-post-meta-read-compact">{post.readMinutes} min</span>
      )}
    </div>
  );
}

export function BookmarkIcon({ filled }) {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
      <path
        d="M2 1.5 L12 1.5 L12 14 L7 11 L2 14 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill={filled ? 'currentColor' : 'none'}
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
 * Newsletter strip — quiet closer
 * ──────────────────────────────────────────────────────────── */

function NewsletterStrip() {
  const [ref, shown] = useReveal();
  return (
    <section ref={ref} className="relative py-32 border-t overflow-hidden"
      style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
      <div className="absolute inset-0 gf-grid-dense opacity-25 pointer-events-none" />
      <div className="relative max-w-[1080px] mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className={`gf-reveal ${shown ? 'is-shown' : ''} lg:col-span-7`}>
            <span className="gf-eyebrow">Newsletter</span>
            <h2 className="mt-6" style={{ fontSize: 'clamp(28px, 3.6vw, 44px)', fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
              New posts in your{' '}
              <span className="gf-serif" style={{ color: 'var(--green)' }}>inbox</span>.
            </h2>
            <p className="mt-6 max-w-[52ch] text-[15px] leading-relaxed" style={{ color: 'var(--muted)' }}>
              We send one email when there's a new post worth reading. No spam, no promotions,
              one-click unsubscribe.
            </p>
          </div>
          <div className={`gf-reveal gf-reveal-1 ${shown ? 'is-shown' : ''} lg:col-span-5 lg:col-start-8`}>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)', letterSpacing: '0.18em' }}>
              SIGN UP IN THE FOOTER ↓
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}