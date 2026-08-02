/**
 * @fileoverview Search Service
 * Handles all API communication related to search functionality.
 * This layer abstracts HTTP requests, providing a clean interface for UI components.
 */

import axiosInstance from '@/services/axiosInstance';
import { SEARCH_ENDPOINTS } from '@/constants/apiEndpoints';

// Import types for strict contract enforcement
import type { ApiResponse } from '@/types/api.types';
import type {
  SearchParams,
  SearchResponse,
  AutocompleteItem,
  SearchResultItem,
} from '@/types/search.types';

export const searchService = {
  /**
   * Executes a paginated search request with optional filters.
   * @param {SearchParams} params - Search criteria, filters, and pagination options.
   * @returns {Promise<SearchResponse>} A promise resolving to the search results.
   */
  search: (params: SearchParams) =>
    axiosInstance
      .get<SearchResponse>(SEARCH_ENDPOINTS.SEARCH, { params })
      .then((res) => res.data),

  /**
   * Retrieves real-time autocomplete suggestions based on the user's input.
   * @param {string} q - The partial search query string.
   * @returns {Promise<ApiResponse<AutocompleteItem[]>>} A promise resolving to an array of suggestions.
   */
  autocomplete: (q: string) =>
    axiosInstance
      .get<ApiResponse<AutocompleteItem[]>>(SEARCH_ENDPOINTS.AUTOCOMPLETE, {
        params: { q },
      })
      .then((res) => res.data),

  /**
   * Fetches currently trending products or search queries.
   * @returns {Promise<ApiResponse<SearchResultItem[]>>} A promise resolving to the trending items list.
   */
  trending: () =>
    axiosInstance
      .get<ApiResponse<SearchResultItem[]>>(SEARCH_ENDPOINTS.TRENDING)
      .then((res) => res.data),

  /**
   * Retrieves products similar to a given product identifier.
   * @param {string} productId - The unique identifier of the target product.
   * @returns {Promise<ApiResponse<SearchResultItem[]>>} A promise resolving to the list of similar items.
   */
  similar: (productId: string) =>
    axiosInstance
      .get<ApiResponse<SearchResultItem[]>>(SEARCH_ENDPOINTS.SIMILAR(productId))
      .then((res) => res.data),
};
