/**
 * src/features/cart/cartService.ts
 *
 * This service handles all HTTP communication related to the shopping cart.
 * By centralizing these calls, we ensure consistency, easier debugging,
 * and better maintainability across the application.
 */

// --- Imports ---
// Third-party / External dependencies first
import axiosInstance from '@/services/axiosInstance';

// Internal application aliases (Features/Constants/Types)
import { CART_ENDPOINTS } from '@/constants/apiEndpoints';
import type { ApiResponse } from '@/types/api.types';
import type {
  CartResult,
  AddToCartPayload,
  UpdateCartItemPayload,
} from '@/types/cart.types';

// --- Service Implementation ---
export const cartService = {
  /**
   * Fetches the current user's shopping cart data.
   * @returns {Promise<CartResult>} The current cart state.
   */
  getCart: () =>
    axiosInstance
      .get<ApiResponse<CartResult>>(CART_ENDPOINTS.GET)
      .then((res) => res.data),

  /**
   * Adds an item to the cart.
   * @param {AddToCartPayload} payload - The product details (variantId, quantity, etc.)
   * @returns {Promise<CartResult>} Updated cart state after addition.
   */
  addItem: (payload: AddToCartPayload) =>
    axiosInstance
      .post<ApiResponse<CartResult>>(CART_ENDPOINTS.ADD_ITEM, payload)
      .then((res) => res.data),

  /**
   * Updates an existing item in the cart (e.g., changing quantity).
   * Uses PATCH for partial updates.
   * @param {string} variantId - The unique identifier of the cart item.
   * @param {UpdateCartItemPayload} payload - The data to update (usually quantity).
   * @returns {Promise<CartResult>} Updated cart state.
   */
  updateItem: (variantId: string, payload: UpdateCartItemPayload) =>
    axiosInstance
      .patch<ApiResponse<CartResult>>(
        CART_ENDPOINTS.UPDATE_ITEM(variantId),
        payload
      )
      .then((res) => res.data),

  /**
   * Removes a specific item from the cart.
   * @param {string} variantId - The unique identifier of the item to remove.
   * @returns {Promise<CartResult>} Updated cart state after removal.
   */
  removeItem: (variantId: string) =>
    axiosInstance
      .delete<ApiResponse<CartResult>>(CART_ENDPOINTS.REMOVE_ITEM(variantId))
      .then((res) => res.data),

  /**
   * Completely clears the shopping cart.
   * @returns {Promise<null>} Confirmation of the deletion.
   */
  clearCart: () =>
    axiosInstance
      .delete<ApiResponse<null>>(CART_ENDPOINTS.CLEAR)
      .then((res) => res.data),
};
