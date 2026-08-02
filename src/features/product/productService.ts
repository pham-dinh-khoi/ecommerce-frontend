import axiosInstance from '@/services/axiosInstance';
import { PRODUCT_ENDPOINTS } from '@/constants/apiEndpoints';

// Type Definitions
import type { ApiResponse } from '@/types/api.types';
import type {
  Product,
  ProductListResponse,
  CreateProductPayload,
  UpdateProductPayload,
  CreateVariantPayload,
  UpdateVariantPayload,
  ProductQueryParams,
} from '@/types/product.types';

/**
 * Configuration
 * Standard header requirement for multipart/form-data requests
 * to ensure the server correctly parses binary file uploads.
 */
const multipartHeaders = { headers: { 'Content-Type': 'multipart/form-data' } };

/**
 * Helpers: Data Serialization
 *
 * FormData is required for file uploads, but it does not support nested JSON objects.
 * We must manually stringify complex arrays (tags, attributes) so they are
 * interpreted correctly by the backend API.
 */

const buildProductFormData = (
  payload: CreateProductPayload | UpdateProductPayload
): FormData => {
  const formData = new FormData();
  const { imageFiles, tags, ...rest } = payload as CreateProductPayload;

  // Extract simple key-value pairs
  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined) formData.append(key, String(value));
  });

  // Handle complex types
  if (tags) formData.append('tags', JSON.stringify(tags));

  // Handle binary files
  imageFiles?.forEach((file) => formData.append('images', file));

  return formData;
};

const buildVariantFormData = (
  payload: CreateVariantPayload | UpdateVariantPayload
): FormData => {
  const formData = new FormData();
  const { imageFiles, attributes, ...rest } = payload as CreateVariantPayload;

  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined) formData.append(key, String(value));
  });

  if (attributes) formData.append('attributes', JSON.stringify(attributes));
  imageFiles?.forEach((file) => formData.append('images', file));

  return formData;
};

/**
 * Service: Product Management
 * Encapsulates all API interactions for products, variants, and their images.
 */
export const productService = {
  // --- Core CRUD Operations ---

  /** Fetches a paginated/filtered list of products. */
  getProducts: (params: ProductQueryParams) =>
    axiosInstance
      .get<ProductListResponse>(PRODUCT_ENDPOINTS.LIST, { params })
      .then((res) => res.data),

  /** Retrieves full details for a single product by ID or slug. */
  getById: (idOrSlug: string) =>
    axiosInstance
      .get<ApiResponse<Product>>(PRODUCT_ENDPOINTS.DETAIL(idOrSlug))
      .then((res) => res.data),

  /** Creates a new product with file support via FormData. */
  create: (payload: CreateProductPayload) =>
    axiosInstance
      .post<ApiResponse<Product>>(
        PRODUCT_ENDPOINTS.CREATE,
        buildProductFormData(payload),
        multipartHeaders
      )
      .then((res) => res.data),

  /** Updates product information (JSON body). */
  update: (id: string, payload: UpdateProductPayload) =>
    axiosInstance
      .patch<ApiResponse<Product>>(PRODUCT_ENDPOINTS.UPDATE(id), payload)
      .then((res) => res.data),

  /** Soft delete a product. */
  delete: (id: string) =>
    axiosInstance
      .delete<ApiResponse<null>>(PRODUCT_ENDPOINTS.DELETE(id))
      .then((res) => res.data),

  /** Permanent removal from database. */
  permanentlyDelete: (id: string) =>
    axiosInstance
      .delete<ApiResponse<null>>(PRODUCT_ENDPOINTS.PERMANENT_DELETE(id))
      .then((res) => res.data),

  // --- Variant Management ---

  /** Appends a new variant to an existing product. */
  addVariant: (productId: string, payload: CreateVariantPayload) =>
    axiosInstance
      .post<ApiResponse<Product>>(
        PRODUCT_ENDPOINTS.ADD_VARIANT(productId),
        buildVariantFormData(payload),
        multipartHeaders
      )
      .then((res) => res.data),

  /** Updates attributes of a specific variant. */
  updateVariant: (
    productId: string,
    variantId: string,
    payload: UpdateVariantPayload
  ) =>
    axiosInstance
      .patch<ApiResponse<Product>>(
        PRODUCT_ENDPOINTS.UPDATE_VARIANT(productId, variantId),
        payload
      )
      .then((res) => res.data),

  /** Removes a variant from a product. */
  deleteVariant: (productId: string, variantId: string) =>
    axiosInstance
      .delete<ApiResponse<Product>>(
        PRODUCT_ENDPOINTS.DELETE_VARIANT(productId, variantId)
      )
      .then((res) => res.data),

  // --- Image Management ---

  /** Adds new images to an existing product. */
  addImages: (productId: string, imageFiles: File[]) => {
    const formData = new FormData();
    imageFiles.forEach((file) => formData.append('images', file));
    return axiosInstance
      .post<ApiResponse<Product>>(
        PRODUCT_ENDPOINTS.ADD_IMAGES(productId),
        formData,
        multipartHeaders
      )
      .then((res) => res.data);
  },

  /** Removes an image using its public identifier. */
  deleteImage: (productId: string, publicId: string) =>
    axiosInstance
      .delete<ApiResponse<Product>>(
        PRODUCT_ENDPOINTS.DELETE_IMAGE(productId, publicId)
      )
      .then((res) => res.data),

  /** Sets a specific image as the primary cover photo. */
  setPrimaryImage: (productId: string, publicId: string) =>
    axiosInstance
      .patch<ApiResponse<Product>>(
        PRODUCT_ENDPOINTS.SET_PRIMARY_IMAGE(productId, publicId)
      )
      .then((res) => res.data),

  /** Reorders the product gallery images. */
  reorderImages: (productId: string, orderedPublicIds: string[]) =>
    axiosInstance
      .patch<ApiResponse<Product>>(
        PRODUCT_ENDPOINTS.REORDER_IMAGES(productId),
        {
          orderedPublicIds,
        }
      )
      .then((res) => res.data),
};
