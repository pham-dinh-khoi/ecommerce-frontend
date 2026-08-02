import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from './orderService';
import { getErrorMessage } from '@/utils/errorHandler';

// Type Definitions
import type {
  Order,
  OrderStats,
  PlaceOrderPayload,
  UpdateOrderStatusPayload,
  CancelOrderPayload,
  UserOrderQueryParams,
  AdminOrderQueryParams,
} from '@/types/order.types';

// -----------------------------------------------------------------------------
// Interfaces
// -----------------------------------------------------------------------------

/**
 * PaginationState: Standardizes the pagination metadata object
 * shared across various list views (myOrders, adminList).
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
 * OrderState: Defines the structure of the Redux slice for Orders.
 * Separates user-specific views, admin views, and shared state (current order, stats).
 */
interface OrderState {
  myOrders: Order[];
  myPagination: PaginationState | null;
  myOrdersStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  current: Order | null;
  currentStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  adminList: Order[];
  adminPagination: PaginationState | null;
  adminListStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  stats: OrderStats | null;
  error: string | null;
}

// -----------------------------------------------------------------------------
// Initial State
// -----------------------------------------------------------------------------

const initialState: OrderState = {
  myOrders: [],
  myPagination: null,
  myOrdersStatus: 'idle',
  current: null,
  currentStatus: 'idle',
  adminList: [],
  adminPagination: null,
  adminListStatus: 'idle',
  stats: null,
  error: null,
};

// -----------------------------------------------------------------------------
// Async Thunks (API Side Effects)
// -----------------------------------------------------------------------------

export const placeOrderThunk = createAsyncThunk(
  'order/place',
  async (payload: PlaceOrderPayload, { rejectWithValue }) => {
    try {
      const res = await orderService.placeOrder(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  'order/fetchMy',
  async (params: UserOrderQueryParams, { rejectWithValue }) => {
    try {
      const res = await orderService.getMyOrders(params);
      return { orders: res.orders, pagination: res.pagination };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'order/fetchById',
  async (orderCode: string, { rejectWithValue }) => {
    try {
      const res = await orderService.getById(orderCode);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const cancelOrderThunk = createAsyncThunk(
  'order/cancel',
  async (
    { orderId, payload }: { orderId: string; payload: CancelOrderPayload },
    { rejectWithValue }
  ) => {
    try {
      const res = await orderService.cancel(orderId, payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchAdminOrders = createAsyncThunk(
  'order/fetchAdminList',
  async (params: AdminOrderQueryParams, { rejectWithValue }) => {
    try {
      const res = await orderService.adminGetList(params);
      return { orders: res.orders, pagination: res.pagination };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const adminUpdateOrderStatusThunk = createAsyncThunk(
  'order/adminUpdateStatus',
  async (
    {
      orderId,
      payload,
    }: { orderId: string; payload: UpdateOrderStatusPayload },
    { rejectWithValue }
  ) => {
    try {
      const res = await orderService.adminUpdateStatus(orderId, payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchOrderStats = createAsyncThunk(
  'order/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await orderService.adminGetStats();
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchAdminOrderById = createAsyncThunk(
  'order/fetchAdminById',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const res = await orderService.adminGetById(orderId);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// -----------------------------------------------------------------------------
// Slice Definition
// -----------------------------------------------------------------------------

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    // Synchronous action to reset current state when navigating away or closing a modal
    clearCurrentOrder: (state) => {
      state.current = null;
      state.currentStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // -- Fetch My Orders Lifecycle --
      .addCase(fetchMyOrders.pending, (state) => {
        state.myOrdersStatus = 'loading';
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.myOrdersStatus = 'succeeded';
        state.myOrders = action.payload.orders;
        state.myPagination = action.payload.pagination;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.myOrdersStatus = 'failed';
        state.error = action.payload as string;
      })

      // -- Fetch Single Order (User) Lifecycle --
      .addCase(fetchOrderById.pending, (state) => {
        state.currentStatus = 'loading';
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.currentStatus = 'succeeded';
        state.current = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.currentStatus = 'failed';
        state.error = action.payload as string;
      })

      // -- Cancel Order: Update state without full list re-fetch --
      .addCase(cancelOrderThunk.fulfilled, (state, action) => {
        state.current = action.payload;
        const idx = state.myOrders.findIndex(
          (o) => o._id === action.payload._id
        );
        if (idx !== -1) state.myOrders[idx] = action.payload;
      })

      // -- Admin Order List Lifecycle --
      .addCase(fetchAdminOrders.pending, (state) => {
        state.adminListStatus = 'loading';
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.adminListStatus = 'succeeded';
        state.adminList = action.payload.orders;
        state.adminPagination = action.payload.pagination;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.adminListStatus = 'failed';
        state.error = action.payload as string;
      })

      // -- Admin Update: Synchronize state with backend response --
      .addCase(adminUpdateOrderStatusThunk.fulfilled, (state, action) => {
        state.current = action.payload;
        const idx = state.adminList.findIndex(
          (o) => o._id === action.payload._id
        );
        if (idx !== -1) state.adminList[idx] = action.payload;
      })

      // -- Stats Lifecycle --
      .addCase(fetchOrderStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      // -- Admin Fetch Single Order Lifecycle --
      .addCase(fetchAdminOrderById.pending, (state) => {
        state.currentStatus = 'loading';
      })
      .addCase(fetchAdminOrderById.fulfilled, (state, action) => {
        state.currentStatus = 'succeeded';
        state.current = action.payload;
      })
      .addCase(fetchAdminOrderById.rejected, (state, action) => {
        state.currentStatus = 'failed';
        state.error = action.payload as string;
      });
  },
});

// Exports
export const { clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
