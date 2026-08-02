/**
 * @file CategoryPage.tsx
 * @description Renders the product listing page filtered by category.
 * Handles category resolution, product fetching, filtering (price), and sorting.
 */

// --- Imports ---
// React & Router
import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';

// Layout & UI Components
import MainLayout from '@/components/layout/MainLayout';
import Breadcrumb from '@/components/common/Breadcrumb';
import Pagination from '@/components/common/Pagination';
import ProductGrid from '@/features/product/components/ProductGrid';
import PriceRangeFilter from '@/features/product/components/PriceRangeFilter';
import ProductSortSelect, {
  sortOptionToParams,
  type SortOption,
} from '@/features/product/components/ProductSortSelect';

// Store & Slices
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategoryTree } from '@/features/category/categorySlice';
import { fetchProducts } from '@/features/product/productSlice';

// Utils & Constants
import { buildCategoryUrl } from '@/constants/routes';
import type { Category } from '@/types/category.types';

// --- Helpers ---

/**
 * Recursively traverses the category tree to find a category by its slug.
 * @param tree - Array of category nodes
 * @param slug - The slug string to match
 * @returns The matching Category object or null
 */
function findCategoryBySlug(tree: Category[], slug: string): Category | null {
  for (const cat of tree) {
    if (cat.slug === slug) return cat;
    if (cat.children) {
      const found = findCategoryBySlug(cat.children, slug);
      if (found) return found;
    }
  }
  return null;
}

// --- Component ---

function CategoryPage() {
  // Hooks & Params
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();

  // Selectors
  const { tree, status: categoryStatus } = useAppSelector(
    (state) => state.category
  );
  const {
    list: products,
    pagination,
    listStatus,
  } = useAppSelector((state) => state.product);

  // Local UI State
  const [sort, setSort] = useState<SortOption>('newest');
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>(
    {}
  );
  const [page, setPage] = useState(1);

  // Initial Data Fetch: Retrieve category structure
  useEffect(() => {
    dispatch(fetchCategoryTree());
  }, [dispatch]);

  // Resolve current category from URL slug
  const category = slug ? findCategoryBySlug(tree, slug) : null;

  /**
   * Fetches products based on current filters, sorting, and pagination.
   * Wrapped in useCallback to stabilize the dependency for useEffect.
   */
  const loadProducts = useCallback(() => {
    if (!category) return;
    const { sort: sortField, order } = sortOptionToParams(sort);

    dispatch(
      fetchProducts({
        category: category._id,
        page,
        limit: 12,
        sort: sortField,
        order,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
      })
    );
  }, [dispatch, category, sort, priceRange, page]);

  // Trigger product fetch when dependencies change
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // --- Conditional Rendering ---

  // 1. Loading State (Category Tree)
  if (categoryStatus === 'loading' || categoryStatus === 'idle') {
    return (
      <MainLayout>
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
        </div>
      </MainLayout>
    );
  }

  // 2. Not Found State
  if (!category) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">
            Không tìm thấy danh mục
          </h1>
          <p className="mt-2 text-gray-600">
            Danh mục bạn tìm không tồn tại hoặc đã bị xóa.
          </p>
          <Link
            to="/"
            className="mt-4 inline-block text-[#0047AB] hover:underline"
          >
            ← Quay lại trang chủ
          </Link>
        </div>
      </MainLayout>
    );
  }

  const children = category.children?.filter((c) => c.isActive) ?? [];

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          ancestors={category.ancestors}
          currentName={category.name}
        />

        <h1 className="mt-4 text-2xl font-bold text-[#1A1A1A] lg:text-3xl">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-2 max-w-2xl text-gray-600">{category.description}</p>
        )}

        {/* Child Categories (Sub-navigation) */}
        {children.length > 0 && (
          <div className="mt-6 rounded-lg border border-gray-100 bg-gray-50 p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
              Khám phá theo danh mục
            </p>
            <div className="flex flex-wrap gap-2">
              {children.map((child) => (
                <Link
                  key={child._id}
                  to={buildCategoryUrl(child.slug)}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#1A1A1A] hover:border-[#0047AB] hover:text-[#0047AB]"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
          {/* Sidebar Filters */}
          <aside className="space-y-6">
            <PriceRangeFilter
              onApply={(min, max) => {
                setPriceRange({ min, max });
                setPage(1); // Reset to page 1 on filter change
              }}
            />
          </aside>

          {/* Product Listing Area */}
          <div>
            {/* Header: Item Count & Sort Control */}
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {pagination?.total ?? 0} sản phẩm
              </span>
              <ProductSortSelect
                value={sort}
                onChange={(newSort) => {
                  setSort(newSort);
                  setPage(1); // Reset to page 1 on sort change
                }}
              />
            </div>

            {/* Loading Skeleton */}
            {listStatus === 'loading' && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-square animate-pulse rounded-lg bg-gray-100"
                  />
                ))}
              </div>
            )}

            {/* Product Results */}
            {listStatus === 'succeeded' && <ProductGrid products={products} />}

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination pagination={pagination} onPageChange={setPage} />
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default CategoryPage;
