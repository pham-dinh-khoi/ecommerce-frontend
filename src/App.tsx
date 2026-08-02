import { useEffect, useRef, useState } from 'react';
import { useAppDispatch } from './store/hooks';
import { refreshAccessTokenThunk, getMeThunk } from './features/auth/authSlice';
import AppRoutes from '@/routes/AppRoute';
import { Toaster } from '@/components/ui/sonner';
import { setNavigate } from '@/lib/navigation';
import { useNavigate } from 'react-router-dom';
import { getOrCreateGuestId, clearGuestId } from './lib/guestId';
import { fetchWishlist } from './features/wishlist/wishlistSlice';
import { Skeleton } from './components/ui/skeleton';

function App() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isInitializing, setIsInitializing] = useState(true);

  // Ref to prevent double-invocation of useEffect in React 18+ StrictMode
  const hasInitializeRef = useRef(false);

  // Inject the React Router 'navigate' function into the global navigation bridge
  // This allows axios interceptors (outside React tree) to trigger navigation
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  useEffect(() => {
    // Ensure initialization logic runs only once
    if (hasInitializeRef.current) return;
    hasInitializeRef.current = true;

    const initAuth = async () => {
      try {
        // Attempt to refresh the session token and fetch current user profile
        await dispatch(refreshAccessTokenThunk()).unwrap();
        await dispatch(getMeThunk()).unwrap();

        // Fetch user-specific data after successful authentication
        dispatch(fetchWishlist());

        // Cleanup: Remove anonymous guest identifier upon successful login
        clearGuestId();
      } catch {
        // Fallback: If auth fails, ensure a Guest ID exists for tracking
        getOrCreateGuestId();
      } finally {
        setIsInitializing(false);
      }
    };
    initAuth();
  }, [dispatch]);

  // Secondary assurance: ensure Guest ID is present for all visitors
  useEffect(() => {
    getOrCreateGuestId();
  }, []);

  // Show a loading screen while authentication/initialization completes
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-gray-100 px-8 py-3">
          <div className="mx-auto flex max-w-7xl items-center gap-4">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Skeleton className="h-8 w-64" />
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-square" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AppRoutes />
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
