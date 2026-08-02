import { Badge } from '@/components/ui/badge';
import type { ReviewStatus } from '@/types/review.types';

/**
 * Configuration mapping for review statuses.
 * This serves as a "Source of Truth" to map data states to UI styles.
 * If a new status is added in the future, it only needs to be defined here.
 */
const statusConfig: Record<ReviewStatus, { label: string; className: string }> =
  {
    pending: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-700' },
    approved: { label: 'Đã duyệt', className: 'bg-green-100 text-green-700' },
    rejected: { label: 'Đã từ chối', className: 'bg-red-100 text-red-600' },
    hidden: { label: 'Đã ẩn', className: 'bg-gray-100 text-gray-500' },
  };

/**
 * ReviewModerationBadge Component
 *
 * Displays a color-coded badge based on the provided review status.
 * @param {ReviewStatus} status - The current moderation status of the review.
 */
function ReviewModerationBadge({ status }: { status: ReviewStatus }) {
  // Retrieve the configuration object based on the status prop
  const config = statusConfig[status];

  // Return the Badge component with mapped styles and label
  return (
    <Badge className={`${config.className} hover:${config.className}`}>
      {config.label}
    </Badge>
  );
}

export default ReviewModerationBadge;
