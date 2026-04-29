/**
 * Per-page SEO manager.
 * --------------------------------------------------------
 * Sets title, meta description, canonical link, Open Graph, Twitter Card,
 * and optional JSON-LD structured data.
 *
 * No external dependencies — uses direct DOM mutation in useEffect.
 * Tags are reused across renders (same name/property → same node) so the
 * <head> stays clean even after route changes.
 *
 * Usage:
 *   <SEO
 *     title="About — GroowFuse"
 *     description="..."
 *     image="/og/about.jpg"
 *     jsonLd={{ '@context': 'https://schema.org', ... }}
 *   />
 */

import { useEffect } from 'react';

const SITE = {
  name: 'GroowFuse Consult',
  url: 'https://groowfuse.com',
  defaultTitle: 'GroowFuse — IT Consulting for Growing Businesses',
  defaultDescription:
    'Practical, enterprise-grade IT consulting for growing businesses. Smarter processes, smarter procurement, stronger digital foundations.',
  defaultImage: '/og-image.png',
  twitterHandle: '', // add when ready
  locale: 'en_US',
};

/**
 * Find or create a meta tag matching the given attribute selector.
 * Returns the element so the caller can set its content.
 */
function upsertMeta(attr, value, content) {
  if (content == null) return;
  let el = document.head.querySelector(`meta[${attr}="${value}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, value);
    el.setAttribute('data-managed', 'gf-seo');
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    el.setAttribute('data-managed', 'gf-seo');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function upsertJsonLd(id, data) {
  let el = document.head.querySelector(`script[data-jsonld="${id}"]`);
  if (!data) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.setAttribute('type', 'application/ld+json');
    el.setAttribute('data-jsonld', id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export default function SEO({
  title,
  description,
  image,
  url,            // canonical URL — defaults to current location
  type = 'website', // 'website' | 'article'
  noindex = false,
  jsonLd,
  jsonLdId = 'page',
  // Article-only:
  publishedTime,
  modifiedTime,
  author,
  section,
  tags,
}) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} — ${SITE.name}`
      : SITE.defaultTitle;
    const desc = description || SITE.defaultDescription;
    const ogImage = image
      ? (image.startsWith('http') ? image : `${SITE.url}${image}`)
      : `${SITE.url}${SITE.defaultImage}`;
    const canonical = url || (typeof window !== 'undefined' ? window.location.href : SITE.url);

    document.title = fullTitle;

    upsertMeta('name', 'description', desc);
    upsertMeta('name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow');
    upsertLink('canonical', canonical);

    // Open Graph
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', desc);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', ogImage);
    upsertMeta('property', 'og:site_name', SITE.name);
    upsertMeta('property', 'og:locale', SITE.locale);

    // Article-specific OG tags
    if (type === 'article') {
      upsertMeta('property', 'article:published_time', publishedTime);
      upsertMeta('property', 'article:modified_time', modifiedTime);
      if (author) upsertMeta('property', 'article:author', author);
      if (section) upsertMeta('property', 'article:section', section);
      // Existing tag meta nodes — clear then re-insert. Single-page setup.
      document.head
        .querySelectorAll('meta[property="article:tag"]')
        .forEach((n) => n.remove());
      if (Array.isArray(tags)) {
        tags.forEach((t) => {
          const m = document.createElement('meta');
          m.setAttribute('property', 'article:tag');
          m.setAttribute('content', t);
          m.setAttribute('data-managed', 'gf-seo');
          document.head.appendChild(m);
        });
      }
    }

    // Twitter
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', desc);
    upsertMeta('name', 'twitter:image', ogImage);
    if (SITE.twitterHandle) {
      upsertMeta('name', 'twitter:site', SITE.twitterHandle);
    }

    // JSON-LD structured data
    upsertJsonLd(jsonLdId, jsonLd || null);
  }, [
    title, description, image, url, type, noindex,
    jsonLd, jsonLdId,
    publishedTime, modifiedTime, author, section, tags,
  ]);

  return null;
}

/* Export the site config so consumers can build canonical URLs etc. */
export const siteConfig = SITE;