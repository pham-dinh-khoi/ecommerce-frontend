import { isAxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api.types';

/**
 * Routes that should NOT trigger a silent logout or "Session Expired" 
 * UI handling even if they return a 401 Unauthorized status.
 */
const AUTH_CREDENTIAL_ROUTES = [
  '/auth/login',
  '/auth/change-password',
  '/auth/reset-password'
];

/**
 * Extracts a user-friendly error message from an unknown error object.
 * This utility handles Axios responses, specific HTTP status codes,
 * and generic error types.
 *
 * @param err - The error caught in a try/catch block.
 * @returns A string suitable for UI display.
 */
export const getErrorMessage = (err: unknown): string => {
  // 1. Handle Axios-specific errors
  if (isAxiosError<ApiErrorResponse>(err)) {
    const status = err.response?.status;
    const data = err.response?.data;
    const url = err.config?.url ?? '';

    // Check if the current request is an authentication check
    const isCredentialCheck = AUTH_CREDENTIAL_ROUTES.some((route) => 
      url.includes(route)
    );

    /**
     * Silent 401 Handling:
     * If 401 occurs and it's NOT a credential check route, return a space character.
     * We return ' ' (non-empty) instead of an empty string to prevent potential
     * falsy-edge-case bugs in Redux Toolkit `rejectWithValue` or other state managers.
     */
    if (status === 401 && !isCredentialCheck) {
      return ' ';
    }

    // Rate Limiting (Too Many Requests)
    if (status === 429) {
      return 'Bạn đã thao tác quá nhiều lần, vui lòng thử lại sau ít phút';
    }

    // Validation Errors (400 Bad Request)
    if (status === 400 && data?.errors) {
      if (typeof data.errors === 'object') {
        const firstError = Object.values(data.errors)[0];
        return firstError || data.message;
      }
      return data.errors;
    }

    // Fallback to server message or generic error
    return data?.message ?? 'Có lỗi xảy ra, vui lòng thử lại';
  }

  // 2. Handle simple string errors
  if (typeof err === 'string') {
    return err;
  }

  // 3. Generic Fallback
  return 'Có lỗi xảy ra, vui lòng thử lại';
};