import { useEffect, useState } from 'react';

// --- Components ---
import { Skeleton } from '@/components/ui/skeleton';
import SearchResultCard from './SearchResultCard';

// --- Services & Types ---
import { searchService } from '@/features/search/searchService';
import type { SearchResultItem } from '@/types/search.types';

// Define the interface for component props for better maintainability and type safety
interface SimilarProductsProps {
  productId: string;
}

function SimilarProducts({ productId }: SimilarProductsProps) {
  // State: List of products fetched from the API
  const [products, setProducts] = useState<SearchResultItem[]>([]);
  // State: Loading status to determine if we show skeletons or the actual content
  const [loading, setLoading] = useState(true);

  // Effect: Fetch similar products whenever the productId changes.
  // The dependency array [productId] ensures the data refreshes correctly
  // if the user navigates between different product pages.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    searchService
      .similar(productId)
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([])) // Graceful failure: display empty list if request fails
      .finally(() => setLoading(false));
  }, [productId]);

  // Guard Clause: Render loading skeletons while waiting for the network request
  // This improves UX by providing immediate visual feedback.
  if (loading || products.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
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

  // Render Component: Display the list of products using a responsive grid layout
  return (
    <div className="mt-12 border-t border-gray-100 pt-8">
      <h2 className="mb-4 text-lg font-bold text-[#1A1A1A]">
        Sản phẩm tương tự
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {products.map((p) => (
          <SearchResultCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}

export default SimilarProducts;
