/**
 * @file apiEndpoints.ts
 * @description Centralized repository for all API URL definitions.
 * Prevents hardcoding of URLs throughout the application and simplifies maintenance.
 */

// ============================================================================
// 1. Authentication & User Identity
// ============================================================================
export const AUTH_ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  LOGOUT_ALL: '/auth/logout-all',
  REFRESH_TOKEN: '/auth/refresh-token',
  ME: '/auth/me',
  /** @param token - The verification token received via email */
  VERIFY_EMAIL: (token: string) => `/auth/verify-email/${token}`,
  CHANGE_PASSWORD: '/auth/change-password',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
};

// ============================================================================
// 2. Categories Management
// ============================================================================
export const CATEGORY_ENDPOINTS = {
  TREE: '/categories/tree',
  ALL: '/categories',
  /** @param id - Unique identifier for the category */
  DETAIL: (id: string) => `/categories/${id}`,
  CREATE: '/categories',
  /** @param id - Unique identifier for the category to update */
  UPDATE: (id: string) => `/categories/${id}`,
  /** @param id - Unique identifier for the category to delete */
  DELETE: (id: string) => `/categories/${id}`,
};

// ============================================================================
// 3. Products, Variants, & Media
// ============================================================================
export const PRODUCT_ENDPOINTS = {
  LIST: '/products',
  /** @param idOrSlug - The database ID or URL slug of the product */
  DETAIL: (idOrSlug: string) => `/products/${idOrSlug}`,
  CREATE: '/products',
  UPDATE: (id: string) => `/products/${id}`,
  DELETE: (id: string) => `/products/${id}`,
  PERMANENT_DELETE: (id: string) => `/products/${id}/permanent`,

  // --- Product Variants ---
  ADD_VARIANT: (productId: string) => `/products/${productId}/variants`,
  UPDATE_VARIANT: (productId: string, variantId: string) =>
    `/products/${productId}/variants/${variantId}`,
  DELETE_VARIANT: (productId: string, variantId: string) =>
    `/products/${productId}/variants/${variantId}`,

  // --- Product Images ---
  ADD_IMAGES: (productId: string) => `/products/${productId}/image`,
  DELETE_IMAGE: (productId: string, publicId: string) =>
    `/products/${productId}/images/${encodeURIComponent(publicId)}`,
  SET_PRIMARY_IMAGE: (productId: string, publicId: string) =>
    `/products/${productId}/images/${encodeURIComponent(publicId)}/primary`,
  REORDER_IMAGES: (productId: string) =>
    `/products/${productId}/images/reorder`,
};

// ============================================================================
// 4. User Profile & Address Management
// ============================================================================
export const USER_ENDPOINTS = {
  PROFILE: '/users/me',
  UPDATE_PROFILE: '/users/me',
  UPDATE_AVATAR: '/users/me/avatar',
  DELETE_AVATAR: '/users/me/avatar',

  // --- Address Book ---
  ADDRESSES: '/users/me/addresses',
  ADD_ADDRESS: '/users/me/addresses',
  UPDATE_ADDRESS: (addressId: string) => `/users/me/addresses/${addressId}`,
  DELETE_ADDRESS: (addressId: string) => `/users/me/addresses/${addressId}`,
  SET_DEFAULT_ADDRESS: (addressId: string) =>
    `/users/me/addresses/${addressId}/default`,

  // --- Admin User Management ---
  ADMIN_LIST: '/users/admin',
  ADMIN_DETAIL: (id: string) => `/users/admin/${id}`,
  ADMIN_UPDATE: (id: string) => `/users/admin/${id}`,
  ADMIN_DELETE: (id: string) => `/users/admin/${id}`,
};

// ============================================================================
// 5. Cart
// ============================================================================
export const CART_ENDPOINTS = {
  GET: '/cart',
  ADD_ITEM: '/cart/items',
  UPDATE_ITEM: (variantId: string) => `/cart/items/${variantId}`,
  REMOVE_ITEM: (variantId: string) => `/cart/items/${variantId}`,
  CLEAR: '/cart',
};

// ============================================================================
// 6. Wishlist
// ============================================================================
export const WISHLIST_ENDPOINTS = {
  LIST: '/wishlist',
  TOGGLE: (productId: string) => `/wishlist/${productId}`,
  CHECK: (productId: string) => `/wishlist/${productId}/check`,
  CLEAR: '/wishlist',
};

// ============================================================================
// 7. Coupons / Discounts
// ============================================================================
export const COUPON_ENDPOINTS = {
  PREVIEW: '/coupons/preview',
  ADMIN_LIST: '/coupons',
  ADMIN_DETAIL: (id: string) => `/coupons/${id}`,
  ADMIN_CREATE: '/coupons',
  ADMIN_UPDATE: (id: string) => `/coupons/${id}`,
  ADMIN_DELETE: (id: string) => `/coupons/${id}`,
};

// ============================================================================
// 8. Orders Management
// ============================================================================
export const ORDER_ENDPOINTS = {
  PLACE: '/orders',
  MY_ORDERS: '/orders/my',
  DETAIL: (orderId: string) => `/orders/my/${orderId}`,
  CANCEL: (orderId: string) => `/orders/my/${orderId}/cancel`,

  // --- Admin Order Management ---
  ADMIN_LIST: '/orders/admin',
  ADMIN_DETAIL: (orderId: string) => `/orders/admin/${orderId}`,
  ADMIN_UPDATE_STATUS: (orderId: string) => `/orders/admin/${orderId}/status`,
  ADMIN_STATS: '/orders/admin/stats',
};

// ============================================================================
// 9. Search
// ============================================================================
export const SEARCH_ENDPOINTS = {
  SEARCH: '/search',
  AUTOCOMPLETE: '/search/autocomplete',
  TRENDING: '/search/trending',
  SIMILAR: (productId: string) => `/search/similar/${productId}`,
};

// ============================================================================
// 10. Reviews & Ratings
// ============================================================================
export const REVIEW_ENDPOINTS = {
  CREATE: '/reviews',
  PRODUCT_REVIEWS: (productId: string) =>
    `/reviews/products/${productId}/reviews`,
  MY_REVIEWS: '/reviews/my',
  UPDATE: (reviewId: string) => `/reviews/${reviewId}`,
  DELETE: (reviewId: string) => `/reviews/${reviewId}`,
  VOTE_HELPFUL: (reviewId: string) => `/reviews/${reviewId}/helpful`,
  REPLY: (reviewId: string) => `/reviews/${reviewId}/reply`,

  // --- Admin Moderation ---
  ADMIN_LIST: '/reviews/admin',
  ADMIN_MODERATE: (reviewId: string) => `/reviews/${reviewId}/moderate`,
  ADMIN_BULK_MODERATE: '/reviews/admin/bulk-moderate',
  ADMIN_DELETE: (reviewId: string) => `/reviews/admin/${reviewId}`,
};

// ============================================================================
// 11. Payments
// ============================================================================
export const PAYMENT_ENDPOINTS = {
  INITIATE: '/payments/initiate',
  STATUS: (orderId: string) => `/payments/status/${orderId}`,
};
