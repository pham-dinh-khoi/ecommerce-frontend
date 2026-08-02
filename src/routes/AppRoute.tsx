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

import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

// --- Route Guards (Higher-Order Components) ---
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';

// --- Public Pages ---
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import VerifyEmailNoticePage from '@/pages/VerifyEmailNoticePage';
import VerifyEmailPage from '@/pages/VerifyEmailPage';
import CategoryPage from '@/pages/CategoryPage';
import SearchPage from '@/pages/SearchPage';
import PaymentResultPage from '@/pages/PaymentResultPage';

// --- Feature-Specific / Private Pages ---
import ProductDetailPage from '@/pages/ProductDetailPage';
import ProfilePage from '@/pages/ProfilePage';
import CartPage from '@/pages/CartPage';
import WishlistPage from '@/pages/WishlistPage';
import CheckoutPage from '@/pages/CheckoutPage';
import MyOrdersPage from '@/pages/MyOrdersPage';
import OrderDetailPage from '@/pages/OrderDetailPage';

// --- Admin Pages ---
import AdminCategoryListPage from '@/pages/admin/AdminCategoryListPage';
import AdminCategoryCreatePage from '@/pages/admin/AdminCategoryCreatePage';
import AdminCategoryEditPage from '@/pages/admin/AdminCategoryEditPage';
import AdminProductCreateStep1Page from '@/pages/admin/AdminProductCreateStep1Page';
import AdminProductCreateStep2Page from '@/pages/admin/AdminProductCreateStep2Page';
import AdminProductCreateStep3Page from '@/pages/admin/AdminProductCreateStep3Page';
import AdminProductListPage from '@/pages/admin/AdminProductListPage';
import AdminProductEditPage from '@/pages/admin/AdminProductEditPage';
import AdminUserListPage from '@/pages/admin/AdminUserListPage';
import AdminCouponListPage from '@/pages/admin/AdminCouponListPage';
import AdminCouponCreatePage from '@/pages/admin/AdminCouponCreatePage';
import AdminCouponEditPage from '@/pages/admin/AdminCouponEditPage';
import AdminOrderListPage from '@/pages/admin/AdminOrderListPage';
import AdminOrderDetailPage from '@/pages/admin/AdminOrderDetailPage';
import AdminReviewListPage from '@/pages/admin/AdminReviewListPage';

/**
 * Fallback component for unmatched routes.
 * Acts as a 404 page handler.
 */
const NotFoundPage = () => <div className="p-8">404 - Page Not Found</div>;

function AppRoutes() {
  return (
    <Routes>
      {/* 
        1. PUBLIC ROUTES 
        Accessible without specific session requirements.
      */}
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
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
        <Route path={ROUTES.ADMIN_COUPONS} element={<AdminCouponListPage />} />
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
        <Route path={ROUTES.ADMIN_REVIEWS} element={<AdminReviewListPage />} />
      </Route>

      {/* 
        4. FALLBACK ROUTE 
        Catch-all for any undefined paths. 
      */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
