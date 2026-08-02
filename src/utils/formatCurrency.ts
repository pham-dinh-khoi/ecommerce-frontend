/**
 * @file formatCurrency.ts
 * @description Utility for currency formatting.
 */

/**
 * Formats a given number into a Vietnamese currency string (e.g., 100000 -> "100.000₫").
 * 
 * @param value - The numeric amount to format.
 * @returns A formatted string appending the Vietnamese Dong symbol.
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString("vi-VN") + "₫";
}