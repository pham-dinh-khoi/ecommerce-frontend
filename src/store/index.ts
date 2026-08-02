/**
 * src/store/index.ts
 * 
 * Central Redux store configuration.
 * Uses Redux Toolkit for state management and Redux Persist for state hydration.
 */

// --- External Dependencies ---
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

// --- Local Slices ---
import authReducer from '@/features/auth/authSlice';
import categoryReducer from '@/features/category/categorySlice';
import productReducer from '@/features/product/productSlice';
import userReducer from '@/features/user/userSlice';
import cartReducer from '@/features/cart/cartSlice';
import wishlistReducer from '@/features/wishlist/wishlistSlice';
import couponReducer from '@/features/coupon/couponSlice';
import orderReducer from '@/features/order/orderSlice';
import reviewReducer from '@/features/review/reviewSlice';

// --- Storage Configuration ---

/**
 * Custom Storage Adapter:
 * While Redux Persist works with window.localStorage by default, wrapping it 
 * in a Promise-based interface ensures better compatibility between the ESM 
 * module system used by Vite and the CJS nature of older libraries, preventing 
 * potential interop issues.
 */
const storage = {
  getItem: (key: string): Promise<string | null> =>
    Promise.resolve(localStorage.getItem(key)),
  setItem: (key: string, value: string): Promise<void> => {
    localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string): Promise<void> => {
    localStorage.removeItem(key);
    return Promise.resolve();
  },
};

// --- Reducer Composition ---

/**
 * Combine all feature reducers into a single root reducer.
 */
const rootReducer = combineReducers({
  auth: authReducer,
  category: categoryReducer,
  product: productReducer,
  user: userReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  coupon: couponReducer,
  order: orderReducer,
  review: reviewReducer,
});

/**
 * Persistence Configuration:
 * - 'key': The storage key used in localStorage.
 * - 'storage': Our custom storage adapter.
 * - 'blacklist': Slices that should not be persisted (e.g., to prevent sensitive 
 *   data storage or to force fresh fetching on application load).
 */
const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['auth', 'category'], 
};

// Wrap the root reducer with Redux Persist logic
const persistedReducer = persistReducer(persistConfig, rootReducer);

// --- Store Initialization ---

export const store = configureStore({
  reducer: persistedReducer,
  /**
   * Middleware Configuration:
   * We must disable the serializableCheck for Redux Persist specific actions.
   * Redux Persist dispatches internal actions (like REHYDRATE) that contain 
   * non-serializable data, which would otherwise trigger a development-time warning.
   */
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// --- Exports & Typing ---

/**
 * persistor: Used by the PersistGate component in the app entry point
 * to delay rendering until the state has been rehydrated.
 */
export const persistor = persistStore(store);

// Infer RootState and AppDispatch types for full TypeScript support throughout the app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;