/**
 * AdminCouponListPage.tsx
 *
 * Dashboard for managing discount coupons.
 * Allows searching, paginating, and deleting coupons.
 */

// --- React & Core Hooks ---
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

// --- External Libraries & Utilities ---
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/formatCurrency';

// --- UI Components ---
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// --- Layouts & Common Components ---
import AdminLayout from '@/components/layout/AdminLayout';
import Pagination from '@/components/common/Pagination';

// --- State Management (Redux) ---
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchAdminCoupons,
  deleteCouponThunk,
} from '@/features/coupon/couponSlice';

// --- Constants & Types ---
import { ROUTES, buildAdminCouponEditUrl } from '@/constants/routes';
import type { Coupon } from '@/types/coupon.types';

// Helper: Format date for display
const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString('vi-VN');
};

function AdminCouponListPage() {
  const dispatch = useAppDispatch();
  const { adminList, adminPagination, adminListStatus } = useAppSelector(
    (state) => state.coupon
  );

  // --- Local UI State ---
  const [keyword, setKeyword] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);

  /**
   * Memoized data fetcher.
   * Triggers API call when dependencies (pagination/search) update.
   */
  const loadCoupons = useCallback(() => {
    dispatch(
      fetchAdminCoupons({
        page,
        limit: 10,
        sort: 'createdAt',
        order: 'desc',
        keyword: keyword || undefined,
      })
    );
  }, [dispatch, page, keyword]);

  // Initial load effect
  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  // Debounce effect: Resets page to 1 when keyword changes (with small delay)
  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  /**
   * Handler to execute coupon deletion.
   */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteCouponThunk(deleteTarget._id)).unwrap();
      toast.success(`Đã xóa coupon "${deleteTarget.code}"`);
    } catch (err) {
      if ((err as string)?.trim()) toast.error(err as string);
    } finally {
      setDeleteTarget(null);
    }
  };

  /**
   * Helper to render status badges based on coupon business logic.
   */
  const getStatusBadge = (coupon: Coupon) => {
    if (!coupon.isActive)
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-500">
          Đã tắt
        </Badge>
      );
    if (coupon.isExpired)
      return <Badge className="bg-red-100 text-red-600">Hết hạn</Badge>;
    if (coupon.isExhausted)
      return <Badge className="bg-yellow-100 text-yellow-700">Hết lượt</Badge>;
    return (
      <Badge className="bg-green-100 text-green-700">Đang hoạt động</Badge>
    );
  };

  return (
    <AdminLayout>
      {/* --- Page Header --- */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1A1A1A]">
          Quản lý mã giảm giá
        </h1>
        <Link
          to={ROUTES.ADMIN_COUPON_CREATE}
          className={cn(
            buttonVariants({ variant: 'default' }),
            'bg-[#0047AB] hover:bg-[#003a8c]'
          )}
        >
          <Plus size={16} className="mr-1" />
          Thêm coupon
        </Link>
      </div>

      {/* --- Search Control --- */}
      <div className="mb-4">
        <Input
          placeholder="Tìm theo mã coupon..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* --- Loading State --- */}
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

      {/* --- Data Display --- */}
      {adminListStatus === 'succeeded' && (
        <>
          {adminList.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white py-16 text-center text-gray-400">
              Chưa có coupon nào
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    <th className="px-4 py-3 font-medium">Mã</th>
                    <th className="px-4 py-3 font-medium">Giảm giá</th>
                    <th className="px-4 py-3 font-medium">Lượt dùng</th>
                    <th className="px-4 py-3 font-medium">Hiệu lực</th>
                    <th className="px-4 py-3 font-medium">Trạng thái</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {adminList.map((c) => (
                    <tr
                      key={c._id}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#1A1A1A]">{c.code}</p>
                        <p className="text-xs text-gray-400">{c.description}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {c.discount.type === 'percentage'
                          ? `${c.discount.amount}%${c.discount.maxDiscount ? ` (tối đa ${formatCurrency(c.discount.maxDiscount)})` : ''}`
                          : formatCurrency(c.discount.amount)}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {c.limits.usedCount}
                        {c.limits.maxUsageTotal
                          ? ` / ${c.limits.maxUsageTotal}`
                          : ' / ∞'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatDate(c.startDate)} → {formatDate(c.endDate)}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(c)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={buildAdminCouponEditUrl(c._id)}
                            className={cn(
                              buttonVariants({ variant: 'ghost', size: 'icon' })
                            )}
                          >
                            <Pencil size={16} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(c)}
                            className="rounded-md p-2 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {adminPagination && (
            <div className="mt-6">
              <Pagination pagination={adminPagination} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      {/* --- Delete Confirmation Dialog --- */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Xóa coupon "{deleteTarget?.code}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Nếu coupon đã được sử dụng, hệ thống sẽ tự động tắt (deactivate)
              thay vì xóa hẳn để giữ lịch sử.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

export default AdminCouponListPage;
