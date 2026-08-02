/**
 * AdminProductListPage.tsx
 *
 * This page serves as the main dashboard for product management.
 * It provides a filterable, paginated table of products, allows navigating to
 * the product creation flow, and handles different loading/error states.
 */

// --- React & Core Hooks ---
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

// --- External Libraries & Utilities ---
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// --- Local Components ---
import AdminLayout from '@/components/layout/AdminLayout';
import ProductFilterBar from '@/features/product/components/ProductFilterBar';
import ProductTable from '@/features/product/components/ProductTable';
import Pagination from '@/components/common/Pagination';

// --- State Management (Redux) ---
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProducts } from '@/features/product/productSlice';

// --- Constants & Types ---
import { ROUTES } from '@/constants/routes';
import type { ProductQueryParams } from '@/types/product.types';

function AdminProductListPage() {
  const dispatch = useAppDispatch();

  // Extract product state (list, pagination, and API status) from Redux store
  const { list, pagination, listStatus } = useAppSelector(
    (state) => state.product
  );

  // --- Local State ---
  // Tracks active filters to be sent to the API
  const [filters, setFilters] = useState<Partial<ProductQueryParams>>({});
  // Tracks current pagination page
  const [page, setPage] = useState<number>(1);

  /**
   * Memoized product fetch function.
   * useCallback ensures this function is only recreated when dependencies change,
   * preventing unnecessary API calls inside the useEffect.
   */
  const loadProducts = useCallback(() => {
    dispatch(
      fetchProducts({
        page,
        limit: 10,
        sort: 'createdAt',
        order: 'desc',
        ...filters,
      })
    );
  }, [dispatch, page, filters]);

  // Trigger data fetching whenever page or filters are updated
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  /**
   * Updates filter state and resets pagination to 1.
   * Resetting to 1 is critical when filtering, as the previous page number
   * might not exist within the new filtered result set.
   */
  const handleFilterChange = (newFilters: Partial<ProductQueryParams>) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <AdminLayout>
      {/* --- Header Section --- */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1A1A1A]">Quản lý sản phẩm</h1>
        <Link
          to={ROUTES.ADMIN_PRODUCT_CREATE_STEP1}
          className={cn(
            buttonVariants({ variant: 'default' }),
            'bg-[#0047AB] hover:bg-[#003a8c]'
          )}
        >
          <Plus size={16} className="mr-1" />
          Thêm sản phẩm
        </Link>
      </div>

      {/* --- Filter Section --- */}
      <div className="mb-4">
        <ProductFilterBar onFilterChange={handleFilterChange} />
      </div>

      {/* --- State Handling: Loading --- */}
      {listStatus === 'loading' && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-gray-50 p-4"
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      )}

      {/* --- State Handling: Success (Data Display) --- */}
      {listStatus === 'succeeded' && (
        <>
          <ProductTable products={list} onRestoreSuccess={loadProducts} />
          {pagination && (
            <div className="mt-6">
              <Pagination pagination={pagination} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      {/* --- State Handling: Error --- */}
      {listStatus === 'failed' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-600">
          Không thể tải danh sách sản phẩm
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminProductListPage;
