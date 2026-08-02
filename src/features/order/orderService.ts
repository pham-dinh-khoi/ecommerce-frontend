import axiosInstance from '@/services/axiosInstance';
import { ORDER_ENDPOINTS } from '@/constants/apiEndpoints';
import type { ApiResponse } from '@/types/api.types';
import type {
  Order,
  OrderListResponse,
  OrderStats,
  PlaceOrderPayload,
  UpdateOrderStatusPayload,
  CancelOrderPayload,
  UserOrderQueryParams,
  AdminOrderQueryParams,
} from '@/types/order.types';

/**
 * orderService
 * ------------------------------------------------------------------
 * This service object encapsulates all API interactions for the "Order" feature.
 *
 * Design Philosophy:
 * 1. Abstraction: Components interact with these methods, not directly with `axios`.
 * 2. Type Safety: Leverages TypeScript generics to ensure request/response data matches defined schemas.
 * 3. Centralized Endpoint Management: Relies on `ORDER_ENDPOINTS` for consistent URL patterns.
 */
export const orderService = {
  // ==========================================
  // User Operations
  // ==========================================

  /**
   * Places a new order.
   * @param payload - The data required to create an order (items, shipping info, etc.).
   * @returns A promise resolving to the created Order object.
   */
  placeOrder: (payload: PlaceOrderPayload) =>
    axiosInstance
      .post<ApiResponse<Order>>(ORDER_ENDPOINTS.PLACE, payload)
      .then((res) => res.data),

  /**
   * Retrieves a paginated list of the current user's orders.
   * @param params - Query parameters for filtering/pagination (e.g., page, limit, status).
   * @returns A promise resolving to an OrderListResponse (orders array + pagination metadata).
   */
  getMyOrders: (params: UserOrderQueryParams) =>
    axiosInstance
      .get<OrderListResponse>(ORDER_ENDPOINTS.MY_ORDERS, { params })
      .then((res) => res.data),

  /**
   * Fetches detailed information for a specific order by its code.
   * @param orderCode - The human-readable order identifier.
   */
  getById: (orderCode: string) =>
    axiosInstance
      .get<ApiResponse<Order>>(ORDER_ENDPOINTS.DETAIL(orderCode))
      .then((res) => res.data),

  /**
   * Cancels an existing user order.
   * @param orderId - The MongoDB ID of the order.
   * @param payload - Cancellation reasons or confirmation details.
   */
  cancel: (orderId: string, payload: CancelOrderPayload) =>
    axiosInstance
      .patch<ApiResponse<Order>>(ORDER_ENDPOINTS.CANCEL(orderId), payload)
      .then((res) => res.data),

  // ==========================================
  // Admin Operations
  // ==========================================

  /**
   * Admin-only: Fetches a filtered/paginated list of orders across the system.
   */
  adminGetList: (params: AdminOrderQueryParams) =>
    axiosInstance
      .get<OrderListResponse>(ORDER_ENDPOINTS.ADMIN_LIST, { params })
      .then((res) => res.data),

  /**
   * Admin-only: Fetches detailed information for a specific order by its ID.
   */
  adminGetById: (orderId: string) =>
    axiosInstance
      .get<ApiResponse<Order>>(ORDER_ENDPOINTS.ADMIN_DETAIL(orderId))
      .then((res) => res.data),

  /**
   * Admin-only: Updates the status of an order (e.g., from 'pending' to 'shipped').
   */
  adminUpdateStatus: (orderId: string, payload: UpdateOrderStatusPayload) =>
    axiosInstance
      .patch<ApiResponse<Order>>(
        ORDER_ENDPOINTS.ADMIN_UPDATE_STATUS(orderId),
        payload
      )
      .then((res) => res.data),

  /**
   * Admin-only: Fetches high-level system statistics (revenue, volume, etc.).
   */
  adminGetStats: () =>
    axiosInstance
      .get<ApiResponse<OrderStats>>(ORDER_ENDPOINTS.ADMIN_STATS)
      .then((res) => res.data),
};
