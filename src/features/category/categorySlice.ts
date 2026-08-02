// =============================================================================
// Imports
// =============================================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoryService } from './categoryService';
import { getErrorMessage } from '@/utils/errorHandler';

// Types
import type { RootState } from '@/store';
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@/types/category.types';

// =============================================================================
// State Definitions
// =============================================================================

interface CategoryState {
  tree: Category[];
  flatList: Category[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  flatListStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CategoryState = {
  tree: [],
  flatList: [],
  status: 'idle',
  flatListStatus: 'idle',
  error: null,
};

// =============================================================================
// Async Thunks (API Middleware)
// =============================================================================

/**
 * Fetches the hierarchical category tree.
 * Uses a condition check to prevent redundant API calls if data is already loaded.
 */
export const fetchCategoryTree = createAsyncThunk(
  'category/fetchTree',
  async (_, { rejectWithValue }) => {
    try {
      const res = await categoryService.getTree();
      return res.data;
    } catch (err) {
      // Passes the formatted error message to the rejected action
      return rejectWithValue(getErrorMessage(err));
    }
  },
  {
    condition: (_, { getState }) => {
      const { category } = getState() as RootState;
      // Prevent execution if already loading or if data is successfully cached
      return !(
        category.status === 'loading' || category.status === 'succeeded'
      );
    },
  }
);

/**
 * Fetches a flat list of categories.
 * Note: 'true' is passed to include inactive categories, usually required for Admin dashboards.
 */
export const fetchAllCategoriesFlat = createAsyncThunk(
  'category/fetchAllFlat',
  async (_, { rejectWithValue }) => {
    try {
      const res = await categoryService.getAll(true);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const createCategoryThunk = createAsyncThunk(
  'category/create',
  async (payload: CreateCategoryPayload, { rejectWithValue }) => {
    try {
      const res = await categoryService.create(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateCategoryThunk = createAsyncThunk(
  'category/update',
  async (
    { id, payload }: { id: string; payload: UpdateCategoryPayload },
    { rejectWithValue }
  ) => {
    try {
      const res = await categoryService.update(id, payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteCategoryThunk = createAsyncThunk(
  'category/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await categoryService.delete(id);
      return id; // Return ID to filter from the state locally
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// =============================================================================
// Slice Definition
// =============================================================================

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    /**
     * Forces the status to 'idle', triggering a re-fetch on the next attempt.
     */
    invalidateTree: (state) => {
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Tree Cases ---
      .addCase(fetchCategoryTree.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategoryTree.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tree = action.payload;
      })
      .addCase(fetchCategoryTree.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // --- Fetch Flat List Cases ---
      .addCase(fetchAllCategoriesFlat.pending, (state) => {
        state.flatListStatus = 'loading';
      })
      .addCase(fetchAllCategoriesFlat.fulfilled, (state, action) => {
        state.flatListStatus = 'succeeded';
        state.flatList = action.payload;
      })
      .addCase(fetchAllCategoriesFlat.rejected, (state, action) => {
        state.flatListStatus = 'failed';
        state.error = action.payload as string;
      })
      // --- Delete Case ---
      .addCase(deleteCategoryThunk.fulfilled, (state, action) => {
        // Optimistic UI update: remove the deleted category from local state
        state.flatList = state.flatList.filter((c) => c._id !== action.payload);
      });
  },
});

export const { invalidateTree } = categorySlice.actions;
export default categorySlice.reducer;
