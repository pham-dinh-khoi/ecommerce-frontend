/**
 * @file auth.types.ts
 * @description Centralized definitions for Authentication-related domain models,
 * API DTOs (Data Transfer Objects), and the frontend Auth State schema.
 */

// ==========================================
// 1. Core Domain Models
// ==========================================

/**
 * Defines the strict roles permitted in the system.
 * Using a Union type provides compile-time safety across the frontend.
 */
export type UserRole = 'admin' | 'user' | 'seller';

/**
 * Represents the authenticated User profile.
 * Acts as the primary interface for user context throughout the application.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: { url: string; publicId: string };
}

// ==========================================
// 2. Request Payloads (DTOs)
// ==========================================

/** Payload structure for user login authentication. */
export interface LoginPayload {
  email: string;
  password: string;
}

/** Payload for user registration. Phone is optional to allow flexible signup flows. */
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

/** Payload for requesting a password reset email. */
export interface ForgotPasswordPayload {
  email: string;
}

/** Payload for the final password reset action, requiring a verification token. */
export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

/** Payload for changing an existing password while authenticated. */
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// ==========================================
// 3. Response DTOs
// ==========================================

/** Expected response structure after a successful login. Includes the JWT/Token. */
export interface LoginResponseData {
  accessToken: string;
  user: User;
}

/** Expected response after a successful registration. Typically returns created user identity. */
export interface RegisterResponseData {
  id: string;
  name: string;
  email: string;
}

// ==========================================
// 4. State Management
// ==========================================

/**
 * Represents the global authentication state.
 * Designed to support asynchronous patterns (e.g., Redux, Context API, or TanStack Query).
 */
export interface AuthState {
  /** The currently authenticated user, or null if unauthenticated. */
  user: User | null;

  /** The JWT/Access token for API authorization headers. */
  accessToken: string | null;

  /** Computed boolean for quick UI conditional rendering. */
  isAuthenticated: boolean;

  /**
   * Represents the lifecycle status of the auth request.
   * Useful for triggering loading spinners or disabling buttons.
   */
  status: 'idle' | 'loading' | 'succeeded' | 'failed';

  /** Holds error messages from the backend to display in UI feedback. */
  error: string | null;

  /**
   * Tracks the background session-bootstrap lifecycle (refresh token + profile
   * fetch on app load), independently of `status`/`isAuthenticated`:
   * - 'idle': bootstrap not started
   * - 'pending': bootstrap in progress
   * - 'done': bootstrap finished — combine with `isAuthenticated` to know
   *   whether the resolved session is authenticated or unauthenticated.
   */
  bootstrapStatus: 'idle' | 'pending' | 'done';
}
