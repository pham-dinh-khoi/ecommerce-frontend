/**
 * @file coupon.types.ts
 * @description Domain models, API request payloads, and response structures 
 * for the Coupon and Discount system.
 */

// ==========================================
// 1. Core Domain Types
// ==========================================

/**
 * Defines the supported discount strategies.
 * Note: 'buy_x_get_y' is reserved for future expansion.
 */
export type DiscountType = "percentage" | "fixed" | "free_shipping" | "buy_x_get_y";

/**
 * Represents a complete Coupon entity as retrieved from the database.
 */
export interface Coupon {
  _id: string;
  code: string;
  description: string;

  /** Discount details including strategy and monetary/percentage value. */
  discount: {
    type: DiscountType;
    amount: number;
    /** Optional cap on discount (e.g., max 50k off for a 20% discount). */
    maxDiscount?: number;
  };

  /** Requirements that must be met to apply the coupon. */
  conditions: {
    minOrderAmount?: number;
  };

  /** Usage tracking metrics. */
  limits: {
    maxUsageTotal?: number;
    maxUsagePerUser?: number;
    usedCount: number; // Server-calculated
  };

  startDate: string;
  endDate: string;
  isActive: boolean;
  
  /** Computed flags often injected by the backend based on current date/usage. */
  isExpired?: boolean;
  isExhausted?: boolean;
  
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 2. API Response Models
// ==========================================

/**
 * The structure returned when a user successfully applies a coupon to their cart.
 */
export interface CouponApplyResult {
  couponId: string;
  code: string;
  discountType: string;
  discountAmount: number;
  description: string;
}

/**
 * An extended response used for "Preview" features, showing the impact 
 * of the coupon on the overall order summary.
 */
export interface CouponPreviewResponse extends CouponApplyResult {
  orderSummary: {
    subtotal: number;
    shippingFee: number;
    items: Array<{ productId: string; quantity: number; price: number }>;
  };
}

/**
 * Standard list response for coupon management, including pagination metadata.
 */
export interface CouponListResponse {
  success: boolean;
  message: string;
  coupons: Coupon[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ==========================================
// 3. Request Payloads
// ==========================================

/**
 * Payload for creating a new coupon. 
 * Currently scoped to MVP: Percentage and Fixed discounts only.
 */
export interface CreateCouponPayload {
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountAmount: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  maxUsageTotal?: number;
  maxUsagePerUser?: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

/**
 * Payload for updating existing coupons. 
 * 'code' is omitted as it is usually immutable, and all fields are optional for partial updates.
 */
export type UpdateCouponPayload = Partial<Omit<CreateCouponPayload, "code">>;

/**
 * Filters and sorting parameters for fetching coupon lists.
 */
export interface CouponQueryParams {
  page?: number;
  limit?: number;
  keyword?: string;
  isActive?: boolean;
  /** Field used for sorting results. */
  sort?: "createdAt" | "endDate" | "usedCount";
  /** Sort direction. */
  order?: "asc" | "desc";
}