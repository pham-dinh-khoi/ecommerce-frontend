import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { searchService } from '@/features/search/searchService';
import type { SearchResultItem } from '@/types/search.types';
import SearchResultCard from './SearchResultCard';

/**
 * Constant defining the number of skeleton placeholders to show during initial load.
 * This ensures the UI maintains a consistent shape before data arrives.
 */
const SKELETON_COUNT = 5;

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
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([])) // Silent failure: fallback to empty array on error
      .finally(() => setLoading(false)); // Ensure loading stops regardless of outcome
  }, []);

  // Early Return: Loading State
  // Renders a grid of skeletons to prevent layout shift (CLS)
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg border border-gray-100"
          >
            <Skeleton className="aspect-square rounded-none" />
            <div className="space-y-2 p-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Early Return: Empty State
  // If no products are returned, we render nothing (or you could render a "No results" message)
  if (products.length === 0) return null;

  // Main Render: Successfully fetched products
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {products.map((p) => (
        <SearchResultCard key={p._id} product={p} />
      ))}
    </div>
  );
}

export default TrendingProducts;
