/**
 * src/services/axiosInstance.ts
 * 
 * Centralized Axios instance configuration.
 * Handles:
 * 1. Global API base configuration.
 * 2. Request injection (Auth Tokens, Guest IDs).
 * 3. Concurrent Token Refresh mechanism (handling 401 errors gracefully).
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

// Internal imports
import { AUTH_ENDPOINTS } from '@/constants/apiEndpoints';
import { SESSION_EXPIRED_MESSAGE } from '@/constants/errorMessages';
import { logout, refreshAccessTokenThunk } from '@/features/auth/authSlice';
import { store } from '@/store';
import { navigateTo } from '@/lib/navigation';
import { getGuestId } from '@/lib/guestId';

// --- Configuration ---
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Crucial for sending/receiving HttpOnly cookies (containing refresh tokens)
});

// --- Token Refresh State Management ---
// Used to prevent multiple refresh calls if several requests fail simultaneously
let is_refreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}[] = [];

/**
 * Helper to process the queue of requests that failed while the token was being refreshed.
 */
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  failedQueue = [];
};

// ============================================================================
// 1. REQUEST INTERCEPTOR
// ============================================================================
axiosInstance.interceptors.request.use((config) => {
  // A. Inject Access Token for authenticated users
  const token = store.getState().auth.accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // B. Inject Guest ID for anonymous cart sessions
  const needsGuestId =
    config.url?.includes('/cart') ||
    config.url?.includes('/auth/login') ||
    config.url?.includes('/auth/register');

  if (needsGuestId) {
    const guestId = getGuestId();
    if (guestId && config.headers) {
      config.headers['X-Guest-Id'] = guestId;
    }
  }

  return config;
});

// ============================================================================
// 2. RESPONSE INTERCEPTOR
// ============================================================================
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Determine if we are dealing with an authentication endpoint to avoid infinite loops
    const isAuthRoute =
      originalRequest.url?.includes(AUTH_ENDPOINTS.LOGIN) ||
      originalRequest.url?.includes(AUTH_ENDPOINTS.REFRESH_TOKEN);

    // Trigger refresh logic only on 401 Unauthorized, if not already retrying, and not an auth route
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      
      // If a refresh is already in progress, queue this request
      if (is_refreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Start the refresh process
      originalRequest._retry = true;
      is_refreshing = true;

      try {
        // Attempt to refresh the access token via Redux Thunk
        const newToken = await store.dispatch(refreshAccessTokenThunk()).unwrap();

        // On success: Release the queue with the new token
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        return axiosInstance(originalRequest);
      } catch {
        // On failure: Clear queue, logout, and redirect to login
        processQueue(SESSION_EXPIRED_MESSAGE, null);
        store.dispatch(logout());
        toast.error('Session expired, please log in again');
        navigateTo('/login');
        
        return Promise.reject(SESSION_EXPIRED_MESSAGE);
      } finally {
        is_refreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;