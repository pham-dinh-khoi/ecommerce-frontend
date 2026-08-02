/**
 * src/store/hooks.ts
 *
 * Custom hooks for interacting with the Redux store.
 * By using these typed versions, we ensure that TypeScript correctly infers
 * the state structure and dispatch actions throughout the component tree.
 */

import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from 'react-redux';
import type { RootState, AppDispatch } from './index';

/**
 * useAppDispatch:
 * A typed wrapper around the default useDispatch hook.
 * By default, useDispatch does not know about the store's custom ThunkDispatch
 * or other middleware configurations. Using this hook ensures that dispatching
 * asynchronous actions (thunks) is fully type-safe.
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * useAppSelector:
 * A typed wrapper around the default useSelector hook.
 * By assigning 'TypedUseSelectorHook<RootState>', we ensure that every selector
 * function passed to this hook automatically knows the shape of the entire
 * state tree (RootState), eliminating the need to explicitly type
 * '(state: RootState)' in every component.
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
