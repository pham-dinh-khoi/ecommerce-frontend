import { useEffect, useState } from 'react';

// --- Components ---
import { Skeleton } from '@/components/ui/skeleton';
import SearchResultCard from './SearchResultCard';

// --- Services & Types ---
import { searchService } from '@/features/search/searchService';
import type { SearchResultItem, SortField } from '@/types/search.types';

interface ProductSectionProps {
  sort: SortField;
  limit?: number;
}

/**
 * ProductSection displays a grid of products based on a specific sorting criterion.
 * It handles the data fetching lifecycle and renders a dynamic number of
 * skeleton loaders based on the 'limit' prop for a consistent layout transition.
 */
function ProductSection({ sort, limit = 5 }: ProductSectionProps) {
  const [products, setProducts] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products whenever the sort criterion or limit changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    searchService
      .search({ sort, page: 1, limit })
      .then((res) => setProducts(res.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [sort, limit]);

  // Guard Clause: Loading State
  // Skeleton cards mirror the real card's reserved dimensions (2-line title,
  // price line, rating row) so the row height doesn't change once data
  // arrives, and expose a single concise status to assistive tech since the
  // decorative skeleton grid itself is hidden from it.
  if (loading) {
    return (
      <div role="status" aria-live="polite" aria-busy="true">
        <span className="sr-only">Đang tải sản phẩm...</span>
        <div
          aria-hidden="true"
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
        >
          {Array.from({ length: limit }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-lg border border-gray-100"
            >
              <Skeleton className="aspect-square rounded-none" />
              <div className="p-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="mt-1.5 h-6 w-1/2" />
                <Skeleton className="mt-1 h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Guard Clause: Empty / Error State
  // Render a modest placeholder instead of `null` so the section doesn't
  // collapse from the full skeleton grid straight to zero height.
  if (products.length === 0) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-500">
        Chưa có sản phẩm nào để hiển thị.
      </div>
    );
  }

  // Render Section
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {products.map((p) => (
        <SearchResultCard key={p._id} product={p} />
      ))}
    </div>
  );
}

export default ProductSection;
