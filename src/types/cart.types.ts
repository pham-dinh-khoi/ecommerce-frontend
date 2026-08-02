/**
 * @file cart.types.ts
 * @description Standardized definitions for Shopping Cart domain models 
 * and API request/response payloads.
 */

// ==========================================
// 1. Data Entities (Response Models)
// ==========================================

/**
 * Represents a single product item within the user's cart.
 */
export interface CartItemResult {
  /** Unique identifier for the product. */
  productId: string;

  /** Unique identifier for the specific variant (e.g., size, color). */
  variantId: string;

  /** Stock Keeping Unit code, used for inventory tracking. */
  sku: string;

  /** Display name of the item. */
  name: string;

  /** Optional URL for the product thumbnail. */
  image?: string;

  /** Price per unit at the time of addition. */
  price: number;

  /** Number of units requested by the user. */
  quantity: number;

  /** Current available stock level for this item. */
  stock: number;

  /** Calculated total price for this line item (price * quantity). */
  subtotal: number;

  /** Indicates if the item is currently available for checkout. */
  isAvailable: boolean;

  /** ISO string timestamp when the item was added to the cart. */
  addedAt: string;
}

/**
 * Represents the aggregate cart object returned by the API.
 */
export interface CartResult {
  /** Array of items currently in the cart. */
  items: CartItemResult[];

  /** Total count of distinct products or line items in the cart. */
  totalItems: number;

  /** The cumulative monetary value of the entire cart. */
  totalAmount: number;

  /** ISO string timestamp indicating the last time the cart was modified. */
  updatedAt: string;
}

// ==========================================
// 2. Request Payloads
// ==========================================

/**
 * Payload required to add a new product variant to the cart.
 */
export interface AddToCartPayload {
  productId: string;
  variantId: string;
  quantity: number;
}

/**
 * Payload required to update the quantity of an existing item in the cart.
 */
export interface UpdateCartItemPayload {
  quantity: number;
}