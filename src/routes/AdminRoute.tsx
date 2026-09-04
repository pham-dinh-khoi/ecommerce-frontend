/**
 * src/routes/AdminRoutes.tsx
 * 
 * A Route Guard component that wraps administrative routes.
 * It enforces two levels of protection:
 * 1. Authentication: User must be logged in.
 * 2. Authorization: User must have the 'admin' role.
 */

import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { ROUTES } from "@/constants/routes";
import RouteLoadingFallback from "@/components/common/RouteLoadingFallback";

function AdminRoute() {
  const { isAuthenticated, user, bootstrapStatus } = useAppSelector(
    (state) => state.auth
  );

  /**
   * Session bootstrap (silent refresh + profile fetch) hasn't resolved yet.
   * Don't redirect a potentially-authenticated admin away before we know
   * their real session/role state.
   */
  if (bootstrapStatus !== "done") {
    return <RouteLoadingFallback />;
  }

  /**
   * Level 1: Authentication Check
   * If the user is not authenticated, redirect them to the Login page.
   * 'replace' prevents the user from going back to this protected page
   * using the browser's back button.
   */
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  /**
   * Level 2: Authorization Check (Role-Based Access Control)
   * If the user is authenticated but does not have the 'admin' role,
   * redirect them to the homepage. 
   */
  if (user?.role !== "admin") {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  /**
   * If all checks pass, render the child routes defined within 
   * this protected route structure.
   */
  return <Outlet />;
}

export default AdminRoute;