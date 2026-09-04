import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { bootstrapAuthThunk } from './features/auth/authSlice';
import AppRoutes from '@/routes/AppRoute';
import { Toaster } from '@/components/ui/sonner';
import { setNavigate } from '@/lib/navigation';
import { useNavigate } from 'react-router-dom';
import { getOrCreateGuestId, clearGuestId } from './lib/guestId';
import { fetchWishlist } from './features/wishlist/wishlistSlice';

function App() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { bootstrapStatus, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  // Ref to prevent double-invocation of useEffect in React 18+ StrictMode
  const hasInitializeRef = useRef(false);

  // Inject the React Router 'navigate' function into the global navigation bridge
  // This allows axios interceptors (outside React tree) to trigger navigation
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  // Ensure a Guest ID exists immediately so anonymous visitors (cart, wishlist
  // actions) are covered before the auth bootstrap below has resolved.
  useEffect(() => {
    getOrCreateGuestId();
  }, []);

  useEffect(() => {
    // Ensure the session bootstrap runs only once
    if (hasInitializeRef.current) return;
    hasInitializeRef.current = true;

    // Non-blocking: kicks off refresh-token + profile recovery in the
    // background. The public storefront renders immediately below and does
    // not wait on this to resolve.
    dispatch(bootstrapAuthThunk());
  }, [dispatch]);

  // Once bootstrap resolves, react to the outcome without blocking render.
  useEffect(() => {
    if (bootstrapStatus !== 'done') return;

    if (isAuthenticated) {
      // Cleanup: Remove anonymous guest identifier upon successful login
      clearGuestId();
      // Fetch user-specific data only after authentication is confirmed
      dispatch(fetchWishlist());
    }
  }, [bootstrapStatus, isAuthenticated, dispatch]);

  return (
    <>
      <AppRoutes />
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
