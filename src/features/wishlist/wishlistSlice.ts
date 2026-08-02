import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wishlistService } from './wishlistService';
import type { WishlistItem } from '@/types/wishlist.types';
import { getErrorMessage } from '@/utils/errorHandler';

/**
 * Interface representing the Wishlist slice state.
 */
interface WishlistState {
  items: WishlistItem[];
  // Optimization: Keeping a flat array of IDs allows for O(1) or O(n) checking
  // in UI components (e.g., ProductCard) without needing to iterate through
  // the full 'items' array or perform expensive map lookups during render.
  productIds: string[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  productIds: [],
  status: 'idle',
  error: null,
};

// -----------------------------------------------------------------------------
// Async Thunks
// -----------------------------------------------------------------------------

/**
 * Fetches the user's full wishlist from the server.
 * Currently fetches a large batch (1-100) to ensure the local state is hydrated.
 */
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await wishlistService.getList(1, 100);
      return res.items;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

/**
 * Handles adding or removing a product from the wishlist via the API.
 * Returns the updated toggle status and the targeted product ID.
 */
export const toggleWishlistThunk = createAsyncThunk(
  'wishlist/toggle',
  async (productId: string, { rejectWithValue }) => {
    try {
      const res = await wishlistService.toggle(productId);
      return { productId, ...res.data };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// -----------------------------------------------------------------------------
// Slice Definition
// -----------------------------------------------------------------------------

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // Action to clear wishlist state (e.g., on user logout).
    resetWishlist: (state) => {
      state.items = [];
      state.productIds = [];
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // -- Fetch Wishlist Handlers --
      .addCase(fetchWishlist.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;

        // Sync the derived 'productIds' array based on the fetched items.
        // We filter out items missing a product reference to prevent runtime errors.
        state.productIds = action.payload
          .filter((i) => i.product)
          .map((i) => i.product!._id);
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // -- Toggle Wishlist Handlers --
      .addCase(toggleWishlistThunk.fulfilled, (state, action) => {
        const { productId, added } = action.payload;

        if (added) {
          // If the product was added, append ID to array if it doesn't already exist.
          if (!state.productIds.includes(productId)) {
            state.productIds.push(productId);
          }
        } else {
          // If removed, filter out the ID and remove the item from the local items list.
          state.productIds = state.productIds.filter((id) => id !== productId);
          state.items = state.items.filter((i) => i.product?._id !== productId);
        }
      });
  },
});

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export const { resetWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
