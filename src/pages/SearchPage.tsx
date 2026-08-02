import { useEffect, useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

// Layout & Common Components
import MainLayout from '@/components/layout/MainLayout';
import Pagination from '@/components/common/Pagination';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Feature Components & Services
import SearchFacetSidebar from '@/features/search/components/SearchFacetSidebar';
import SearchResultCard from '@/features/search/components/SearchResultCard';
import { searchService } from '@/features/search/searchService';

// Types
import type {
  SearchResponse,
  SearchParams,
  SortField,
} from '@/types/search.types';

const sortOptions: { value: SortField; label: string }[] = [
  { value: 'relevance', label: 'Liên quan nhất' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá thấp đến cao' },
  { value: 'price_desc', label: 'Giá cao đến thấp' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
  { value: 'sold', label: 'Bán chạy nhất' },
  { value: 'discount', label: 'Giảm giá nhiều nhất' },
];

/**
 * SearchPage Component
 *
 * Handles the orchestration of product searching, filtering, sorting, and pagination.
 * This component relies entirely on URL Search Parameters as the source of truth,
 * making the search state shareable and bookmarkable.
 */
function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Extract core query values
  const q = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? undefined;

  /**
   * Derive API-ready filter object from URLSearchParams.
   * This ensures the application state is always in sync with the URL.
   */
  const filters: SearchParams = {
    q: q || undefined,
    category,
    brand: searchParams.getAll('brand').length
      ? searchParams.getAll('brand')
      : undefined,
    minPrice: searchParams.get('minPrice')
      ? Number(searchParams.get('minPrice'))
      : undefined,
    maxPrice: searchParams.get('maxPrice')
      ? Number(searchParams.get('maxPrice'))
      : undefined,
    minRating: searchParams.get('minRating')
      ? Number(searchParams.get('minRating'))
      : undefined,
    inStock: searchParams.get('inStock') === 'true' ? true : undefined,
    sort:
      (searchParams.get('sort') as SortField) ?? (q ? 'relevance' : 'newest'),
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: 20,
    facets: true,
  };

  /**
   * Fetches results from the search service.
   * Wrapped in useCallback to prevent unnecessary re-fetching unless
   * the URL (dependencies) actually changes.
   */
  const loadResults = useCallback(() => {
    setLoading(true);
    searchService
      .search(filters)
      .then(setResult)
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadResults();
  }, [loadResults]);

  /**
   * Updates the URL search parameters to trigger a new fetch.
   * Always resets page to 1 to avoid "empty result" issues when changing filters.
   */
  const updateFilters = (patch: Partial<SearchParams>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      next.delete(key);
      if (value === undefined) return;
      if (Array.isArray(value)) {
        value.forEach((v) => next.append(key, v));
      } else {
        next.set(key, String(value));
      }
    });
    next.set('page', '1');
    setSearchParams(next);
  };

  const handlePageChange = (page: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(page));
    setSearchParams(next);
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Page Title & Result Stats */}
        <h1 className="text-2xl font-bold text-[#1A1A1A]">
          {q ? `Kết quả tìm kiếm cho "${q}"` : 'Tất cả sản phẩm'}
        </h1>
        {result && (
          <p className="mt-1 text-sm text-gray-500">
            {result.pagination.total} sản phẩm ({result.query.took}ms)
          </p>
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
          {/* Sidebar Filters */}
          <aside>
            <SearchFacetSidebar
              facets={result?.facets}
              filters={filters}
              onChange={updateFilters}
            />
          </aside>

          {/* Main Content Area */}
          <div>
            <div className="mb-4 flex justify-end">
              <Select
                value={filters.sort}
                onValueChange={(val) =>
                  val && updateFilters({ sort: val as SortField })
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sắp xếp">
                    {(val: string) =>
                      sortOptions.find((s) => s.value === val)?.label ?? ''
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {sortOptions
                    .filter((opt) => opt.value !== 'relevance' || q)
                    .map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Skeleton Loading State */}
            {loading && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-lg border border-gray-100"
                  >
                    <Skeleton className="aspect-square rounded-none" />
                    <div className="space-y-2 p-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-5 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && result && result.products.length === 0 && (
              <div className="rounded-lg border border-dashed border-gray-300 py-16 text-center text-gray-400">
                Không tìm thấy sản phẩm phù hợp
              </div>
            )}

            {/* Results Grid & Pagination */}
            {!loading && result && result.products.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {result.products.map((p) => (
                    <SearchResultCard key={p._id} product={p} />
                  ))}
                </div>
                <div className="mt-8">
                  <Pagination
                    pagination={result.pagination}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default SearchPage;
