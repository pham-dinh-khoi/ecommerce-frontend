import axiosInstance from '@/services/axiosInstance';
import { USER_ENDPOINTS } from '@/constants/apiEndpoints';
import type { ApiResponse } from '@/types/api.types';
import type {
  UserProfile,
  Address,
  UpdateProfilePayload,
  AddressPayload,
  UpdateAddressPayload,
  AdminUpdateUserPayload,
  AdminUserQueryParams,
  AdminUserListResponse,
} from '@/types/user.types';

/**
 * userService
 *
 * Centralized service layer for all User and Admin-related API operations.
 * This architecture keeps components clean by abstracting API endpoint logic
 * and request configuration (like FormData headers) away from the view layer.
 */
export const userService = {
  // ---------------------------------------------------------------------------
  // Profile Management
  // ---------------------------------------------------------------------------

  /** Fetches current user profile data. */
  getProfile: () =>
    axiosInstance
      .get<ApiResponse<UserProfile>>(USER_ENDPOINTS.PROFILE)
      .then((res) => res.data),

  /** Updates user profile information (name, bio, etc.). */
  updateProfile: (payload: UpdateProfilePayload) =>
    axiosInstance
      .patch<ApiResponse<UserProfile>>(USER_ENDPOINTS.UPDATE_PROFILE, payload)
      .then((res) => res.data),

  /**
   * Updates the user's avatar.
   * Note: Uses FormData to handle file binary streams and sets correct multipart headers.
   */
  updateAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return axiosInstance
      .patch<ApiResponse<UserProfile>>(USER_ENDPOINTS.UPDATE_AVATAR, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  },

  /** Removes the current user's avatar. */
  deleteAvatar: () =>
    axiosInstance
      .delete<ApiResponse<UserProfile>>(USER_ENDPOINTS.DELETE_AVATAR)
      .then((res) => res.data),

  // ---------------------------------------------------------------------------
  // Address Management
  // ---------------------------------------------------------------------------

  /** Retrieves all saved addresses for the user. */
  getAddresses: () =>
    axiosInstance
      .get<ApiResponse<Address[]>>(USER_ENDPOINTS.ADDRESSES)
      .then((res) => res.data),

  /** Adds a new address to the user's profile. */
  addAddress: (payload: AddressPayload) =>
    axiosInstance
      .post<ApiResponse<Address[]>>(USER_ENDPOINTS.ADD_ADDRESS, payload)
      .then((res) => res.data),

  /** Updates an existing address by its unique ID. */
  updateAddress: (addressId: string, payload: UpdateAddressPayload) =>
    axiosInstance
      .patch<ApiResponse<Address[]>>(
        USER_ENDPOINTS.UPDATE_ADDRESS(addressId),
        payload
      )
      .then((res) => res.data),

  /** Deletes an address by its unique ID. */
  deleteAddress: (addressId: string) =>
    axiosInstance
      .delete<ApiResponse<Address[]>>(USER_ENDPOINTS.DELETE_ADDRESS(addressId))
      .then((res) => res.data),

  /** Sets a specific address as the primary delivery location. */
  setDefaultAddress: (addressId: string) =>
    axiosInstance
      .patch<ApiResponse<Address[]>>(
        USER_ENDPOINTS.SET_DEFAULT_ADDRESS(addressId)
      )
      .then((res) => res.data),

  // ---------------------------------------------------------------------------
  // Admin Management
  // ---------------------------------------------------------------------------

  /** Admin: Retrieves a paginated list of users based on query parameters. */
  adminGetUsers: (params: AdminUserQueryParams) =>
    axiosInstance
      .get<AdminUserListResponse>(USER_ENDPOINTS.ADMIN_LIST, { params })
      .then((res) => res.data),

  /** Admin: Fetches details of a specific user by their ID. */
  adminGetUserById: (id: string) =>
    axiosInstance
      .get<ApiResponse<UserProfile>>(USER_ENDPOINTS.ADMIN_DETAIL(id))
      .then((res) => res.data),

  /** Admin: Updates a specific user's account details. */
  adminUpdateUser: (id: string, payload: AdminUpdateUserPayload) =>
    axiosInstance
      .patch<ApiResponse<UserProfile>>(USER_ENDPOINTS.ADMIN_UPDATE(id), payload)
      .then((res) => res.data),

  /** Admin: Deletes a user account from the system. */
  adminDeleteUser: (id: string) =>
    axiosInstance
      .delete<ApiResponse<null>>(USER_ENDPOINTS.ADMIN_DELETE(id))
      .then((res) => res.data),
};
