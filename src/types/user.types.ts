/**
 * @file user.types.ts
 * @description Domain models and Data Transfer Objects (DTOs) for the User management system.
 * Handles user profiles, hierarchical address structures, and administrative user controls.
 */

// ==========================================
// 1. Core Domain Models
// ==========================================

export type UserRole = "admin" | "seller" | "user";
export type Gender = "male" | "female" | "other";

/** Represents the user's avatar image metadata. */
export interface UserAvatar {
  url: string;
  publicId: string; // Cloud storage identifier for deletion/update
}

/** 
 * Represents a shipping or billing address.
 * Used for address management within the user profile.
 */
export interface Address {
  _id: string;
  label: string; // e.g., "Home", "Office"
  recipientName: string;
  recipientPhone: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
  isDefault: boolean; // Indicates if this is the primary shipping address
}

/** 
 * The aggregate user profile entity.
 * Centralizes authentication, identity, and personal contact information.
 */
export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: UserAvatar;
  phone?: string;
  gender?: Gender;
  dateOfBirth?: string;
  addresses: Address[];
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 2. Payloads (Input DTOs)
// ==========================================

/** Payload for users updating their own profile information. */
export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  gender?: Gender;
  dateOfBirth?: string;
}

/** Payload for adding a new address to a user's address book. */
export interface AddressPayload {
  label: string;
  recipientName: string;
  recipientPhone: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
  isDefault?: boolean;
}

/** Partial update payload for modifying an existing address. */
export type UpdateAddressPayload = Partial<AddressPayload>;

/** Payload for admins to modify account status or roles (e.g., banning users or promoting to seller). */
export interface AdminUpdateUserPayload {
  role?: UserRole;
  isActive?: boolean;
}

// ==========================================
// 3. Admin & Query Utilities
// ==========================================

/** Filtering and sorting parameters for user list management. */
export interface AdminUserQueryParams {
  page?: number;
  limit?: number;
  keyword?: string;
  role?: UserRole;
  isActive?: boolean;
  sort?: "createdAt" | "name" | "email";
  order?: "asc" | "desc";
}

/** Paginated response structure for admin user lists. */
export interface AdminUserListResponse {
  success: boolean;
  message: string;
  users: UserProfile[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}