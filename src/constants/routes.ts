/**
 * @file constants/routes.ts
 * @description Centralized routing configuration for the entire application.
 * Using this constant file ensures a "Single Source of Truth" for URL patterns,
 * preventing hard-coded strings and simplifying global URL refactoring.
 */

export const ROUTES = {
  // ==========================================================================
  // PUBLIC ROUTES (Customer-facing pages)
  // ==========================================================================
  HOME: '/',
  
  // Auth & Profile
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  /** Requires dynamic token param */
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL_NOTICE: '/verify-email-notice',
  VERIFY_EMAIL: '/verify-email',
  PROFILE: '/profile',

  // Shopping & User Features
  /** Requires dynamic slug param */
  CATEGORY_DETAIL: '/category/:slug',
  /** Requires dynamic slug param */
  PRODUCT_DETAIL: '/product/:slug',
  CART: '/cart',
  WISHLIST: '/wishlist',
  CHECKOUT: '/checkout',
  /** Requires dynamic order code param */
  ORDER_DETAIL: '/orders/:orderCode',
  MY_ORDERS: '/orders',
  SEARCH: '/search',
  PAYMENT_RESULT: '/payment/result',

  // ==========================================================================
  // ADMIN ROUTES (Management dashboards)
  // ==========================================================================
  
  // Categories
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_CATEGORY_CREATE: '/admin/categories/new',
  /** Requires dynamic ID param */
  ADMIN_CATEGORY_EDIT: '/admin/categories/:id/edit',

  // Products (Wizard flow)
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_PRODUCT_CREATE_STEP1: '/admin/products/new',
  /** Requires dynamic ID param */
  ADMIN_PRODUCT_CREATE_STEP2: '/admin/products/new/:id/variants',
  /** Requires dynamic ID param */
  ADMIN_PRODUCT_CREATE_STEP3: '/admin/products/new/:id/complete',
  /** Requires dynamic ID param */
  ADMIN_PRODUCT_EDIT: '/admin/products/:id/edit',

  // Users & Coupons
  ADMIN_USERS: '/admin/users',
  ADMIN_COUPONS: '/admin/coupons',
  ADMIN_COUPON_CREATE: '/admin/coupons/new',
  /** Requires dynamic ID param */
  ADMIN_COUPON_EDIT: '/admin/coupons/:id/edit',

  // Orders
  ADMIN_ORDERS: '/admin/orders',
  /** Requires dynamic ID param */
  ADMIN_ORDER_DETAIL: '/admin/orders/:id',
  
  // Reviews
  ADMIN_REVIEWS: '/admin/reviews',
} as const;

// ============================================================================
// DYNAMIC URL BUILDERS
// Helper functions to inject parameters into route templates safely.
// ============================================================================

/** 
 * Constructs the category view URL using the provided slug 
 */
export const buildCategoryUrl = (slug: string) => `/category/${slug}`;

/** 
 * Constructs the edit URL for an admin category 
 */
export const buildAdminCategoryEditUrl = (id: string) => `/admin/categories/${id}/edit`;

/** 
 * Constructs step 2 URL for the product creation wizard 
 */
export const buildWizardStep2Url = (id: string) => `/admin/products/new/${id}/variants`;

/** 
 * Constructs step 3 URL for the product creation wizard 
 */
export const buildWizardStep3Url = (id: string) => `/admin/products/new/${id}/complete`;

/** 
 * Constructs the edit URL for an admin product 
 */
export const buildAdminProductEditUrl = (id: string) => `/admin/products/${id}/edit`;

/** 
 * Constructs the edit URL for an admin coupon 
 */
export const buildAdminCouponEditUrl = (id: string) => `/admin/coupons/${id}/edit`;

/** 
 * Constructs the public view URL for a product 
 */
export const buildProductUrl = (slug: string) => `/product/${slug}`;

/** 
 * Constructs the detail view URL for a user's order 
 */
export const buildOrderDetailUrl = (orderCode: string) => `/orders/${orderCode}`;

/** 
 * Constructs the detail view URL for an admin order management 
 */
export const buildAdminOrderDetailUrl = (id: string) => `/admin/orders/${id}`;

/** 
 * Generates a search URL with query parameters 
 * @param keyword - The search term
 * @param categoryId - Optional category filter ID
 */
export const buildSearchUrl = (keyword: string, categoryId?: string) => {
  const params = new URLSearchParams();
  if (keyword) params.set('q', keyword);
  if (categoryId) params.set('category', categoryId);
  return `/search?${params.toString()}`;
};