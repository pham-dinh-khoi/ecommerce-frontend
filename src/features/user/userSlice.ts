import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from './userService';
import type {
  UserProfile,
  Address,
  UpdateProfilePayload,
  AddressPayload,
  UpdateAddressPayload,
  AdminUpdateUserPayload,
  AdminUserQueryParams,
} from '@/types/user.types';
import { getErrorMessage } from '@/utils/errorHandler';

// -----------------------------------------------------------------------------
// Interfaces
// -----------------------------------------------------------------------------

interface AdminUserListPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface UserState {
  // Current user's profile information
  profile: UserProfile | null;
  profileStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  // Admin-specific data
  adminList: UserProfile[];
  adminPagination: AdminUserListPagination | null;
  adminListStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  error: string | null;
}

const initialState: UserState = {
  profile: null,
  profileStatus: 'idle',
  adminList: [],
  adminPagination: null,
  adminListStatus: 'idle',
  error: null,
};

// -----------------------------------------------------------------------------
// Async Thunks: Profile & Avatar Management
// -----------------------------------------------------------------------------

export const fetchProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await userService.getProfile();
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateProfileThunk = createAsyncThunk(
  'user/updateProfile',
  async (payload: UpdateProfilePayload, { rejectWithValue }) => {
    try {
      const res = await userService.updateProfile(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateAvatarThunk = createAsyncThunk(
  'user/updateAvatar',
  async (file: File, { rejectWithValue }) => {
    try {
      const res = await userService.updateAvatar(file);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteAvatarThunk = createAsyncThunk(
  'user/deleteAvatar',
  async (_, { rejectWithValue }) => {
    try {
      const res = await userService.deleteAvatar();
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// -----------------------------------------------------------------------------
// Async Thunks: Address Management
// -----------------------------------------------------------------------------

export const addAddressThunk = createAsyncThunk(
  'user/addAddress',
  async (payload: AddressPayload, { rejectWithValue }) => {
    try {
      const res = await userService.addAddress(payload);
      return res.data; // Expected return: Updated full array of user addresses
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateAddressThunk = createAsyncThunk(
  'user/updateAddress',
  async (
    {
      addressId,
      payload,
    }: { addressId: string; payload: UpdateAddressPayload },
    { rejectWithValue }
  ) => {
    try {
      const res = await userService.updateAddress(addressId, payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteAddressThunk = createAsyncThunk(
  'user/deleteAddress',
  async (addressId: string, { rejectWithValue }) => {
    try {
      const res = await userService.deleteAddress(addressId);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const setDefaultAddressThunk = createAsyncThunk(
  'user/setDefaultAddress',
  async (addressId: string, { rejectWithValue }) => {
    try {
      const res = await userService.setDefaultAddress(addressId);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// -----------------------------------------------------------------------------
// Async Thunks: Admin Actions
// -----------------------------------------------------------------------------

export const fetchAdminUsers = createAsyncThunk(
  'user/fetchAdminUsers',
  async (params: AdminUserQueryParams, { rejectWithValue }) => {
    try {
      const res = await userService.adminGetUsers(params);
      return { users: res.users, pagination: res.pagination };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const adminUpdateUserThunk = createAsyncThunk(
  'user/adminUpdateUser',
  async (
    { id, payload }: { id: string; payload: AdminUpdateUserPayload },
    { rejectWithValue }
  ) => {
    try {
      const res = await userService.adminUpdateUser(id, payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const adminDeleteUserThunk = createAsyncThunk(
  'user/adminDeleteUser',
  async (id: string, { rejectWithValue }) => {
    try {
      await userService.adminDeleteUser(id);
      return id; // Return ID to facilitate removal from the local list
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// -----------------------------------------------------------------------------
// Slice Definition
// -----------------------------------------------------------------------------

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    /**
     * Manually updates the user address list in the state.
     */
    setProfileAddresses: (state, action: { payload: Address[] }) => {
      if (state.profile) state.profile.addresses = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // -- Profile Management --
      .addCase(fetchProfile.pending, (state) => {
        state.profileStatus = 'loading';
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.profileStatus = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.profileStatus = 'failed';
        state.error = action.payload as string;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(updateAvatarThunk.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(deleteAvatarThunk.fulfilled, (state, action) => {
        state.profile = action.payload;
      })

      // -- Address Management (Syncing addresses array) --
      .addCase(addAddressThunk.fulfilled, (state, action) => {
        if (state.profile) state.profile.addresses = action.payload;
      })
      .addCase(updateAddressThunk.fulfilled, (state, action) => {
        if (state.profile) state.profile.addresses = action.payload;
      })
      .addCase(deleteAddressThunk.fulfilled, (state, action) => {
        if (state.profile) state.profile.addresses = action.payload;
      })
      .addCase(setDefaultAddressThunk.fulfilled, (state, action) => {
        if (state.profile) state.profile.addresses = action.payload;
      })

      // -- Admin: User Management --
      .addCase(fetchAdminUsers.pending, (state) => {
        state.adminListStatus = 'loading';
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.adminListStatus = 'succeeded';
        state.adminList = action.payload.users;
        state.adminPagination = action.payload.pagination;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.adminListStatus = 'failed';
        state.error = action.payload as string;
      })
      .addCase(adminUpdateUserThunk.fulfilled, (state, action) => {
        const index = state.adminList.findIndex(
          (u) => u._id === action.payload._id
        );
        if (index !== -1) state.adminList[index] = action.payload;
      })
      .addCase(adminDeleteUserThunk.fulfilled, (state, action) => {
        state.adminList = state.adminList.filter(
          (u) => u._id !== action.payload
        );
      });
  },
});

export const { setProfileAddresses } = userSlice.actions;
export default userSlice.reducer;
