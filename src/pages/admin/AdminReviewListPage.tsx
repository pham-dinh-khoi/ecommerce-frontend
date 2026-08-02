/**
 * AdminReviewListPage.tsx
 *
 * This component renders the administrative interface for moderating product reviews.
 * It provides filtering capabilities, real-time status updates (Approve/Reject/Hide),
 * and paginated data display.
 */

// --- React & Core Hooks ---
import { useEffect, useState, useCallback } from 'react';

// --- External Libraries & Utilities ---
import { toast } from 'sonner';
import { Star, Check, X, EyeOff } from 'lucide-react';

// --- Local Components ---
import AdminLayout from '@/components/layout/AdminLayout';
import ReviewModerationBadge from '@/features/review/components/ReviewModerationBadge';
import Pagination from '@/components/common/Pagination';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// --- State Management (Redux) ---
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchAdminReviews,
  moderateReviewThunk,
} from '@/features/review/reviewSlice';

// --- Types ---
import type { ReviewStatus } from '@/types/review.types';

/**
 * Filter options configuration to drive the Select component logic.
 */
const statusOptions: { value: string; label: string }[] = [
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'rejected', label: 'Đã từ chối' },
  { value: 'hidden', label: 'Đã ẩn' },
];

function AdminReviewListPage() {
  // --- Hooks & Selectors ---
  const dispatch = useAppDispatch();

  // Extract state from the review slice in the Redux store
  const { adminList, adminPagination, adminListStatus } = useAppSelector(
    (state) => state.review
  );

  // --- Local State for UI Controls ---
  const [status, setStatus] = useState<string>('pending'); // Default to 'pending' to focus on actionable tasks
  const [page, setPage] = useState<number>(1);
  const [processingId, setProcessingId] = useState<string | null>(null); // Tracks individual item action for loading states

  /**
   * Memoized fetch function to sync UI filters with API calls.
   * useCallback ensures we don't trigger unnecessary re-renders in the effect dependency array.
   */
  const loadReviews = useCallback(() => {
    dispatch(
      fetchAdminReviews({
        page,
        limit: 15,
        status: status === 'all' ? undefined : (status as ReviewStatus),
      })
    );
  }, [dispatch, page, status]);

  // Trigger data fetch on mount or when filters/pagination change
  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  /**
   * Handles the review moderation process (Approve/Reject/Hide).
   * Uses .unwrap() to catch rejected thunks and toast error feedback.
   */
  const handleModerate = async (
    reviewId: string,
    newStatus: 'approved' | 'rejected' | 'hidden'
  ) => {
    setProcessingId(reviewId);
    try {
      await dispatch(
        moderateReviewThunk({ id: reviewId, payload: { status: newStatus } })
      ).unwrap();
      toast.success('Đã cập nhật trạng thái đánh giá');
    } catch (err) {
      // Basic type narrowing for error handling
      if ((err as string)?.trim()) toast.error(err as string);
    } finally {
      // Ensure the button state resets even if the API call fails
      setProcessingId(null);
    }
  };

  return (
    <AdminLayout>
      <h1 className="mb-6 text-xl font-bold text-[#1A1A1A]">Duyệt đánh giá</h1>

      {/* --- Filter Section --- */}
      <div className="mb-4">
        <Select
          value={status}
          onValueChange={(val) => {
            if (val) {
              setStatus(val);
              setPage(1); // Reset to first page when filter changes to avoid empty result views
            }
          }}
        >
          <SelectTrigger className="w-52">
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

      {/* --- Loading State (Skeleton) --- */}
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

      {/* --- Empty State --- */}
      {adminListStatus === 'succeeded' && adminList.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white py-16 text-center text-gray-400">
          Không có đánh giá nào
        </div>
      )}

      {/* --- Data List --- */}
      {adminListStatus === 'succeeded' && adminList.length > 0 && (
        <div className="space-y-3">
          {adminList.map((review) => {
            const userInfo =
              typeof review.user === 'object' ? review.user : null;
            const isProcessing = processingId === review._id;

            return (
              <div
                key={review._id}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    {/* User & Rating Info */}
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#1A1A1A]">
                        {userInfo?.name ?? '—'}
                      </p>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-200'
                            }
                          />
                        ))}
                      </div>
                      {review.isVerifiedPurchase && (
                        <span className="text-xs text-green-600">
                          Đã mua hàng
                        </span>
                      )}
                    </div>

                    {/* Review Content */}
                    <p className="mt-1 text-sm font-medium text-[#1A1A1A]">
                      {review.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {review.content}
                    </p>

                    {/* Auto-flags display */}
                    {review.moderation.autoFlags &&
                      review.moderation.autoFlags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {review.moderation.autoFlags.map((flag) => (
                            <span
                              key={flag}
                              className="rounded-full bg-orange-50 px-2 py-0.5 text-xs text-orange-600"
                            >
                              ⚠ {flag}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>
                  <ReviewModerationBadge status={review.moderation.status} />
                </div>

                {/* --- Moderation Actions --- */}
                {review.moderation.status === 'pending' && (
                  <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                    <button
                      type="button"
                      onClick={() => handleModerate(review._id, 'approved')}
                      disabled={isProcessing}
                      className="flex items-center gap-1 rounded-md bg-green-50 px-3 py-1.5 text-sm text-green-700 hover:bg-green-100 disabled:opacity-50"
                    >
                      <Check size={14} /> Duyệt
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModerate(review._id, 'rejected')}
                      disabled={isProcessing}
                      className="flex items-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100 disabled:opacity-50"
                    >
                      <X size={14} /> Từ chối
                    </button>
                  </div>
                )}

                {review.moderation.status === 'approved' && (
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <button
                      type="button"
                      onClick={() => handleModerate(review._id, 'hidden')}
                      disabled={isProcessing}
                      className="flex items-center gap-1 rounded-md bg-gray-50 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <EyeOff size={14} /> Ẩn đánh giá
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* --- Pagination --- */}
      {adminPagination && (
        <div className="mt-6">
          <Pagination pagination={adminPagination} onPageChange={setPage} />
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminReviewListPage;
