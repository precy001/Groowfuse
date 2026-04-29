/**
 * Groow Fuse Consult — Individual blog post
 * --------------------------------------------------------
 * Reads the slug from the URL, looks up the post in src/data/posts.js,
 * and renders the article with hero, prose body, action bar, related posts.
 *
 * Visual rhythm:
 *   1. Article hero — category, title, meta, cover image
 *   2. Prose body — typed content blocks
 *   3. Action bar — like / save / share
 *   4. Related posts — 3 cards
 */

import { useEffect, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { useReveal } from '../lib/hooks';
import { getPostBySlug, getRelatedPosts, formatDate } from '../data/posts';
import { BookmarkIcon } from './Blog';

export default function BlogPost() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  // Unknown slug → bounce to /blog
  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const related = getRelatedPosts(post.slug, 3);

  return (
    <div className="gf-root">
      <Nav />
      <ArticleHero post={post} />
      <ArticleBody post={post} />
      <ActionBar post={post} />
      {related.length > 0 && <RelatedPosts posts={related} />}
      <Footer />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * Article hero
 * ──────────────────────────────────────────────────────────── */

function ArticleHero({ post }) {
  return (
    <section className="relative pt-36 lg:pt-44 pb-16 lg:pb-24 overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div className="absolute inset-0 gf-grid gf-drift opacity-50 pointer-events-none" />
      <div
        aria-hidden
        className="gf-orb absolute"
        style={{
          left: '50%', top: '0%', width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(31,224,122,0.18) 0%, rgba(31,224,122,0.04) 40%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          transform: 'translateX(-50%)',
        }}
      />

      <div className="relative max-w-[860px] mx-auto px-6 lg:px-10">
        {/* Breadcrumb */}
        <div className="gf-rise mb-10" style={{ animationDelay: '.05s' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--dim)', letterSpacing: '0.18em' }}>
            <Link to="/" style={{ color: 'var(--dim)' }}>HOME</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link to="/blog" style={{ color: 'var(--dim)' }}>BLOG</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--green)' }}>{post.category.label.toUpperCase()}</span>
          </span>
        </div>

        {/* Category badge */}
        <div className="gf-rise" style={{ animationDelay: '.1s' }}>
          <span className="gf-category-badge gf-category-badge-static">
            {post.category.label}
          </span>
        </div>

        {/* Title */}
        <h1
          className="gf-rise mt-8"
          style={{
            animationDelay: '.15s',
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            maxWidth: '22ch',
          }}
        >
          {post.title}
        </h1>

        {/* Excerpt */}
        <p
          className="gf-rise mt-8 max-w-[60ch]"
          style={{
            animationDelay: '.2s',
            fontSize: 'clamp(16px, 1.6vw, 19px)',
            lineHeight: 1.6,
            color: 'var(--muted)',
          }}
        >
          {post.excerpt}
        </p>

        {/* Meta */}
        <div className="gf-rise mt-10 flex items-center gap-x-8 gap-y-4 flex-wrap pb-10 border-b" style={{ animationDelay: '.25s', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(31,224,122,0.08)',
                border: '1px solid var(--border-bright)',
                color: 'var(--green)',
                fontFamily: 'var(--mono)',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {post.author.name.charAt(0)}
            </span>
            <div>
              <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{post.author.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{post.author.role}</div>
            </div>
          </div>
          <span style={{ width: 1, height: 28, background: 'var(--border)' }} />
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', letterSpacing: '0.06em' }}>
            <div>{formatDate(post.date)}</div>
            <div style={{ color: 'var(--dim)', marginTop: 2 }}>{post.readMinutes} min read</div>
          </div>
        </div>
      </div>

      {/* Cover image */}
      <div className="relative max-w-[1080px] mx-auto px-6 lg:px-10 mt-12 lg:mt-16">
        <div className="gf-article-cover">
          <img src={post.coverImage} alt={post.coverAlt} />
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, rgba(10,10,11,0.15) 0%, rgba(10,10,11,0.0) 30%, rgba(10,10,11,0.0) 70%, rgba(10,10,11,0.4) 100%)',
            }}
          />
          <div className="absolute inset-0 gf-grid-dense opacity-15 pointer-events-none" />
          <span className="absolute" style={{ top: 14, left: 14, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--green)' }}>┌</span>
          <span className="absolute" style={{ top: 14, right: 14, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--green)' }}>┐</span>
          <span className="absolute" style={{ bottom: 14, left: 14, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--green)' }}>└</span>
          <span className="absolute" style={{ bottom: 14, right: 14, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--green)' }}>┘</span>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * Article body — renders typed content blocks
 * ──────────────────────────────────────────────────────────── */

function ArticleBody({ post }) {
  return (
    <section className="relative py-20 lg:py-28">
      <div className="relative max-w-[760px] mx-auto px-6 lg:px-10">
        <div className="gf-article-prose">
          {post.content.map((block, i) => (
            <ContentBlock key={i} block={block} />
          ))}
        </div>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="mt-16 pt-10 border-t flex flex-wrap items-center gap-3" style={{ borderColor: 'var(--border)' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)', letterSpacing: '0.18em', marginRight: 4 }}>
              TAGS /
            </span>
            {post.tags.map((t) => (
              <span key={t} className="gf-tag-pill">{t}</span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ContentBlock({ block }) {
  if (block.type === 'paragraph') {
    return <p>{block.text}</p>;
  }
  if (block.type === 'heading') {
    if (block.level === 3) return <h3>{block.text}</h3>;
    return <h2>{block.text}</h2>;
  }
  if (block.type === 'list') {
    if (block.style === 'numbered') {
      return (
        <ol>
          {block.items.map((item, i) => <li key={i}>{item}</li>)}
        </ol>
      );
    }
    return (
      <ul>
        {block.items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    );
  }
  if (block.type === 'quote') {
    return (
      <blockquote>
        <p>{block.text}</p>
        {block.cite && <cite>— {block.cite}</cite>}
      </blockquote>
    );
  }
  return null;
}

/* ────────────────────────────────────────────────────────────
 * Action bar — like / save / share
 * ──────────────────────────────────────────────────────────── */

function ActionBar({ post }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mock counters that update locally so the UI feels alive
  const [likeCount, setLikeCount] = useState(124);

  const toggleLike = () => {
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    setLiked(!liked);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <section className="relative py-10 border-t border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="relative max-w-[760px] mx-auto px-6 lg:px-10">
        <div className="gf-action-bar">
          <button
            type="button"
            onClick={toggleLike}
            className={`gf-action ${liked ? 'is-active' : ''}`}
            aria-pressed={liked}
          >
            <HeartIcon filled={liked} />
            <span className="gf-action-label">
              {likeCount} {likeCount === 1 ? 'like' : 'likes'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSaved(!saved)}
            className={`gf-action ${saved ? 'is-active' : ''}`}
            aria-pressed={saved}
          >
            <BookmarkIcon filled={saved} />
            <span className="gf-action-label">
              {saved ? 'Saved' : 'Save'}
            </span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShareOpen(!shareOpen)}
              className={`gf-action ${shareOpen ? 'is-active' : ''}`}
              aria-expanded={shareOpen}
            >
              <ShareIcon />
              <span className="gf-action-label">Share</span>
            </button>
            {shareOpen && (
              <div className="gf-share-pop">
                <button type="button" onClick={handleCopy} className="gf-share-item">
                  {copied ? '✓ Link copied' : 'Copy link'}
                </button>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gf-share-item"
                >
                  Share on LinkedIn
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  className="gf-share-item"
                >
                  Email
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 14 C8 14 2 10.5 2 6 C2 4 3.5 2.5 5.5 2.5 C6.7 2.5 7.5 3.2 8 4 C8.5 3.2 9.3 2.5 10.5 2.5 C12.5 2.5 14 4 14 6 C14 10.5 8 14 8 14 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill={filled ? 'currentColor' : 'none'}
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="3.5" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12.5" cy="3.5" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12.5" cy="12.5" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 7 L10.5 4.5 M5.5 9 L10.5 11.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
 * Related posts
 * ──────────────────────────────────────────────────────────── */

function RelatedPosts({ posts }) {
  const [ref, shown] = useReveal(0.05);

  return (
    <section ref={ref} className="relative py-24 lg:py-32 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
      <div className="absolute inset-0 gf-grid-dense opacity-25 pointer-events-none" />
      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className={`gf-reveal ${shown ? 'is-shown' : ''} mb-12 flex items-baseline justify-between gap-6 flex-wrap`}>
          <div>
            <span className="gf-eyebrow">Continue reading</span>
            <h2 className="gf-h2 mt-6" style={{ fontSize: 'clamp(26px, 3.2vw, 40px)' }}>
              More from the <span className="gf-serif" style={{ color: 'var(--green)' }}>field</span>.
            </h2>
          </div>
          <Link to="/blog" className="gf-link text-[14px] font-medium" style={{ display: 'inline-flex' }}>
            All posts
            <span aria-hidden>↗</span>
          </Link>
        </div>

        <div className="gf-blog-grid">
          {posts.map((post, i) => (
            <RelatedCard key={post.slug} post={post} delay={i} shown={shown} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RelatedCard({ post, delay, shown }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className={`gf-post-card gf-reveal gf-reveal-${(delay % 4) + 1} ${shown ? 'is-shown' : ''}`}
    >
      <div className="gf-post-card-image">
        <img src={post.coverImage} alt={post.coverAlt} loading="lazy" />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(10,10,11,0.2) 0%, rgba(10,10,11,0.0) 40%, rgba(10,10,11,0.6) 100%)',
          }}
        />
        <div className="absolute inset-0 gf-grid-dense opacity-20 pointer-events-none" />
        <span className="gf-category-badge" style={{ top: 14, left: 14 }}>
          {post.category.label}
        </span>
      </div>
      <div className="gf-post-card-body">
        <h3 className="gf-post-card-title">{post.title}</h3>
        <p className="gf-post-card-excerpt">{post.excerpt}</p>
        <div className="gf-post-card-footer">
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)', letterSpacing: '0.06em' }}>
            {formatDate(post.date)} · {post.readMinutes} min read
          </span>
        </div>
      </div>
    </Link>
  );
}