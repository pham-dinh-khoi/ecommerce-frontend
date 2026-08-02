import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from './authService';
import type {
  AuthState,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
} from '@/types/auth.types';
import { getErrorMessage } from '@/utils/errorHandler';
import { clearGuestId } from '@/lib/guestId';

// -----------------------------------------------------------------------------
// Initial State
// -----------------------------------------------------------------------------

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
};

// -----------------------------------------------------------------------------
// Async Thunks
// These handle asynchronous API interactions, leveraging the standard Redux
// Toolkit `createAsyncThunk` pattern.
// -----------------------------------------------------------------------------

/**
 * Handles user authentication.
 * On success, it updates the global state and clears the guest session.
 */
export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const res = await authService.login(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

/**
 * Handles user registration.
 */
export const registerThunk = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const res = await authService.register(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

/**
 * Internal method used by Axios interceptors to refresh expired access tokens.
 * Updates the token without resetting the user's session.
 */
export const refreshAccessTokenThunk = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authService.refreshToken();
      return res.data.accessToken;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

/**
 * Fetches the profile of the currently logged-in user.
 */
export const getMeThunk = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authService.getMe();
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

/**
 * Logs out the user.
 * This is a "fire-and-forget" operation; even if the server-side API call fails,
 * the local client session must be destroyed to ensure security.
 */
export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await authService.logout().catch(() => {});
});

/**
 * Password/Security operations.
 * These return message strings confirming the outcome of the requested action.
 */
export const changePasswordThunk = createAsyncThunk(
  'auth/changePassword',
  async (payload: ChangePasswordPayload, { rejectWithValue }) => {
    try {
      const res = await authService.changePassword(payload);
      return res.message;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const forgotPasswordThunk = createAsyncThunk(
  'auth/forgotPassword',
  async (payload: ForgotPasswordPayload, { rejectWithValue }) => {
    try {
      const res = await authService.forgotPassword(payload);
      return res.message;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const resetPasswordThunk = createAsyncThunk(
  'auth/resetPassword',
  async (payload: ResetPasswordPayload, { rejectWithValue }) => {
    try {
      const res = await authService.resetPassword(payload);
      return res.message;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const verifyEmailThunk = createAsyncThunk(
  'auth/verifyEmail',
  async (token: string, { rejectWithValue }) => {
    try {
      const res = await authService.verifyEmail(token);
      return res.message;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// -----------------------------------------------------------------------------
// Auth Slice
// -----------------------------------------------------------------------------

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Explicitly wipe auth state locally
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },
    // Manually update the access token (e.g., during social login or manual refresh)
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Login Lifecycle ---
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        clearGuestId(); // Merge logic: guest actions are now associated with the user
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // --- Token Management ---
      .addCase(refreshAccessTokenThunk.fulfilled, (state, action) => {
        state.accessToken = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(refreshAccessTokenThunk.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      })

      // --- Profile Management ---
      .addCase(getMeThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })

      // --- Logout Handling ---
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, setAccessToken } = authSlice.actions;
export default authSlice.reducer;
