// =============================================================================
// Imports
// =============================================================================

// 1. External/Internal Libraries
import axiosInstance from '@/services/axiosInstance';

// 2. Application Constants
import { CATEGORY_ENDPOINTS } from '@/constants/apiEndpoints';

// 3. Types and Interfaces
import type { ApiResponse } from '@/types/api.types';
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@/types/category.types';

// =============================================================================
// Utility Helpers
// =============================================================================

/**
 * Transforms the Category payload (object) into a FormData instance.
 *
 * Why: When sending 'multipart/form-data' (required for file uploads like category images),
 * we cannot send a standard JSON object. We must manually map properties to FormData.
 *
 * We only append fields that exist in the payload to prevent sending 'undefined' or
 * unwanted empty values to the backend.
 *
 * @param payload - The data to be converted (Create or Update type).
 * @returns {FormData} - Prepared form data object ready for API consumption.
 */
const buildCategoryFormData = (
  payload: CreateCategoryPayload | UpdateCategoryPayload
): FormData => {
  const formData = new FormData();

  // Mapping fields to FormData keys
  if (payload.name !== undefined) formData.append('name', payload.name);
  if (payload.description !== undefined)
    formData.append('description', payload.description);
  if (payload.parent !== undefined) formData.append('parent', payload.parent);

  // Note: Boolean and Number types must be converted to string,
  // as FormData only stores strings or Blobs.
  if (payload.sortOrder !== undefined)
    formData.append('sortOrder', String(payload.sortOrder));
  if (payload.isActive !== undefined)
    formData.append('isActive', String(payload.isActive));

  // Handling file upload: 'image' is the specific key expected by the backend
  if (payload.imageFile) formData.append('image', payload.imageFile);

  return formData;
};

// =============================================================================
// Category Service
// =============================================================================

/**
 * Service object to handle all API operations related to Categories.
 * Each method returns the data directly from the Axios response wrapper.
 */
export const categoryService = {
  /**
   * Retrieves a hierarchical list of categories (tree structure).
   * Used for nested navigation or category management UI.
   */
  getTree: () =>
    axiosInstance
      .get<ApiResponse<Category[]>>(CATEGORY_ENDPOINTS.TREE)
      .then((res) => res.data),

  /**
   * Fetches a flat list of all categories.
   * @param includeInactive - Optional flag to fetch even hidden/inactive categories.
   */
  getAll: (includeInactive = false) =>
    axiosInstance
      .get<ApiResponse<Category[]>>(CATEGORY_ENDPOINTS.ALL, {
        params: { includeInactive },
      })
      .then((res) => res.data),

  /**
   * Fetches details of a single category by its unique ID.
   * @param id - The UUID or unique identifier of the category.
   */
  getById: (id: string) =>
    axiosInstance
      .get<ApiResponse<Category>>(CATEGORY_ENDPOINTS.DETAIL(id))
      .then((res) => res.data),

  /**
   * Creates a new category.
   * Uses 'multipart/form-data' to support image uploads.
   * @param payload - The data for the new category.
   */
  create: (payload: CreateCategoryPayload) => {
    const formData = buildCategoryFormData(payload);
    return axiosInstance
      .post<ApiResponse<Category>>(CATEGORY_ENDPOINTS.CREATE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  },

  /**
   * Updates an existing category.
   * Similar to create, it uses FormData for partial or full updates.
   * @param id - The ID of the category to update.
   * @param payload - The partial or full update data.
   */
  update: (id: string, payload: UpdateCategoryPayload) => {
    const formData = buildCategoryFormData(payload);
    return axiosInstance
      .patch<ApiResponse<Category>>(CATEGORY_ENDPOINTS.UPDATE(id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  },

  /**
   * Removes a category from the system.
   * @param id - The ID of the category to delete.
   */
  delete: (id: string) =>
    axiosInstance
      .delete<ApiResponse<null>>(CATEGORY_ENDPOINTS.DELETE(id))
      .then((res) => res.data),
};
