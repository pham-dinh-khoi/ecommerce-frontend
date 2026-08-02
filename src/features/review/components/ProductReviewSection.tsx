import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

// Local Components
import RatingSummaryCard from './RatingSummaryCard';
import ReviewCard from './ReviewCard';
import Pagination from '@/components/common/Pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Redux Actions & Types
import {
  fetchProductReviews,
  clearProductReviews,
} from '@/features/review/reviewSlice';
import type { ReviewQueryParams } from '@/types/review.types';

/**
 * Sort options configuration for the reviews filter.
 * Defined outside the component to prevent re-instantiation on every render.
 */
const sortOptions: {
  value: NonNullable<ReviewQueryParams['sort']>;
  label: string;
}[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'helpful', label: 'Hữu ích nhất' },
  { value: 'highest', label: 'Đánh giá cao nhất' },
  { value: 'lowest', label: 'Đánh giá thấp nhất' },
  { value: 'verified', label: 'Đã mua hàng' },
];

/**
 * ProductReviewSection
 *
 * Handles the display of reviews, including summary statistics,
 * sorting controls, review listing, and pagination.
 */
function ProductReviewSection({ productId }: { productId: string }) {
  const dispatch = useAppDispatch();

  // Extracting global state from the review slice
  const { productReviews, summary, productPagination, productReviewsStatus } =
    useAppSelector((state) => state.review);

  // Local state for current interaction controls
  const [sort, setSort] =
    useState<NonNullable<ReviewQueryParams['sort']>>('newest');
  const [page, setPage] = useState(1);

  /**
   * Effect Hook: Fetches reviews whenever the product ID, page, or sort criteria changes.
   * Cleanup: Clears the state when the component unmounts to prevent stale data.
   */
  useEffect(() => {
    dispatch(
      fetchProductReviews({ productId, params: { page, limit: 10, sort } })
    );

    return () => {
      dispatch(clearProductReviews());
    };
  }, [productId, page, sort, dispatch]);

  return (
    <div className="mt-12 border-t border-gray-100 pt-8">
      <h2 className="mb-4 text-lg font-bold text-[#1A1A1A]">
        Đánh giá sản phẩm
      </h2>

      {/* Render summary statistics if data is available */}
      {summary && summary.count > 0 && (
        <div className="mb-6">
          <RatingSummaryCard summary={summary} />
        </div>
      )}

      {/* Render sort controls only if reviews are successfully loaded */}
      {productReviewsStatus === 'succeeded' && productReviews.length > 0 && (
        <div className="mb-4 flex justify-end">
          <Select
            value={sort}
            onValueChange={(val) => val && setSort(val as typeof sort)}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sắp xếp">
                {(val: string) =>
                  sortOptions.find((s) => s.value === val)?.label ?? ''
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Loading state indicator */}
      {productReviewsStatus === 'loading' && (
        <div className="py-8 text-center text-gray-400">
          Đang tải đánh giá...
        </div>
      )}

      {/* Empty state: Rendered when the fetch succeeds but returns no items */}
      {productReviewsStatus === 'succeeded' && productReviews.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center text-gray-400">
          Chưa có đánh giá nào cho sản phẩm này
        </div>
      )}

      {/* Review List and Pagination: Rendered only when data exists */}
      {productReviewsStatus === 'succeeded' && productReviews.length > 0 && (
        <>
          <div>
            {productReviews.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>

          {productPagination && (
            <div className="mt-6">
              <Pagination
                pagination={productPagination}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ProductReviewSection;
