import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ProductVariant } from '@/types/product.types';

// =============================================================================
// Interfaces
// =============================================================================

interface VariantListProps {
  /** List of variant objects to display */
  variants: ProductVariant[];
  /** Callback triggered when the delete button is clicked */
  onDelete: (variantId: string) => void;
  /** Optional ID of the item currently being deleted to handle loading states */
  isDeleting?: string | null;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Formats a raw number into a Vietnamese currency string (e.g., 1.000.000₫)
 */
function formatCurrency(value: number): string {
  return value.toLocaleString('vi-VN') + '₫';
}

// =============================================================================
// Component
// =============================================================================

/**
 * VariantList Component
 *
 * Displays a list of product variants. It handles three primary states:
 * 1. Empty state: Shows a placeholder message.
 * 2. List view: Maps through variants showing image, SKU, status, price, and stock.
 * 3. Deletion state: Disables buttons when an item is currently being removed.
 */
function VariantList({ variants, onDelete, isDeleting }: VariantListProps) {
  // 1. Handle Empty State
  // Provides visual feedback to the user when no variants are configured yet.
  if (variants.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 py-10 text-center text-gray-400">
        Chưa có biến thể nào. Thêm biến thể đầu tiên bên dưới.
      </div>
    );
  }

  // 2. Render List
  return (
    <div className="space-y-3">
      {variants.map((variant) => (
        <div
          key={variant._id}
          className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-3"
        >
          {/* Variant Thumbnail */}
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
            {variant.images[0] ? (
              <img
                src={variant.images[0].url}
                alt={variant.sku}
                className="h-full w-full object-cover"
              />
            ) : (
              // Fallback for variants without images
              <div className="flex h-full w-full items-center justify-center text-xs text-gray-300">
                Không ảnh
              </div>
            )}
          </div>

          {/* Variant Information */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#1A1A1A]">{variant.sku}</span>

              {/* Status Badge: Logic based on isActive flag */}
              {variant.isActive ? (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  Hoạt động
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-500"
                >
                  Đã ẩn
                </Badge>
              )}
            </div>

            {/* Attributes Display */}
            <p className="mt-0.5 text-sm text-gray-500">
              {variant.attributes
                .map((a) => `${a.name}: ${a.value}`)
                .join(' • ')}
            </p>

            {/* Pricing and Stock Info */}
            <p className="mt-0.5 text-sm">
              <span className="font-medium text-[#0047AB]">
                {formatCurrency(variant.price)}
              </span>

              {/* Show original price only if comparePrice exists */}
              {variant.comparePrice && (
                <span className="ml-2 text-gray-400 line-through">
                  {formatCurrency(variant.comparePrice)}
                </span>
              )}

              <span className="ml-3 text-gray-500">
                Tồn kho: {variant.stock}
              </span>
            </p>
          </div>

          {/* Action: Delete Button */}
          <button
            type="button"
            onClick={() => onDelete(variant._id)}
            disabled={isDeleting === variant._id}
            className="shrink-0 rounded-md p-2 text-red-500 hover:bg-red-50 disabled:opacity-50"
            title="Xóa biến thể"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default VariantList;
