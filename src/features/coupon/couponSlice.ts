import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { couponService } from './couponService';
import { getErrorMessage } from '@/utils/errorHandler';
import type {
  Coupon,
  CouponPreviewResponse,
  CreateCouponPayload,
  UpdateCouponPayload,
  CouponQueryParams,
} from '@/types/coupon.types';

// --- State Definition ---

interface CouponState {
  // Public-facing state (Cart/Checkout)
  appliedCoupon: CouponPreviewResponse | null;
  previewStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  // Admin-facing state (Management)
  adminList: Coupon[];
  adminPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  adminListStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  error: string | null;
}

const initialState: CouponState = {
  appliedCoupon: null,
  previewStatus: 'idle',
  adminList: [],
  adminPagination: null,
  adminListStatus: 'idle',
  error: null,
};

// --- Async Thunks ---

/**
 * Validates and previews a coupon code for use in the cart.
 */
export const previewCouponThunk = createAsyncThunk(
  'coupon/preview',
  async (code: string, { rejectWithValue }) => {
    try {
      const res = await couponService.preview(code);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

/**
 * Fetches a paginated list of coupons for the admin dashboard.
 */
export const fetchAdminCoupons = createAsyncThunk(
  'coupon/fetchAdminList',
  async (params: CouponQueryParams, { rejectWithValue }) => {
    try {
      const res = await couponService.adminGetList(params);
      return { coupons: res.coupons, pagination: res.pagination };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

/**
 * Creates a new coupon in the system.
 */
export const createCouponThunk = createAsyncThunk(
  'coupon/create',
  async (payload: CreateCouponPayload, { rejectWithValue }) => {
    try {
      const res = await couponService.adminCreate(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

/**
 * Updates an existing coupon by ID.
 */
export const updateCouponThunk = createAsyncThunk(
  'coupon/update',
  async (
    { id, payload }: { id: string; payload: UpdateCouponPayload },
    { rejectWithValue }
  ) => {
    try {
      const res = await couponService.adminUpdate(id, payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

/**
 * Deletes a coupon from the system.
 */
export const deleteCouponThunk = createAsyncThunk(
  'coupon/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await couponService.adminDelete(id);
      return id; // Return ID for filtering from state
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// --- Slice Definition ---

const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    /**
     * Resets the applied coupon state when the user removes it or empties the cart.
     */
    clearAppliedCoupon: (state) => {
      state.appliedCoupon = null;
      state.previewStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // Preview Coupon Lifecycle
      .addCase(previewCouponThunk.pending, (state) => {
        state.previewStatus = 'loading';
      })
      .addCase(previewCouponThunk.fulfilled, (state, action) => {
        state.previewStatus = 'succeeded';
        state.appliedCoupon = action.payload;
      })
      .addCase(previewCouponThunk.rejected, (state, action) => {
        state.previewStatus = 'failed';
        state.appliedCoupon = null;
        state.error = action.payload as string;
      })

      // Admin List Lifecycle
      .addCase(fetchAdminCoupons.pending, (state) => {
        state.adminListStatus = 'loading';
      })
      .addCase(fetchAdminCoupons.fulfilled, (state, action) => {
        state.adminListStatus = 'succeeded';
        state.adminList = action.payload.coupons;
        state.adminPagination = action.payload.pagination;
      })
      .addCase(fetchAdminCoupons.rejected, (state, action) => {
        state.adminListStatus = 'failed';
        state.error = action.payload as string;
      })

      // Admin Mutation Handlers
      .addCase(deleteCouponThunk.fulfilled, (state, action) => {
        // Optimistically remove the deleted coupon from the list
        state.adminList = state.adminList.filter(
          (c) => c._id !== action.payload
        );
      });
  },
});

export const { clearAppliedCoupon } = couponSlice.actions;
export default couponSlice.reducer;
