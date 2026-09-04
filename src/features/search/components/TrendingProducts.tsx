import { useEffect, useState } from 'react';
import { searchService } from '@/features/search/searchService';
import type { SearchResultItem } from '@/types/search.types';
import SearchResultCard from './SearchResultCard';
import {
  PRODUCT_GRID_CLASSES,
  ProductGridSkeleton,
  ProductGridEmpty,
} from './ProductGridStates';

/**
 * The trending endpoint accepts no limit and can return more than a single
 * grid row's worth of items. This constant is the one source of truth for
 * how many trending products are displayed — it sizes both the loading
 * skeleton and the rendered grid, so the row count never changes once data
 * arrives.
 */
const TRENDING_DISPLAY_LIMIT = 5;

/**
 * TrendingProducts Component
 * Fetches and displays a list of trending items.
 * Handles loading states and empty data scenarios gracefully.
 */
function TrendingProducts() {
  // State management for the products list and loading status
  const [products, setProducts] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Side-effect: Fetch trending products once on component mount
  useEffect(() => {
    searchService
      .trending()
      // The endpoint has no limit param, so cap the displayed set here to
      // keep the grid at a single row matching the skeleton.
      .then((res) => setProducts(res.data.slice(0, TRENDING_DISPLAY_LIMIT)))
      .catch(() => setProducts([])) // Silent failure: fallback to empty array on error
      .finally(() => setLoading(false)); // Ensure loading stops regardless of outcome
  }, []);

  // Early Return: Loading State
  // Skeleton cards mirror the real card's reserved dimensions so the row
  // height doesn't change once data arrives.
  if (loading) {
    return (
      <ProductGridSkeleton
        count={TRENDING_DISPLAY_LIMIT}
        label="Đang tải sản phẩm nổi bật..."
      />
    );
  }

  // Early Return: Empty State
  // Render a modest placeholder instead of `null` so the section doesn't
  // collapse from the full skeleton grid straight to zero height.
  if (products.length === 0) {
    return <ProductGridEmpty message="Chưa có sản phẩm nổi bật." />;
  }

  // Main Render: Successfully fetched products
  return (
    <div className={PRODUCT_GRID_CLASSES}>
      {products.map((p) => (
        <SearchResultCard key={p._id} product={p} />
      ))}
    </div>
  );
}

export default TrendingProducts;
