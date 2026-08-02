import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewService } from './reviewService';
import type {
  Review,
  RatingSummary,
  CreateReviewPayload,
  ModerateReviewPayload,
  ReplyReviewPayload,
  ReviewQueryParams,
  AdminReviewQueryParams,
} from '@/types/review.types';
import { getErrorMessage } from '@/utils/errorHandler';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Interface representing standard pagination metadata returned from the API.
 */
interface PaginationState {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Interface representing the complete Review slice state in Redux store.
 * Standardized status pattern ("idle" | "loading" | "succeeded" | "failed")
 * is used to track asynchronous API request states for both customer and admin domains.
 */
interface ReviewState {
  // Public / Customer Product Review State
  productReviews: Review[];
  summary: RatingSummary | null;
  productPagination: PaginationState | null;
  productReviewsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  // Admin Review Management State
  adminList: Review[];
  adminPagination: PaginationState | null;
  adminListStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  // Global Slice Error State
  error: string | null;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

/**
 * Initial state configuration for the review feature slice.
 */
const initialState: ReviewState = {
  productReviews: [],
  summary: null,
  productPagination: null,
  productReviewsStatus: 'idle',

  adminList: [],
  adminPagination: null,
  adminListStatus: 'idle',

  error: null,
};

// ============================================================================
// ASYNCHRONOUS THUNKS (API Interactions)
// ============================================================================

/**
 * @asyncThunk createReviewThunk
 * @description Submits a new product review from a customer.
 * @param payload - The payload containing review data (rating, comment, images, etc.)
 */
export const createReviewThunk = createAsyncThunk(
  'review/create',
  async (payload: CreateReviewPayload, { rejectWithValue }) => {
    try {
      const res = await reviewService.create(payload);
      return res.data;
    } catch (err) {
      // Extracts standardized error message safely from unknown error object
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

/**
 * @asyncThunk fetchProductReviews
 * @description Fetches paginated reviews and summary statistics for a specific product.
 * @param productId - ID of the target product
 * @param params - Query options (page, limit, sort, filter)
 */
export const fetchProductReviews = createAsyncThunk(
  'review/fetchByProduct',
  async (
    { productId, params }: { productId: string; params: ReviewQueryParams },
    { rejectWithValue }
  ) => {
    try {
      const res = await reviewService.getProductReviews(productId, params);
      return {
        reviews: res.reviews,
        pagination: res.pagination,
        summary: res.summary,
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

/**
 * @asyncThunk voteHelpfulThunk
 * @description Casts or toggles a helpful/unhelpful vote on a target review.
 * @param reviewId - Target review unique identifier
 * @param isHelpful - Boolean indicating if the vote is positive (true) or negative (false)
 */
export const voteHelpfulThunk = createAsyncThunk(
  'review/voteHelpful',
  async (
    { reviewId, isHelpful }: { reviewId: string; isHelpful: boolean },
    { rejectWithValue }
  ) => {
    try {
      const res = await reviewService.voteHelpful(reviewId, isHelpful);
      // Spreads returned count stats along with reviewId for targeted state updates
      return { reviewId, ...res.data };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

/**
 * @asyncThunk deleteReviewThunk
 * @description Deletes a review by its ID (User self-delete or Admin hard delete).
 * @param id - Target review identifier to delete
 */
export const deleteReviewThunk = createAsyncThunk(
  'review/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await reviewService.delete(id);
      return id; // Returns the deleted ID to purge it locally from state
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

/**
 * @asyncThunk fetchAdminReviews
 * @description Fetches all reviews across the platform with filtering for admin management.
 * @param params - Search, status filter, sorting, and pagination parameters
 */
export const fetchAdminReviews = createAsyncThunk(
  'review/fetchAdminList',
  async (params: AdminReviewQueryParams, { rejectWithValue }) => {
    try {
      const res = await reviewService.adminGetList(params);
      return { reviews: res.reviews, pagination: res.pagination };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

/**
 * @asyncThunk moderateReviewThunk
 * @description Updates moderation status of a review (e.g., APPROVED, REJECTED, HIDDEN).
 * @param id - Target review ID
 * @param payload - Status and optional rejection rationale
 */
export const moderateReviewThunk = createAsyncThunk(
  'review/moderate',
  async (
    { id, payload }: { id: string; payload: ModerateReviewPayload },
    { rejectWithValue }
  ) => {
    try {
      const res = await reviewService.adminModerate(id, payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

/**
 * @asyncThunk replyReviewThunk
 * @description Allows seller or admin to respond/reply to a specific review.
 * @param id - Target review ID
 * @param payload - Reply text content
 */
export const replyReviewThunk = createAsyncThunk(
  'review/reply',
  async (
    { id, payload }: { id: string; payload: ReplyReviewPayload },
    { rejectWithValue }
  ) => {
    try {
      const res = await reviewService.reply(id, payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// ============================================================================
// REDUX SLICE DEFINITION
// ============================================================================

const reviewSlice = createSlice({
  name: 'review',
  initialState,

  // Synchronous State Mutations (Reducers)
  reducers: {
    /**
     * Resets public product review state (useful when unmounting product detail components).
     */
    clearProductReviews: (state) => {
      state.productReviews = [];
      state.summary = null;
      state.productReviewsStatus = 'idle';
    },
  },

  // Asynchronous Lifecycle Reducers (Extra Reducers handling createAsyncThunk actions)
  extraReducers: (builder) => {
    builder
      // ----------------------------------------------------------------------
      // FETCH PRODUCT REVIEWS LIFECYCLE
      // ----------------------------------------------------------------------
      .addCase(fetchProductReviews.pending, (state) => {
        state.productReviewsStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.productReviewsStatus = 'succeeded';
        state.productReviews = action.payload.reviews;
        state.productPagination = action.payload.pagination;
        state.summary = action.payload.summary;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.productReviewsStatus = 'failed';
        state.error = action.payload as string;
      })

      // ----------------------------------------------------------------------
      // VOTE HELPFUL / UNHELPFUL LIFECYCLE
      // ----------------------------------------------------------------------
      .addCase(voteHelpfulThunk.fulfilled, (state, action) => {
        // Direct mutation using Immer: Locate and update vote counters inline
        const review = state.productReviews.find(
          (r) => r._id === action.payload.reviewId
        );
        if (review) {
          review.helpfulCount = action.payload.helpfulCount;
          review.notHelpfulCount = action.payload.notHelpfulCount;
        }
      })

      // ----------------------------------------------------------------------
      // DELETE REVIEW LIFECYCLE
      // ----------------------------------------------------------------------
      .addCase(deleteReviewThunk.fulfilled, (state, action) => {
        // Removes the deleted review directly from the active product review array
        state.productReviews = state.productReviews.filter(
          (r) => r._id !== action.payload
        );
      })

      // ----------------------------------------------------------------------
      // FETCH ADMIN REVIEWS LIFECYCLE
      // ----------------------------------------------------------------------
      .addCase(fetchAdminReviews.pending, (state) => {
        state.adminListStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchAdminReviews.fulfilled, (state, action) => {
        state.adminListStatus = 'succeeded';
        state.adminList = action.payload.reviews;
        state.adminPagination = action.payload.pagination;
      })
      .addCase(fetchAdminReviews.rejected, (state, action) => {
        state.adminListStatus = 'failed';
        state.error = action.payload as string;
      })

      // ----------------------------------------------------------------------
      // ADMIN MODERATE REVIEW LIFECYCLE
      // ----------------------------------------------------------------------
      .addCase(moderateReviewThunk.fulfilled, (state, action) => {
        // Mutate existing review in the admin list with updated moderation status
        const idx = state.adminList.findIndex(
          (r) => r._id === action.payload._id
        );
        if (idx !== -1) {
          state.adminList[idx] = action.payload;
        }
      })

      // ----------------------------------------------------------------------
      // ADMIN REPLY TO REVIEW LIFECYCLE
      // ----------------------------------------------------------------------
      .addCase(replyReviewThunk.fulfilled, (state, action) => {
        // Mutate existing review in the admin list with attached official reply
        const idx = state.adminList.findIndex(
          (r) => r._id === action.payload._id
        );
        if (idx !== -1) {
          state.adminList[idx] = action.payload;
        }
      });
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export const { clearProductReviews } = reviewSlice.actions;
export default reviewSlice.reducer;
