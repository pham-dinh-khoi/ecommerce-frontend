import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

// Components & Layouts
import MainLayout from '@/components/layout/MainLayout';
import ProductGrid from '@/features/product/components/ProductGrid';

// Store & Slices
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchWishlist } from '@/features/wishlist/wishlistSlice';

// Constants & Types
import { ROUTES } from '@/constants/routes';
import type { ProductCardData } from '@/types/product.types';

/**
 * WishlistPage Component
 *
 * Responsible for fetching, processing, and displaying the user's saved products.
 * It handles loading states, empty states, and the rendering of the product grid.
 */
function WishlistPage() {
  // --- Hooks ---
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector((state) => state.wishlist);

  // --- Effects ---
  // Trigger fetch on mount. We include 'dispatch' in the dependency array
  // as per standard React hooks linting rules.
  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  // --- Data Transformation ---
  // The wishlist API usually returns an array of wrapper objects (e.g., { product: ... }).
  // We filter out any null results and extract the product object to match
  // the expected interface for the ProductGrid component.
  const products: ProductCardData[] = items
    .filter((i) => i.product !== null)
    .map((i) => i.product!);

  // --- Conditional Rendering: Loading State ---
  if (status === 'loading' || status === 'idle') {
    return (
      <MainLayout>
        <div className="mx-auto max-w-7xl px-4 py-12">
          {/* Skeleton loader representing the title while fetching */}
          <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
        </div>
      </MainLayout>
    );
  }

  // --- Conditional Rendering: Empty State ---
  if (products.length === 0) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <Heart size={48} className="mx-auto text-gray-300" />
          <h1 className="mt-4 text-xl font-bold text-[#1A1A1A]">
            Chưa có sản phẩm yêu thích
          </h1>
          <p className="mt-2 text-gray-500">
            Lưu lại sản phẩm bạn thích để xem sau
          </p>
          <Link
            to={ROUTES.HOME}
            className="mt-6 inline-block rounded-md bg-[#0047AB] px-6 py-2 text-white hover:bg-[#003a8c]"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      </MainLayout>
    );
  }

  // --- Main Render: Product List ---
  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">
          Sản phẩm yêu thích ({products.length})
        </h1>
        <div className="mt-6">
          <ProductGrid products={products} />
        </div>
      </div>
    </MainLayout>
  );
}

export default WishlistPage;
