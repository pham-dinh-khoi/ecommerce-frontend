/**
 * @file wishlist.types.ts
 * @description Domain models for the Wishlist system.
 * Handles the storage, retrieval, and toggling of saved products.
 */

import type { ProductCardData } from '@/types/product.types';

// ==========================================
// 1. Core Domain Models
// ==========================================

/**
 * Represents a single item saved in a user's wishlist.
 */
export interface WishlistItem {
  /** Unique ID for the wishlist entry itself. */
  wishlistItemId: string;
  
  /** ISO timestamp of when the user added this item. */
  addedAt: string;
  
  /** 
   * The product details. 
   * Note: Can be null if the original product has been deleted or is currently unavailable.
   */
  product: ProductCardData | null;
}

// ==========================================
// 2. API Responses
// ==========================================

/**
 * Standard paginated response for the user's wishlist page.
 */
export interface WishlistListResponse {
  success: boolean;
  message: string;
  items: WishlistItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Result of a toggle action (add/remove).
 * Allows the UI to update the "heart" icon state and counter without a full page refresh.
 */
export interface ToggleWishlistResult {
  /** True if the item was added, False if it was removed. */
  added: boolean;
  /** The new total count of items in the wishlist. */
  totalItems: number;
}