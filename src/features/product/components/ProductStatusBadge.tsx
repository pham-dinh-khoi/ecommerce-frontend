import { Badge } from '@/components/ui/badge';
import type { ProductStatus } from '@/types/product.types';

// =============================================================================
// Configuration
// =============================================================================

/**
 * Maps product status keys to their respective display labels and Tailwind classes.
 * This acts as the "Single Source of Truth" for how statuses appear in the UI.
 */
const statusConfig: Record<
  ProductStatus,
  { label: string; className: string }
> = {
  draft: { label: 'Nháp', className: 'bg-gray-100 text-gray-500' },
  active: { label: 'Đang bán', className: 'bg-green-100 text-green-700' },
  inactive: { label: 'Ngừng bán', className: 'bg-yellow-100 text-yellow-700' },
  archived: { label: 'Lưu trữ', className: 'bg-red-100 text-red-600' },
};

// =============================================================================
// Component
// =============================================================================

interface ProductStatusBadgeProps {
  /** The current status key to be displayed */
  status: ProductStatus;
}

/**
 * ProductStatusBadge Component
 *
 * Renders a color-coded badge based on the provided product status.
 * It automatically looks up the label and styling from the `statusConfig` object.
 */
function ProductStatusBadge({ status }: ProductStatusBadgeProps) {
  // Retrieve the configuration object based on the status prop
  const config = statusConfig[status];

  // Return the Badge component with mapped styles.
  // Note: We force the hover state to match the base state to maintain consistent
  // styling across different status types.
  return (
    <Badge className={`${config.className} hover:${config.className}`}>
      {config.label}
    </Badge>
  );
}

export default ProductStatusBadge;
