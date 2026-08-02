import axiosInstance from '@/services/axiosInstance';
import { PAYMENT_ENDPOINTS } from '@/constants/apiEndpoints';
import type { ApiResponse } from '@/types/api.types';
import type {
  PaymentProvider,
  InitiatePaymentResult,
  PaymentStatusResult,
} from '@/types/payment.types';

/**
 * paymentService
 * ------------------------------------------------------------------
 * This service layer acts as a single source of truth for payment API interactions.
 * By decoupling API logic from UI components, we ensure:
 * 1. Maintainability: Endpoint changes are managed in one place.
 * 2. Type Safety: Leverages TypeScript generics for request/response payloads.
 * 3. Reusability: Methods can be imported into any component or hook.
 */
export const paymentService = {
  /**
   * Initiates a new payment transaction.
   *
   * @param orderId - The unique identifier of the order to be paid.
   * @param provider - The selected payment method (e.g., 'stripe', 'paypal').
   * @returns A promise resolving to the InitiatePaymentResult data.
   * @throws Will propagate Axios errors if the request fails (to be caught by the caller).
   */
  initiate: (orderId: string, provider: PaymentProvider) =>
    axiosInstance
      .post<ApiResponse<InitiatePaymentResult>>(PAYMENT_ENDPOINTS.INITIATE, {
        orderId,
        provider,
      })
      // Extract data directly to simplify response handling in the UI/Hook layer
      .then((res) => res.data),

  /**
   * Retrieves the current status of a payment for a specific order.
   *
   * @param orderId - The unique identifier of the order to query.
   * @returns A promise resolving to the current payment status.
   * @description Uses a dynamic endpoint construction defined in constants.
   */
  checkStatus: (orderId: string) =>
    axiosInstance
      .get<ApiResponse<PaymentStatusResult>>(PAYMENT_ENDPOINTS.STATUS(orderId))
      .then((res) => res.data),
};
