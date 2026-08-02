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
  // We render a dynamic list of skeleton loaders that matches the expected item count.
  // This prevents layout shift when the data arrives.
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: limit }).map((_, i) => (
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

  // Guard Clause: Empty State
  // If no products are found, we return null to avoid rendering empty containers.
  if (products.length === 0) return null;

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
