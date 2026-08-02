/**
 * AdminOrderListPage.tsx
 *
 * This page acts as the dashboard for order management.
 * It provides a summary of key metrics (revenue, order counts),
 * filtering capabilities (by status and search keyword),
 * and a paginated data table.
 */

// --- React & Core Hooks ---
import { useEffect, useState, useCallback } from 'react';

// --- External Libraries & Utilities ---
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/utils/formatCurrency';

// --- Local Components ---
import AdminLayout from '@/components/layout/AdminLayout';
import OrderTable from '@/features/order/components/OrderTable';
import Pagination from '@/components/common/Pagination';

// --- State Management (Redux) ---
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAdminOrders, fetchOrderStats } from '@/features/order/orderSlice';

// --- Types ---
import type { OrderStatus } from '@/types/order.types';

// Configuration for order status filtering
const statusOptions: { value: string; label: string }[] = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'processing', label: 'Đang đóng gói' },
  { value: 'shipped', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Đã hủy' },
];

function AdminOrderListPage() {
  const dispatch = useAppDispatch();
  const { adminList, adminPagination, adminListStatus, stats } = useAppSelector(
    (state) => state.order
  );

  // --- Local UI State ---
  const [keyword, setKeyword] = useState<string>('');
  const [status, setStatus] = useState<string>('all');
  const [page, setPage] = useState<number>(1);

  /**
   * Memoized data fetcher.
   * Updates when page, search keyword, or status filter changes.
   */
  const loadOrders = useCallback(() => {
    dispatch(
      fetchAdminOrders({
        page,
        limit: 15,
        sort: 'createdAt',
        order: 'desc',
        keyword: keyword || undefined,
        status: status === 'all' ? undefined : (status as OrderStatus),
      })
    );
  }, [dispatch, page, keyword, status]);

  // Initial load: Fetch orders and summary statistics
  useEffect(() => {
    loadOrders();
    dispatch(fetchOrderStats());
  }, [loadOrders, dispatch]);

  /**
   * Debounce effect: When user changes filters (status/search),
   * we wait 400ms before resetting the page to 1.
   * This prevents rapid UI flickering and redundant API calls.
   */
  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 400);
    return () => clearTimeout(timer);
  }, [keyword, status]);

  return (
    <AdminLayout>
      <h1 className="mb-6 text-xl font-bold text-[#1A1A1A]">
        Quản lý đơn hàng
      </h1>

      {/* --- Dashboard Statistics Cards --- */}
      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">Doanh thu (đã giao)</p>
            <p className="mt-1 text-lg font-bold text-[#0047AB]">
              {formatCurrency(stats.revenue.total)}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">Đơn đã giao</p>
            <p className="mt-1 text-lg font-bold text-[#1A1A1A]">
              {stats.revenue.deliveredOrders}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">Giá trị TB/đơn</p>
            <p className="mt-1 text-lg font-bold text-[#1A1A1A]">
              {formatCurrency(stats.revenue.avgOrderValue)}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">Chờ xác nhận</p>
            <p className="mt-1 text-lg font-bold text-yellow-600">
              {stats.byStatus.pending ?? 0}
            </p>
          </div>
        </div>
      )}

      {/* --- Filter & Search Controls --- */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Tìm theo mã đơn..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="max-w-sm"
        />
        <Select value={status} onValueChange={(val) => val && setStatus(val)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Trạng thái">
              {(val: string) =>
                statusOptions.find((s) => s.value === val)?.label ?? ''
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* --- Loading Skeleton State --- */}
      {adminListStatus === 'loading' && (
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

      {/* --- Data Display & Pagination --- */}
      {adminListStatus === 'succeeded' && (
        <>
          <OrderTable orders={adminList} />
          {adminPagination && (
            <div className="mt-6">
              <Pagination pagination={adminPagination} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}

export default AdminOrderListPage;
