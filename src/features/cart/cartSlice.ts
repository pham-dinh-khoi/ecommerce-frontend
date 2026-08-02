/**
 * src/features/cart/cartSlice.ts
 *
 * This slice manages the shopping cart state. It handles asynchronous data fetching
 * via Thunks and maintains a synchronized state between the client and the server.
 */

// --- Imports ---
// External Libraries
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Local Services
import { cartService } from './cartService';

// Types
import type {
  CartResult,
  AddToCartPayload,
  UpdateCartItemPayload,
} from '@/types/cart.types';

// Utilities
import { getErrorMessage } from '@/utils/errorHandler';

// --- State Definition ---
interface CartState {
  cart: CartResult | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  status: 'idle',
  error: null,
};

// --- Async Thunks (Side Effects) ---
// These manage the API lifecycle, handling loading, success, and error states.

/**
 * Fetches the complete cart object from the server.
 */
export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await cartService.getCart();
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

/**
 * Sends a POST request to add an item to the cart.
 */
export const addToCartThunk = createAsyncThunk(
  'cart/addItem',
  async (payload: AddToCartPayload, { rejectWithValue }) => {
    try {
      const res = await cartService.addItem(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

/**
 * Sends a PATCH request to update item quantity/details.
 */
export const updateCartItemThunk = createAsyncThunk(
  'cart/updateItem',
  async (
    {
      variantId,
      payload,
    }: { variantId: string; payload: UpdateCartItemPayload },
    { rejectWithValue }
  ) => {
    try {
      const res = await cartService.updateItem(variantId, payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

/**
 * Sends a DELETE request to remove an item from the cart.
 */
export const removeCartItemThunk = createAsyncThunk(
  'cart/removeItem',
  async (variantId: string, { rejectWithValue }) => {
    try {
      const res = await cartService.removeItem(variantId);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

/**
 * Sends a DELETE request to clear the entire cart on the server.
 */
export const clearCartThunk = createAsyncThunk(
  'cart/clear',
  async (_, { rejectWithValue }) => {
    try {
      await cartService.clearCart();
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// --- Slice Definition ---
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /**
     * Synchronously resets the local cart state without an API call.
     * Useful for logout scenarios or guest-to-user cart transitions.
     */
    clearCartLocal: (state) => {
      state.cart = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetching Logic
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Updates Logic: Sync local state with server response immediately after action
      .addCase(addToCartThunk.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(updateCartItemThunk.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(removeCartItemThunk.fulfilled, (state, action) => {
        state.cart = action.payload;
      })

      // Clearing Logic: Resets local object to empty structure upon successful server response
      .addCase(clearCartThunk.fulfilled, (state) => {
        state.cart = {
          items: [],
          totalItems: 0,
          totalAmount: 0,
          updatedAt: new Date().toISOString(),
        };
      });
  },
});

export const { clearCartLocal } = cartSlice.actions;
export default cartSlice.reducer;
