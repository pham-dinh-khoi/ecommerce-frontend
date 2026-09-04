import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

// --- Internal Utilities & Types ---
import { buildProductUrl } from '@/constants/routes';
import { formatCurrency } from '@/utils/formatCurrency';
import type { SearchResultItem } from '@/types/search.types';

interface SearchResultCardProps {
  product: SearchResultItem;
}

/**
 * SearchResultCard component displays a summary of a product.
 * It features a clickable link, primary image handling, responsive text clamping,
 * dynamic pricing, and optional rating/sales indicators.
 */
function SearchResultCard({ product }: SearchResultCardProps) {
  // Determine the primary image: use the one marked 'isPrimary' or default to the first available index.
  const primaryImage =
    product.images.find((img) => img.isPrimary) ?? product.images[0];

  return (
    <Link
      to={buildProductUrl(product.slug)}
      className="group block overflow-hidden rounded-lg border border-gray-100 bg-white transition-shadow hover:shadow-md"
    >
      {/* Product Image Section */}
      <div className="aspect-square overflow-hidden bg-gray-50">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          // Fallback UI if no image is available
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            Không có ảnh
          </div>
        )}
      </div>

      {/* Product Info Section */}
      <div className="p-3">
        {/* Title with line clamping; min-h-10 reserves the full 2-line height
            so 1-line titles don't leave the card shorter than its neighbors. */}
        <h3 className="line-clamp-2 min-h-10 text-sm font-medium text-[#1A1A1A]">
          {product.name}
        </h3>

        {/* Pricing Logic: Show range if min and max price differ, otherwise show single price */}
        <p className="mt-1.5 font-semibold text-[#0047AB]">
          {product.minPrice === product.maxPrice
            ? formatCurrency(product.minPrice)
            : `${formatCurrency(product.minPrice)} - ${formatCurrency(product.maxPrice)}`}
        </p>

        {/* Rating and Sales Count: row height is always reserved (min-h-4) so
            products without a rating don't render a shorter card. */}
        <div className="mt-1 flex min-h-4 items-center gap-1 text-xs text-gray-500">
          {product.rating.count > 0 && (
            <>
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              <span>{product.rating.average.toFixed(1)}</span>

              {/* Display sold count if it exists */}
              {product.soldCount > 0 && (
                <span className="ml-1">· Đã bán {product.soldCount}</span>
              )}
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export default SearchResultCard;
