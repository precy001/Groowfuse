/**
 * Admin onboarding tour. A multi-step modal that walks first-time admins
 * through the major sections of the panel.
 *
 * Auto-opens once per user (tracked in localStorage). Can be re-triggered
 * from the dashboard's "Take the tour" button.
 *
 * Steps are defined as plain data so they're easy to edit.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import { getUser } from '../lib/auth';
import {
  useTourState,
  shouldAutoOpen,
  markCompleted,
  closeTour,
  openTour,
} from '../lib/tour';

const STEPS = [
  {
    icon: 'wave',
    eyebrow: 'Welcome',
    title: 'You\'re inside the GroowFuse admin.',
    body: (
      <>
        <p>
          This is where you publish posts, read incoming enquiries, and
          manage your newsletter. The tour takes about 60 seconds and you
          can skip it anytime.
        </p>
        <p>
          You can replay this tour from the dashboard whenever you'd like.
        </p>
      </>
    ),
  },
  {
    icon: 'dashboard',
    eyebrow: 'Step 1 of 5',
    title: 'The dashboard is your starting line.',
    body: (
      <>
        <p>
          Stat cards across the top tell you what's new at a glance:
          unread messages, pending subscribers, draft posts.
        </p>
        <p>
          Below them, two feeds — recent contact-form enquiries on the
          left, and an audit log of admin actions on the right (you'll
          see your own activity show up there).
        </p>
      </>
    ),
  },
  {
    icon: 'posts',
    eyebrow: 'Step 2 of 5',
    title: 'Write and publish posts.',
    body: (
      <>
        <p>
          The <strong>Blog Posts</strong> section in the sidebar lets you
          create, edit, and delete articles. The editor has a rich text
          area for the body and a sidebar for category, tags, cover
          image, and publish settings.
        </p>
        <p>
          Cover images and inline images can be uploaded from your
          device or pasted from a URL.
        </p>
      </>
    ),
    cta: { label: 'Open Blog Posts', to: '/admin/posts' },
  },
  {
    icon: 'mail',
    eyebrow: 'Step 3 of 5',
    title: 'Read and reply to enquiries.',
    body: (
      <>
        <p>
          When someone submits the contact form on the public site,
          their message lands in <strong>Messages</strong>. Click any
          message to read the full enquiry — company, sector, service
          type, and the full text.
        </p>
        <p>
          Use <strong>Reply via email</strong> to open your mail client
          with the message pre-quoted.
        </p>
      </>
    ),
    cta: { label: 'Open Messages', to: '/admin/messages' },
  },
  {
    icon: 'subscribe',
    eyebrow: 'Step 4 of 5',
    title: 'Manage subscribers and send newsletters.',
    body: (
      <>
        <p>
          The <strong>Newsletter</strong> section has two tabs.{' '}
          <em>Subscribers</em> shows your full list with status and
          source — you can search, filter, and export to CSV.
        </p>
        <p>
          <em>Compose</em> opens a form for writing and sending a
          newsletter to any audience subset.
        </p>
      </>
    ),
    cta: { label: 'Open Newsletter', to: '/admin/newsletter' },
  },
  {
    icon: 'shield',
    eyebrow: 'Step 5 of 5',
    title: 'Everything you do is tracked.',
    body: (
      <>
        <p>
          Every action you take — publishing a post, archiving a
          message, removing a subscriber — is recorded with your email
          and timestamp.
        </p>
        <p>
          That activity log shows on the dashboard and on each item's
          detail view, so you can always see who did what and when.
        </p>
      </>
    ),
  },
  {
    icon: 'check',
    eyebrow: 'Ready',
    title: "That's it — you're set.",
    body: (
      <>
        <p>
          You can sign out anytime from the bottom of the sidebar. If
          you need to walk through this again, click{' '}
          <strong>Take the tour</strong> on the dashboard.
        </p>
      </>
    ),
    final: true,
  },
];

export default function AdminTour() {
  const [open, , close] = useTourState();
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  // Auto-open for first-time users — runs once on mount
  useEffect(() => {
    const user = getUser();
    if (user && shouldAutoOpen(user.email)) {
      // Small delay so the dashboard has time to render first
      const t = setTimeout(() => openTour(), 400);
      return () => clearTimeout(t);
    }
  }, []);

  // Reset to step 0 every time the tour opens
  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  const finish = () => {
    const user = getUser();
    if (user) markCompleted(user.email);
    close();
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else finish();
  };

  const back = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const skip = () => {
    finish();
  };

  const goCta = (to) => {
    finish();
    navigate(to);
  };

  if (!open) return null;
  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <Modal open={open} onClose={skip} hideClose size="md">
      <div className="adm-tour">
        {/* Progress bar — visual sense of how much is left */}
        <div className="adm-tour-progress" aria-hidden>
          <div className="adm-tour-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="adm-tour-icon" aria-hidden>
          <TourIcon name={current.icon} />
        </div>

        <span className="adm-eyebrow adm-tour-eyebrow">{current.eyebrow}</span>
        <h2 className="adm-tour-title">{current.title}</h2>
        <div className="adm-tour-body">{current.body}</div>

        {current.cta && (
          <button
            type="button"
            onClick={() => goCta(current.cta.to)}
            className="adm-tour-cta"
          >
            {current.cta.label} →
          </button>
        )}

        <div className="adm-tour-footer">
          <button
            type="button"
            onClick={skip}
            className="adm-tour-skip"
          >
            {current.final ? 'Close' : 'Skip tour'}
          </button>

          <div className="adm-tour-nav">
            {step > 0 && !current.final && (
              <button
                type="button"
                onClick={back}
                className="adm-btn adm-btn-ghost"
              >
                ← Back
              </button>
            )}
            <button
              type="button"
              onClick={next}
              className="adm-btn adm-btn-primary"
            >
              {current.final ? 'Get started →' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Icons ─── */
function TourIcon({ name }) {
  const c = {
    width: 32, height: 32, viewBox: '0 0 32 32', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.5,
    strokeLinecap: 'round', strokeLinejoin: 'round',
    'aria-hidden': true,
  };
  switch (name) {
    case 'wave':
      return <svg {...c}><path d="M16 4 a4 4 0 0 1 4 4 v8 M20 8 a4 4 0 0 1 4 4 v6 M24 12 a4 4 0 0 1 4 4 v8 a8 8 0 0 1 -8 8 h-4 a8 8 0 0 1 -8 -8 V14 a4 4 0 0 1 8 0 v6"/></svg>;
    case 'dashboard':
      return <svg {...c}><rect x="4" y="4" width="10" height="12" rx="1.5"/><rect x="18" y="4" width="10" height="6" rx="1.5"/><rect x="18" y="14" width="10" height="14" rx="1.5"/><rect x="4" y="20" width="10" height="8" rx="1.5"/></svg>;
    case 'posts':
      return <svg {...c}><rect x="5" y="4" width="22" height="24" rx="2"/><path d="M10 10h12 M10 15h12 M10 20h8"/></svg>;
    case 'mail':
      return <svg {...c}><rect x="4" y="7" width="24" height="18" rx="2"/><path d="M5 9 L16 18 L27 9"/></svg>;
    case 'subscribe':
      return <svg {...c}><path d="M4 14 V6 a2 2 0 0 1 2 -2 h20 a2 2 0 0 1 2 2 v20 a2 2 0 0 1 -2 2 H16"/><path d="M4 22 l8-6 8 6"/><circle cx="8" cy="26" r="3"/></svg>;
    case 'shield':
      return <svg {...c}><path d="M16 4 L26 8 V16 c0 6 -4 10 -10 12 c-6 -2 -10 -6 -10 -12 V8 Z"/><path d="M12 16 L15 19 L20 13"/></svg>;
    case 'check':
      return <svg {...c}><circle cx="16" cy="16" r="12"/><path d="M11 16 L15 20 L21 13"/></svg>;
    default:
      return null;
  }
}
