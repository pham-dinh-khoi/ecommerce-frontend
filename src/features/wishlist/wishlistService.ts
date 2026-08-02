import axiosInstance from '@/services/axiosInstance';
import { WISHLIST_ENDPOINTS } from '@/constants/apiEndpoints';
import type { ApiResponse } from '@/types/api.types';
import type {
  WishlistListResponse,
  ToggleWishlistResult,
} from '@/types/wishlist.types';

/**
 * wishlistService
 *
 * Centralized service layer for all Wishlist-related API interactions.
 * This pattern abstracts the Axios logic, ensuring that components don't need
 * to know about endpoints or HTTP verbs, only the functional outcome.
 */
export const wishlistService = {
  /**
   * Fetches the user's wishlist with pagination support.
   *
   * @param page - The page index to retrieve (default: 1).
   * @param limit - The number of items to fetch per page (default: 20).
   * @returns Promise containing the paginated wishlist items.
   */
  getList: (page = 1, limit = 20) =>
    axiosInstance
      .get<WishlistListResponse>(WISHLIST_ENDPOINTS.LIST, {
        params: { page, limit },
      })
      .then((res) => res.data),

  /**
   * Toggles the wishlist status of a specific product (add to or remove from).
   *
   * @param productId - The unique identifier of the product to toggle.
   * @returns Promise containing the result status (added/removed state).
   */
  toggle: (productId: string) =>
    axiosInstance
      .post<ApiResponse<ToggleWishlistResult>>(
        WISHLIST_ENDPOINTS.TOGGLE(productId)
      )
      .then((res) => res.data),

  /**
   * Checks if a specific product is currently in the user's wishlist.
   * Useful for UI components like ProductCards to show the correct "heart" icon state.
   *
   * @param productId - The unique identifier of the product to check.
   * @returns Promise containing boolean status (isInWishlist).
   */
  check: (productId: string) =>
    axiosInstance
      .get<ApiResponse<{ isInWishlist: boolean }>>(
        WISHLIST_ENDPOINTS.CHECK(productId)
      )
      .then((res) => res.data),

  /**
   * Removes all items from the user's wishlist.
   *
   * @returns Promise indicating the success of the clearing operation.
   */
  clear: () =>
    axiosInstance
      .delete<ApiResponse<null>>(WISHLIST_ENDPOINTS.CLEAR)
      .then((res) => res.data),
};
