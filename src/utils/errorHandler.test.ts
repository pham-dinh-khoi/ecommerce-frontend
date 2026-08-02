import { describe, it, expect } from 'vitest';
import { AxiosError } from 'axios';
import { getErrorMessage } from './errorHandler';
import type { ApiErrorResponse } from '@/types/api.types';

/**
 * Helper to build a fake AxiosError for testing, without making a real HTTP request.
 */
function createAxiosError(
  status: number,
  url: string,
  data?: ApiErrorResponse
): AxiosError<ApiErrorResponse> {
  const error = new AxiosError<ApiErrorResponse>(
    'Request failed',
    String(status),
    { url } as never,
    {},
    {
      status,
      statusText: 'Error',
      headers: {},
      config: { url } as never,
      data,
    } as never
  );
  return error;
}

describe('getErrorMessage', () => {
  describe('401 Unauthorized handling', () => {
    it('returns a non-empty space (not an empty string) for a silent session-expired 401', () => {
      const err = createAxiosError(401, '/orders/123');
      const result = getErrorMessage(err);

      // Regression test: this MUST NOT be an empty string ''.
      // An empty string previously caused Redux Toolkit's rejectWithValue
      // to be misinterpreted, crashing the app with "Objects are not valid as a React child".
      expect(result).not.toBe('');
      expect(result).toBe(' ');
    });

    it('returns the real server message for a 401 on the login route (wrong credentials)', () => {
      const err = createAxiosError(401, '/auth/login', {
        success: false,
        message: 'Incorrect email or password',
      });
      const result = getErrorMessage(err);

      expect(result).toBe('Incorrect email or password');
    });

    it('returns the real server message for a 401 on the change-password route', () => {
      const err = createAxiosError(401, '/auth/change-password', {
        success: false,
        message: 'Current password is incorrect',
      });
      const result = getErrorMessage(err);

      expect(result).toBe('Current password is incorrect');
    });
  });

  describe('429 Too Many Requests', () => {
    it('returns the rate-limit message defined in the app (Vietnamese, user-facing)', () => {
      const err = createAxiosError(429, '/auth/login');
      const result = getErrorMessage(err);

      // Expected value matches the actual Vietnamese UI copy in errorHandler.ts
      expect(result).toBe(
        'Bạn đã thao tác quá nhiều lần, vui lòng thử lại sau ít phút'
      );
    });
  });

  describe('400 Bad Request (validation errors)', () => {
    it('returns the first field error when errors is an object (Zod validation)', () => {
      const err = createAxiosError(400, '/products', {
        success: false,
        message: 'Validation failed',
        errors: { name: 'Name is required', price: 'Price must be positive' },
      });
      const result = getErrorMessage(err);

      expect(result).toBe('Name is required');
    });

    it('returns the errors string directly when errors is a string (Mongoose error)', () => {
      const err = createAxiosError(400, '/products', {
        success: false,
        message: 'Validation failed',
        errors: 'Duplicate slug',
      });
      const result = getErrorMessage(err);

      expect(result).toBe('Duplicate slug');
    });
  });

  describe('fallback behavior', () => {
    it('returns the server message when no specific status handler matches', () => {
      const err = createAxiosError(500, '/orders', {
        success: false,
        message: 'Internal server error',
      });
      const result = getErrorMessage(err);

      expect(result).toBe('Internal server error');
    });

    it("returns the app's generic fallback message when the server sends no message at all", () => {
      const err = createAxiosError(500, '/orders');
      const result = getErrorMessage(err);

      // Expected value matches the actual Vietnamese UI copy in errorHandler.ts
      expect(result).toBe('Có lỗi xảy ra, vui lòng thử lại');
    });

    it('returns the string directly when the error is a plain string (not Axios)', () => {
      const result = getErrorMessage('Something went wrong');
      expect(result).toBe('Something went wrong');
    });

    it("returns the app's generic fallback for a completely unknown error type", () => {
      const result = getErrorMessage(new Error('Unexpected'));
      expect(result).toBe('Có lỗi xảy ra, vui lòng thử lại');
    });
  });
});
