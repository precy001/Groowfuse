/**
 * Route guard for admin pages. Redirects to /admin/login if not authenticated,
 * preserving the attempted URL so we can return there after login.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../lib/auth';

export default function RequireAuth({ children }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    // Pass the original URL via state so login can redirect back after success.
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
