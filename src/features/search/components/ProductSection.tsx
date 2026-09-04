import { useEffect, useState } from 'react';

// --- Components ---
import SearchResultCard from './SearchResultCard';
import {
  PRODUCT_GRID_CLASSES,
  ProductGridSkeleton,
  ProductGridEmpty,
} from './ProductGridStates';

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
  // Skeleton cards mirror the real card's reserved dimensions so the row
  // height doesn't change once data arrives.
  if (loading) {
    return <ProductGridSkeleton count={limit} label="Đang tải sản phẩm..." />;
  }

  // Guard Clause: Empty / Error State
  // Render a modest placeholder instead of `null` so the section doesn't
  // collapse from the full skeleton grid straight to zero height.
  if (products.length === 0) {
    return <ProductGridEmpty message="Chưa có sản phẩm nào để hiển thị." />;
  }

  // Render Section
  return (
    <div className={PRODUCT_GRID_CLASSES}>
      {products.map((p) => (
        <SearchResultCard key={p._id} product={p} />
      ))}
    </div>
  );
}

export default ProductSection;
