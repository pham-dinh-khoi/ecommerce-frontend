/**
 * @file order.types.ts
 * @description Domain models and DTOs for the Order and Payment management systems.
 */

// ==========================================
// 1. Enums & State Types
// ==========================================

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';
export type PaymentMethod = 'cod' | 'paypal';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// ==========================================
// 2. Order Sub-Entities
// ==========================================

/** Represents an individual product line item within an order. */
export interface OrderItem {
  product: string;
  variant: string;
  sku: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

/** Details regarding shipping address, carrier information, and delivery tracking. */
export interface ShippingInfo {
  recipientName: string;
  recipientPhone: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
  carrier?: string;
  trackingCode?: string;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

/** Details regarding the financial transaction associated with the order. */
export interface PaymentInfo {
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  paidAt?: string;
  transactionId?: string;
  refundedAt?: string;
  refundAmount?: number;
}

/** Stores context if an order is cancelled. */
export interface CancellationInfo {
  reason: string;
  cancelledBy: 'user' | 'admin' | 'system';
  cancelledAt: string;
}

/** Audit log entry for tracking the order status lifecycle. */
export interface OrderTimelineEntry {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

// ==========================================
// 3. Domain Model
// ==========================================

/**
 * The core Order interface.
 * Note: 'user' can be a populated object or a simple ID string depending on API population settings.
 */
export interface Order {
  _id: string;
  orderCode: string;
  user: { _id: string; name: string; email: string; phone?: string } | string;
  items: OrderItem[];
  shipping: ShippingInfo;
  payment: PaymentInfo;
  cancellation?: CancellationInfo;
  /** Audit log: typically only present in the "Order Details" view, excluded from lists. */
  timeline?: OrderTimelineEntry[];
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 4. Request Payloads (DTOs)
// ==========================================

export interface NewAddressInput {
  recipientName: string;
  recipientPhone: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
}

/** Input for creating a new order. Allows selecting a saved address or providing a new one. */
export interface PlaceOrderPayload {
  addressId?: string;
  newAddress?: NewAddressInput;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  note?: string;
}

/** Input for modifying order status (e.g., updating carrier info after processing). */
export interface UpdateOrderStatusPayload {
  status: Exclude<OrderStatus, 'pending'>;
  note?: string;
  carrier?: string;
  trackingCode?: string;
  estimatedDelivery?: string;
}

export interface CancelOrderPayload {
  reason: string;
}

// ==========================================
// 5. Query Params & Responses
// ==========================================

export interface UserOrderQueryParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

/** Extended query parameters for Admin panels with filtering and sorting capabilities. */
export interface AdminOrderQueryParams extends UserOrderQueryParams {
  userId?: string;
  keyword?: string;
  paymentMethod?: PaymentMethod;
  fromDate?: string;
  toDate?: string;
  sort?: 'createdAt' | 'totalAmount';
  order?: 'asc' | 'desc';
}

interface PaginationResult {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface OrderListResponse {
  success: boolean;
  message: string;
  orders: Order[];
  pagination: PaginationResult;
}

/** Statistical summary of order performance and revenue. */
export interface OrderStats {
  byStatus: Record<string, number>;
  revenue: {
    total: number;
    deliveredOrders: number;
    avgOrderValue: number;
  };
}
