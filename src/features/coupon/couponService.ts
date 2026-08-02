import axiosInstance from '@/services/axiosInstance';
import { COUPON_ENDPOINTS } from '@/constants/apiEndpoints';
import type { ApiResponse } from '@/types/api.types';
import type {
  Coupon,
  CouponPreviewResponse,
  CreateCouponPayload,
  UpdateCouponPayload,
  CouponQueryParams,
  CouponListResponse,
} from '@/types/coupon.types';

/**
 * Service object for handling all coupon-related API requests.
 * Encapsulates the communication layer to keep component logic clean.
 */
export const couponService = {
  /**
   * Validates and previews a coupon code before application to the cart.
   * @param code - The string code to preview.
   * @returns Promise containing the coupon preview details.
   */
  preview: (code: string) =>
    axiosInstance
      .post<ApiResponse<CouponPreviewResponse>>(COUPON_ENDPOINTS.PREVIEW, {
        code,
      })
      .then((res) => res.data),

  /**
   * Fetches a paginated list of coupons for the admin dashboard.
   * @param params - Query parameters for filtering, sorting, and pagination.
   */
  adminGetList: (params: CouponQueryParams) =>
    axiosInstance
      .get<CouponListResponse>(COUPON_ENDPOINTS.ADMIN_LIST, { params })
      .then((res) => res.data),

  /**
   * Retrieves specific coupon details by its unique identifier.
   * @param id - The unique MongoDB ID of the coupon.
   */
  adminGetById: (id: string) =>
    axiosInstance
      .get<ApiResponse<Coupon>>(COUPON_ENDPOINTS.ADMIN_DETAIL(id))
      .then((res) => res.data),

  /**
   * Creates a new coupon entry.
   * @param payload - The data structure required for creating a new coupon.
   */
  adminCreate: (payload: CreateCouponPayload) =>
    axiosInstance
      .post<ApiResponse<Coupon>>(COUPON_ENDPOINTS.ADMIN_CREATE, payload)
      .then((res) => res.data),

  /**
   * Updates an existing coupon by ID.
   * @param id - The ID of the coupon to update.
   * @param payload - The fields to be updated.
   */
  adminUpdate: (id: string, payload: UpdateCouponPayload) =>
    axiosInstance
      .patch<ApiResponse<Coupon>>(COUPON_ENDPOINTS.ADMIN_UPDATE(id), payload)
      .then((res) => res.data),

  /**
   * Removes a coupon from the system.
   * @param id - The ID of the coupon to delete.
   */
  adminDelete: (id: string) =>
    axiosInstance
      .delete<ApiResponse<null>>(COUPON_ENDPOINTS.ADMIN_DELETE(id))
      .then((res) => res.data),
};
