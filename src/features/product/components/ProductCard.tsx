import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

// Components & Utilities
import { buildProductUrl } from '@/constants/routes';
import { formatCurrency } from '@/utils/formatCurrency';
import WishlistButton from '@/features/wishlist/components/WishlistButton';

// Types
import type { ProductCardData } from '@/types/product.types';

// ==========================================
// Types & Interfaces
// ==========================================

interface ProductCardProps {
  product: ProductCardData;
}

// ==========================================
// Component
// ==========================================

/**
 * ProductCard
 * A reusable display component for product thumbnails in a grid.
 * It calculates derived state (discounts, primary images) on-the-fly.
 */
function ProductCard({ product }: ProductCardProps) {
  // --- Data Preparation (Derived State) ---

  /**
   * Determine the primary image for the card.
   * Logic: Use the explicitly marked primary image, or fallback to the first available image.
   * This ensures the card always has a visual, even if data is incomplete.
   */
  const primaryImage =
    product.images.find((img) => img.isPrimary) ?? product.images[0];

  /**
   * Determine if any variant has a discount.
   * Used to conditionally render the discount badge.
   */
  const hasDiscount = product.variants.some(
    (v) => v.comparePrice && v.comparePrice > v.price
  );

  /**
   * Calculate the maximum discount percentage for the badge.
   * We filter for discounted items and map them to percentage values,
   * then take the maximum to highlight the best deal.
   */
  const maxDiscountPercent = hasDiscount
    ? Math.max(
        ...product.variants
          .filter((v) => v.comparePrice && v.comparePrice > v.price)
          .map((v) => Math.round((1 - v.price / v.comparePrice!) * 100))
      )
    : 0;

  // --- Render ---
  return (
    <Link
      to={buildProductUrl(product.slug)}
      className="group block overflow-hidden rounded-lg border border-gray-100 bg-white transition-shadow hover:shadow-md"
    >
      {/* Product Image Area */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            Không có ảnh
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
            -{maxDiscountPercent}%
          </span>
        )}
      </div>

      {/* Wishlist Action */}
      <div className="absolute right-2 top-2">
        <WishlistButton productId={product._id} size={16} />
      </div>

      {/* Product Info Section */}
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-[#1A1A1A]">
          {product.name}
        </h3>

        {/* Price Display: Handles single price vs. price range */}
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="font-semibold text-[#0047AB]">
            {product.minPrice === product.maxPrice
              ? formatCurrency(product.minPrice)
              : `${formatCurrency(product.minPrice)} - ${formatCurrency(product.maxPrice)}`}
          </span>
        </div>

        {/* Rating and Sales Metadata */}
        {product.rating.count > 0 && (
          <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            <span>{product.rating.average.toFixed(1)}</span>
            <span>({product.rating.count})</span>
            {product.soldCount > 0 && (
              <span className="ml-1">· Đã bán {product.soldCount}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

export default ProductCard;
