/**
 * @file payment.types.ts
 * @description Data Transfer Objects (DTOs) for Payment Gateway integrations.
 * These types facilitate the communication between your frontend and payment APIs.
 */

// ==========================================
// 1. Enums & Constants
// ==========================================

/**
 * Supported payment providers.
 * Used as a routing key when initiating payment requests to the backend.
 */
export type PaymentProvider = 'momo' | 'paypal';

// ==========================================
// 2. API Response Models
// ==========================================

/**
 * Result returned after calling the payment initiation endpoint.
 * Typically used to handle browser redirection logic.
 */
export interface InitiatePaymentResult {
  /** The URL to which the user should be redirected to complete the payment. */
  paymentUrl: string;

  /** The unique order ID in the database. */
  orderId: string;

  /** The transaction amount to be verified. */
  amount: number;
}

/**
 * Result returned when checking or receiving a callback for payment status.
 * Useful for updating the UI state after a user returns from the payment gateway.
 */
export interface PaymentStatusResult {
  /** The unique identifier of the order. */
  orderId: string;

  /** The human-readable order code (e.g., #ORD-12345). */
  orderCode: string;

  /** The internal status of the payment. */
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';

  /**
   * The current status of the order (e.g., 'confirmed', 'processing').
   * Note: This usually maps to the OrderStatus type defined in order.types.ts.
   */
  orderStatus: string;

  /** Timestamp of when the payment was successfully recorded, if applicable. */
  paidAt?: string;
}
