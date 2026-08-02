import { Star } from 'lucide-react';
import type { RatingSummary } from '@/types/review.types';

/**
 * RatingSummaryCard
 *
 * Displays the overall average rating and a breakdown of the distribution
 * of stars (1-5).
 *
 * @param {RatingSummary} summary - The data object containing average, total count, and distribution map.
 */
function RatingSummaryCard({ summary }: { summary: RatingSummary }) {
  // Logic: Calculate the maximum count among distributions for relative bar sizing.
  // We use '1' as a fallback to prevent division by zero (NaN) if there are no reviews.
  const maxCount = Math.max(...Object.values(summary.distribution), 1);

  return (
    <div className="flex flex-col gap-6 rounded-lg border border-gray-200 bg-white p-5 sm:flex-row">
      {/* 
        Section 1: Overall Average Display
        - Uses flex-col to stack number and stars.
        - 'sm:w-40' ensures a fixed width on desktop/tablet for consistent alignment.
      */}
      <div className="flex shrink-0 flex-col items-center justify-center sm:w-40">
        <p className="text-4xl font-bold text-[#1A1A1A]">
          {summary.average.toFixed(1)}
        </p>

        {/* Star Rating Visualization */}
        <div className="mt-1 flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={16}
              // Conditional styling based on whether the index is less than the rounded average
              className={
                i < Math.round(summary.average)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-200'
              }
            />
          ))}
        </div>

        <p className="mt-1 text-sm text-gray-500">{summary.count} đánh giá</p>
      </div>

      {/* 
        Section 2: Distribution Bars
        - Flex-1 allows this section to grow and fill remaining horizontal space.
      */}
      <div className="flex-1 space-y-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          // Fallback to 0 if the specific star rating count is missing in the object
          const count = summary.distribution[star] ?? 0;

          // Calculate percentage width based on the most frequent star rating (normalized)
          const percent = (count / maxCount) * 100;

          return (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-8 text-gray-600">{star} sao</span>

              {/* Background container for the progress bar */}
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                {/* Dynamic width based on calculated percentage */}
                <div
                  className="h-full bg-yellow-400"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <span className="w-8 text-right text-gray-400">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RatingSummaryCard;
