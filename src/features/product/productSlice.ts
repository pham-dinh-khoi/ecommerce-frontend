import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from './productService';
import { getErrorMessage } from '@/utils/errorHandler';

// Type Imports
import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  CreateVariantPayload,
  UpdateVariantPayload,
  ProductQueryParams,
  ProductListItem,
  PaginationResult,
} from '@/types/product.types';

/**
 * ProductState
 * Manages the state for products in the global store.
 * We separate 'list' (used for tables/grids) from 'current' (used for detail pages/wizards)
 * to prevent unnecessary re-renders and simplify state updates.
 */
interface ProductState {
  list: ProductListItem[];
  pagination: PaginationResult | null;
  listStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  current: Product | null;
  currentStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProductState = {
  list: [],
  pagination: null,
  listStatus: 'idle',
  current: null,
  currentStatus: 'idle',
  error: null,
};

// ============================================================================
// 1. ASYNC THUNKS
// Handles side effects (API calls). We use 'rejectWithValue' to pass
// serialized error messages back to the components.
// ============================================================================

export const fetchProducts = createAsyncThunk(
  'product/fetchList',
  async (params: ProductQueryParams, { rejectWithValue }) => {
    try {
      const res = await productService.getProducts(params);
      return { products: res.products, pagination: res.pagination };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'product/fetchById',
  async (idOrSlug: string, { rejectWithValue }) => {
    try {
      const res = await productService.getById(idOrSlug);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const createProductThunk = createAsyncThunk(
  'product/create',
  async (payload: CreateProductPayload, { rejectWithValue }) => {
    try {
      const res = await productService.create(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateProductThunk = createAsyncThunk(
  'product/update',
  async (
    { id, payload }: { id: string; payload: UpdateProductPayload },
    { rejectWithValue }
  ) => {
    try {
      const res = await productService.update(id, payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteProductThunk = createAsyncThunk(
  'product/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await productService.delete(id);
      return id; // Return ID to filter state locally
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const permanentlyDeleteProductThunk = createAsyncThunk(
  'product/permanentlyDelete',
  async (id: string, { rejectWithValue }) => {
    try {
      await productService.permanentlyDelete(id);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// --- Variant & Image Management Thunks ---
// These return the full product object, allowing us to update `state.current`
// and keep the UI in sync after partial updates.

export const addVariantThunk = createAsyncThunk(
  'product/addVariant',
  async (
    {
      productId,
      payload,
    }: { productId: string; payload: CreateVariantPayload },
    { rejectWithValue }
  ) => {
    try {
      const res = await productService.addVariant(productId, payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateVariantThunk = createAsyncThunk(
  'product/updateVariant',
  async (
    {
      productId,
      variantId,
      payload,
    }: { productId: string; variantId: string; payload: UpdateVariantPayload },
    { rejectWithValue }
  ) => {
    try {
      const res = await productService.updateVariant(
        productId,
        variantId,
        payload
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteVariantThunk = createAsyncThunk(
  'product/deleteVariant',
  async (
    { productId, variantId }: { productId: string; variantId: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await productService.deleteVariant(productId, variantId);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const addProductImagesThunk = createAsyncThunk(
  'product/addImages',
  async (
    { productId, imageFiles }: { productId: string; imageFiles: File[] },
    { rejectWithValue }
  ) => {
    try {
      const res = await productService.addImages(productId, imageFiles);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteProductImageThunk = createAsyncThunk(
  'product/deleteImage',
  async (
    { productId, publicId }: { productId: string; publicId: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await productService.deleteImage(productId, publicId);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const setPrimaryImageThunk = createAsyncThunk(
  'product/setPrimaryImage',
  async (
    { productId, publicId }: { productId: string; publicId: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await productService.setPrimaryImage(productId, publicId);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// ============================================================================
// 2. REDUX SLICE
// ============================================================================
const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    /**
     * Cleanup action to reset the 'current' product state.
     * Essential when unmounting a form or navigating away from the edit page.
     */
    clearCurrentProduct: (state) => {
      state.current = null;
      state.currentStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch List Lifecycle
      .addCase(fetchProducts.pending, (state) => {
        state.listStatus = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.listStatus = 'succeeded';
        state.list = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.error = action.payload as string;
      })

      // Fetch Single Product Lifecycle
      .addCase(fetchProductById.pending, (state) => {
        state.currentStatus = 'loading';
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.currentStatus = 'succeeded';
        state.current = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.currentStatus = 'failed';
        state.error = action.payload as string;
      })

      // Updates: Sync state.current immediately to reflect UI changes (Optimistic-like behavior)
      .addCase(createProductThunk.fulfilled, (state, action) => {
        state.current = action.payload;
        state.currentStatus = 'succeeded';
      })
      .addCase(updateProductThunk.fulfilled, (state, action) => {
        state.current = action.payload;
      })

      // Deletions: Update list by filtering out the removed ID
      .addCase(deleteProductThunk.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p._id !== action.payload);
      })
      .addCase(permanentlyDeleteProductThunk.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p._id !== action.payload);
      })

      // Nested Entity Updates: Automatically refresh `current` product data
      .addCase(addVariantThunk.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(updateVariantThunk.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(deleteVariantThunk.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(addProductImagesThunk.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(deleteProductImageThunk.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(setPrimaryImageThunk.fulfilled, (state, action) => {
        state.current = action.payload;
      });
  },
});

export const { clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
