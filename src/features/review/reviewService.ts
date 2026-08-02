import axiosInstance from '@/services/axiosInstance';
import { REVIEW_ENDPOINTS } from '@/constants/apiEndpoints';
import type { ApiResponse } from '@/types/api.types';
import type {
  Review,
  ProductReviewListResponse,
  CreateReviewPayload,
  UpdateReviewPayload,
  ModerateReviewPayload,
  ReplyReviewPayload,
  ReviewQueryParams,
  AdminReviewQueryParams,
  VoteHelpfulResult,
} from '@/types/review.types';

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Transforms review payloads into FormData objects.
 * This is required when sending multipart/form-data (e.g., when uploading review images).
 *
 * @param payload - The review data (Create or Update).
 * @returns {FormData} Form data object ready for API consumption.
 */
const buildReviewFormData = (
  payload: CreateReviewPayload | UpdateReviewPayload
): FormData => {
  const formData = new FormData();
  const { imageFiles, ...rest } = payload;

  // Append all non-file fields to FormData
  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined) formData.append(key, String(value));
  });

  // Append images if they exist
  imageFiles?.forEach((file) => formData.append('images', file));

  return formData;
};

// ============================================================================
// SERVICE EXPORTS
// ============================================================================

export const reviewService = {
  // --------------------------------------------------------------------------
  // USER / CUSTOMER ACTIONS
  // --------------------------------------------------------------------------

  /**
   * Creates a new review for a product.
   * Handles multipart request for image uploads.
   */
  create: (payload: CreateReviewPayload) =>
    axiosInstance
      .post<ApiResponse<Review>>(
        REVIEW_ENDPOINTS.CREATE,
        buildReviewFormData(payload),
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )
      .then((res) => res.data),

  /**
   * Retrieves a paginated list of reviews for a specific product.
   */
  getProductReviews: (productId: string, params: ReviewQueryParams) =>
    axiosInstance
      .get<ProductReviewListResponse>(
        REVIEW_ENDPOINTS.PRODUCT_REVIEWS(productId),
        { params }
      )
      .then((res) => res.data),

  /**
   * Retrieves all reviews submitted by the authenticated user.
   */
  getMyReviews: (page = 1, limit = 10) =>
    axiosInstance
      .get<ApiResponse<Review[]>>(REVIEW_ENDPOINTS.MY_REVIEWS, {
        params: { page, limit },
      })
      .then((res) => res.data),

  /**
   * Updates an existing user review.
   * Supports FormData for modifying text or updating/removing images.
   */
  update: (reviewId: string, payload: UpdateReviewPayload) =>
    axiosInstance
      .patch<ApiResponse<Review>>(
        REVIEW_ENDPOINTS.UPDATE(reviewId),
        buildReviewFormData(payload),
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )
      .then((res) => res.data),

  /**
   * Deletes a specific review by its ID.
   */
  delete: (reviewId: string) =>
    axiosInstance
      .delete<ApiResponse<null>>(REVIEW_ENDPOINTS.DELETE(reviewId))
      .then((res) => res.data),

  /**
   * Submits a helpful/unhelpful vote for a specific review.
   */
  voteHelpful: (reviewId: string, isHelpful: boolean) =>
    axiosInstance
      .post<ApiResponse<VoteHelpfulResult>>(
        REVIEW_ENDPOINTS.VOTE_HELPFUL(reviewId),
        { isHelpful }
      )
      .then((res) => res.data),

  // --------------------------------------------------------------------------
  // ADMIN / MODERATION ACTIONS
  // --------------------------------------------------------------------------

  /**
   * Fetches a list of reviews for administration filtering/moderation.
   */
  adminGetList: (params: AdminReviewQueryParams) =>
    axiosInstance
      .get<ProductReviewListResponse>(REVIEW_ENDPOINTS.ADMIN_LIST, { params })
      .then((res) => res.data),

  /**
   * Moderates a review (e.g., approving, rejecting, or hiding).
   */
  adminModerate: (reviewId: string, payload: ModerateReviewPayload) =>
    axiosInstance
      .patch<ApiResponse<Review>>(
        REVIEW_ENDPOINTS.ADMIN_MODERATE(reviewId),
        payload
      )
      .then((res) => res.data),

  /**
   * Admin-level deletion of a review.
   */
  adminDelete: (reviewId: string) =>
    axiosInstance
      .delete<ApiResponse<null>>(REVIEW_ENDPOINTS.ADMIN_DELETE(reviewId))
      .then((res) => res.data),

  /**
   * Adds an official store/admin reply to a specific review.
   */
  reply: (reviewId: string, payload: ReplyReviewPayload) =>
    axiosInstance
      .post<ApiResponse<Review>>(REVIEW_ENDPOINTS.REPLY(reviewId), payload)
      .then((res) => res.data),
};
