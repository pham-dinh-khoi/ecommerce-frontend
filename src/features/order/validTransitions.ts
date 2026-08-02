import type { OrderStatus } from '@/types/order.types';

/**
 * VALID_TRANSITIONS
 * ------------------------------------------------------------------
 * Acts as a centralized "Source of Truth" for order lifecycle management.
 *
 * Pattern: Finite State Machine (FSM)
 * Purpose: This lookup table restricts state changes, ensuring an order
 * cannot transition to an invalid state (e.g., jumping from 'delivered'
 * back to 'pending').
 *
 * @type {Record<OrderStatus, OrderStatus[]>}
 *
 * Architecture Benefits:
 * 1. Declarative: Logic is defined as data, not nested control flow.
 * 2. Type-Safe: The use of Record ensures that every OrderStatus is accounted for.
 * 3. Scalable: Adding a new status (e.g., 'returned') only requires updating this object.
 */
export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  // Can move to confirmed or cancelled
  pending: ['confirmed', 'cancelled'],

  // Can proceed to processing or cancel
  confirmed: ['processing', 'cancelled'],

  // Can proceed to shipped or cancel
  processing: ['shipped', 'cancelled'],

  // Delivered is the final state
  shipped: ['delivered'],

  // Terminal states: No further transitions allowed
  delivered: [],
  cancelled: [],
};
