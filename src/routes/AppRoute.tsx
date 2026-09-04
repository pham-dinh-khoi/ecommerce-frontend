/**
 * src/routes/AppRoutes.tsx
 *
 * Central Router configuration.
 * Defines the application's navigation hierarchy using a tiered approach:
 * 1. Public Routes: Accessible by all users (Home, Auth, Products).
 * 2. Private Routes: Require authentication (User Profile, Checkout).
 * 3. Admin Routes: Require authorization/role validation (Admin Dashboards).
 * 4. Fallback: Catch-all for undefined routes (404).
 */

import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

// --- Route Guards (Higher-Order Components) ---
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';
import RouteLoadingFallback from '@/components/common/RouteLoadingFallback';

// --- Public Pages ---
// HomePage stays eager: it's the landing page and must render with the
// initial bundle instead of waiting on a lazy chunk.
import HomePage from '@/pages/HomePage';

// --- Auth pages (lazy) ---
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const VerifyEmailNoticePage = lazy(
  () => import('@/pages/VerifyEmailNoticePage')
);
const VerifyEmailPage = lazy(() => import('@/pages/VerifyEmailPage'));

// --- Product / category / search pages (lazy) ---
const CategoryPage = lazy(() => import('@/pages/CategoryPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const PaymentResultPage = lazy(() => import('@/pages/PaymentResultPage'));

// --- Cart & account pages (lazy) ---
const CartPage = lazy(() => import('@/pages/CartPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const WishlistPage = lazy(() => import('@/pages/WishlistPage'));

// --- Checkout / order pages (lazy) ---
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const MyOrdersPage = lazy(() => import('@/pages/MyOrdersPage'));
const OrderDetailPage = lazy(() => import('@/pages/OrderDetailPage'));

// --- Admin Pages (lazy) ---
const AdminCategoryListPage = lazy(
  () => import('@/pages/admin/AdminCategoryListPage')
);
const AdminCategoryCreatePage = lazy(
  () => import('@/pages/admin/AdminCategoryCreatePage')
);
const AdminCategoryEditPage = lazy(
  () => import('@/pages/admin/AdminCategoryEditPage')
);
const AdminProductCreateStep1Page = lazy(
  () => import('@/pages/admin/AdminProductCreateStep1Page')
);
const AdminProductCreateStep2Page = lazy(
  () => import('@/pages/admin/AdminProductCreateStep2Page')
);
const AdminProductCreateStep3Page = lazy(
  () => import('@/pages/admin/AdminProductCreateStep3Page')
);
const AdminProductListPage = lazy(
  () => import('@/pages/admin/AdminProductListPage')
);
const AdminProductEditPage = lazy(
  () => import('@/pages/admin/AdminProductEditPage')
);
const AdminUserListPage = lazy(
  () => import('@/pages/admin/AdminUserListPage')
);
const AdminCouponListPage = lazy(
  () => import('@/pages/admin/AdminCouponListPage')
);
const AdminCouponCreatePage = lazy(
  () => import('@/pages/admin/AdminCouponCreatePage')
);
const AdminCouponEditPage = lazy(
  () => import('@/pages/admin/AdminCouponEditPage')
);
const AdminOrderListPage = lazy(
  () => import('@/pages/admin/AdminOrderListPage')
);
const AdminOrderDetailPage = lazy(
  () => import('@/pages/admin/AdminOrderDetailPage')
);
const AdminReviewListPage = lazy(
  () => import('@/pages/admin/AdminReviewListPage')
);

/**
 * Fallback component for unmatched routes.
 * Acts as a 404 page handler.
 */
const NotFoundPage = () => <div className="p-8">404 - Page Not Found</div>;

function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {/*
        1. PUBLIC ROUTES
        Accessible without specific session requirements.
      */}
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route
          path={ROUTES.FORGOT_PASSWORD}
          element={<ForgotPasswordPage />}
        />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
        <Route path={ROUTES.SEARCH} element={<SearchPage />} />
        <Route
          path={ROUTES.VERIFY_EMAIL_NOTICE}
          element={<VerifyEmailNoticePage />}
        />
        <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />

        {/* Product & Category browsing */}
        <Route path={ROUTES.PRODUCT_DETAIL} element={<ProductDetailPage />} />
        <Route path={ROUTES.CATEGORY_DETAIL} element={<CategoryPage />} />

        {/* Cart & Checkout result pages */}
        <Route path={ROUTES.CART} element={<CartPage />} />
        <Route path={ROUTES.PAYMENT_RESULT} element={<PaymentResultPage />} />

        {/*
        2. PRIVATE ROUTES
        Protected by 'PrivateRoute'. Requires user to be authenticated.
      */}
        <Route element={<PrivateRoute />}>
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.WISHLIST} element={<WishlistPage />} />
          <Route path={ROUTES.CHECKOUT} element={<CheckoutPage />} />
          <Route path={ROUTES.MY_ORDERS} element={<MyOrdersPage />} />
          <Route path={ROUTES.ORDER_DETAIL} element={<OrderDetailPage />} />
        </Route>

        {/*
        3. ADMIN ROUTES
        Protected by 'AdminRoute'. Requires user to be authenticated AND hold an 'admin' role.
      */}
        <Route element={<AdminRoute />}>
          {/* Category Management */}
          <Route
            path={ROUTES.ADMIN_CATEGORIES}
            element={<AdminCategoryListPage />}
          />
          <Route
            path={ROUTES.ADMIN_CATEGORY_CREATE}
            element={<AdminCategoryCreatePage />}
          />
          <Route
            path={ROUTES.ADMIN_CATEGORY_EDIT}
            element={<AdminCategoryEditPage />}
          />

          {/* Product Management */}
          <Route
            path={ROUTES.ADMIN_PRODUCT_CREATE_STEP1}
            element={<AdminProductCreateStep1Page />}
          />
          <Route
            path={ROUTES.ADMIN_PRODUCT_CREATE_STEP2}
            element={<AdminProductCreateStep2Page />}
          />
          <Route
            path={ROUTES.ADMIN_PRODUCT_CREATE_STEP3}
            element={<AdminProductCreateStep3Page />}
          />
          <Route
            path={ROUTES.ADMIN_PRODUCTS}
            element={<AdminProductListPage />}
          />
          <Route
            path={ROUTES.ADMIN_PRODUCT_EDIT}
            element={<AdminProductEditPage />}
          />

          {/* User Management */}
          <Route path={ROUTES.ADMIN_USERS} element={<AdminUserListPage />} />

          {/* Coupon Management */}
          <Route
            path={ROUTES.ADMIN_COUPONS}
            element={<AdminCouponListPage />}
          />
          <Route
            path={ROUTES.ADMIN_COUPON_CREATE}
            element={<AdminCouponCreatePage />}
          />
          <Route
            path={ROUTES.ADMIN_COUPON_EDIT}
            element={<AdminCouponEditPage />}
          />

          {/* Order Management */}
          <Route path={ROUTES.ADMIN_ORDERS} element={<AdminOrderListPage />} />
          <Route
            path={ROUTES.ADMIN_ORDER_DETAIL}
            element={<AdminOrderDetailPage />}
          />

          {/* Review Management */}
          <Route
            path={ROUTES.ADMIN_REVIEWS}
            element={<AdminReviewListPage />}
          />
        </Route>

        {/*
        4. FALLBACK ROUTE
        Catch-all for any undefined paths.
      */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
