/**
 * src/routes/PrivateRoute.tsx
 *
 * A Route Guard component that protects private pages from unauthenticated access.
 * It sits in the component tree and checks the Redux state before rendering
 * nested routes.
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { ROUTES } from '@/constants/routes';

function PrivateRoute() {
  // Extract authentication status from the Redux store
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  /**
   * GUARD LOGIC:
   * If the user is not authenticated, redirect them to the Login page.
   *
   * 'replace': This is a UX best practice. By using 'replace', we replace the
   * current entry in the history stack instead of adding to it. This prevents
   * the user from clicking the "Back" button to return to the page they weren't
   * supposed to see.
   */
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  /**
   * If authenticated, render the child routes.
   * <Outlet /> is the placeholder where the actual sub-route components
   * (e.g., Profile, Checkout) will be rendered.
   */
  return <Outlet />;
}

export default PrivateRoute;
