/**
 * @file api.types.ts
 * @description Standardized definitions for API response structures.
 * This module ensures consistent typing across the application, making it easier
 * to handle API responses and errors in a predictable way.
 */

/**
 * @interface ApiResponse
 * @template T - The specific type of the data payload. Defaults to 'unknown' if not provided.
 * @description Represents the standardized envelope for successful API responses.
 * Using a Generic (T) allows for type safety when accessing the nested 'data' property.
 */
export interface ApiResponse<T = unknown> {
  /** Indicates whether the API request was successful. */
  success: boolean;

  /** A human-readable message provided by the server, useful for UI notifications. */
  message: string;

  /** The actual payload returned by the server. */
  data: T;
}

/**
 * @interface ApiErrorResponse
 * @description Represents the standardized structure for API failures.
 * This interface is designed to accommodate both simple error messages and 
 * complex field-level validation errors.
 */
export interface ApiErrorResponse {
  /** Explicitly set to 'false' to indicate an error state in type checking. */
  success: false;

  /** A summary message describing the error. */
  message: string;

  /** 
   * Optional field for structured error reporting.
   * - If a string: Provides a specific error detail.
   * - If an object (Record): Typically used to map backend validation errors to specific form fields 
   *   (e.g., { email: "Email is invalid", password: "Password too short" }).
   */
  errors?: string | Record<string, string>;
}