import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import PageLoader from './components/PageLoader';
import usePageViewTracker from './lib/use-page-view-tracker';

// Public pages — eagerly loaded since they're the main user-facing experience
import Home     from './pages/Home';
import Services from './pages/Services';
import About    from './pages/About';
import Contact  from './pages/Contact';
import Blog     from './pages/Blog';
import BlogPost from './pages/BlogPost';
import NotFound from './pages/NotFound';

// Admin — code-split out of the main bundle so visitors don't pay
// the cost of loading TipTap/ProseMirror/Recharts unless they actually visit /admin.
const AdminShell  = lazy(() => import('./admin/AdminShell'));
const AdminLogin  = lazy(() => import('./admin/pages/AdminLogin'));
const Dashboard   = lazy(() => import('./admin/pages/Dashboard'));
const Posts       = lazy(() => import('./admin/pages/Posts'));
const PostEditor  = lazy(() => import('./admin/pages/PostEditor'));
const Messages    = lazy(() => import('./admin/pages/Messages'));
const Newsletter  = lazy(() => import('./admin/pages/Newsletter'));
const Settings    = lazy(() => import('./admin/pages/Settings'));
const Analytics   = lazy(() => import('./admin/pages/Analytics'));
const RequireAuth = lazy(() => import('./admin/components/RequireAuth'));

function AdminFallback() {
  return (
    <div style={{
      minHeight: '100svh',
      background: '#0A0A0B',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#1FE07A',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      fontSize: 11,
      letterSpacing: '0.4em',
    }}>
      LOADING ADMIN
    </div>
  );
}

/**
 * Hosts the page-view tracker. Has to live inside <BrowserRouter> so the
 * useLocation() hook works. Renders nothing visible.
 */
function TrackerHost() {
  usePageViewTracker();
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <TrackerHost />
      <PageLoader />
      <ScrollToTop />
      <Routes>
        {/* Public site */}
        <Route path="/"            element={<Home />} />
        <Route path="/services"    element={<Services />} />
        <Route path="/about"       element={<About />} />
        <Route path="/contact"     element={<Contact />} />
        <Route path="/blog"        element={<Blog />} />
        <Route path="/blog/:slug"  element={<BlogPost />} />

        {/* Admin login — outside the auth-required shell */}
        <Route
          path="/admin/login"
          element={
            <Suspense fallback={<AdminFallback />}>
              <AdminLogin />
            </Suspense>
          }
        />

        {/* Authenticated admin section */}
        <Route
          path="/admin"
          element={
            <Suspense fallback={<AdminFallback />}>
              <RequireAuth>
                <AdminShell />
              </RequireAuth>
            </Suspense>
          }
        >
          <Route index                     element={<Suspense fallback={<AdminFallback />}><Dashboard /></Suspense>} />
          <Route path="posts"              element={<Suspense fallback={<AdminFallback />}><Posts /></Suspense>} />
          <Route path="posts/new"          element={<Suspense fallback={<AdminFallback />}><PostEditor /></Suspense>} />
          <Route path="posts/:id/edit"     element={<Suspense fallback={<AdminFallback />}><PostEditor /></Suspense>} />
          <Route path="messages"           element={<Suspense fallback={<AdminFallback />}><Messages /></Suspense>} />
          <Route path="messages/:id"       element={<Suspense fallback={<AdminFallback />}><Messages /></Suspense>} />
          <Route path="newsletter"         element={<Suspense fallback={<AdminFallback />}><Newsletter /></Suspense>} />
          <Route path="analytics"          element={<Suspense fallback={<AdminFallback />}><Analytics /></Suspense>} />
          <Route path="settings"           element={<Suspense fallback={<AdminFallback />}><Settings /></Suspense>} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
