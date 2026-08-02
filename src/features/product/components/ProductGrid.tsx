import ProductCard from './ProductCard';
import type { ProductCardData } from '@/types/product.types';

// ==========================================
// Types & Interfaces
// ==========================================

interface ProductGridProps {
  /** Array of product data objects to be rendered */
  products: ProductCardData[];
}

// ==========================================
// Component
// ==========================================

/**
 * A responsive grid display component for rendering a list of product cards.
 *
 * Features:
 * - Empty state handling when no products are provided.
 * - Responsive grid layout (2 columns mobile, 3 tablet, 4 desktop).
 *
 * @param {ProductCardData[]} products - The list of products to display.
 */
function ProductGrid({ products }: ProductGridProps) {
  // Handle empty state explicitly to improve UX
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 py-16 text-center text-gray-400">
        Không tìm thấy sản phẩm nào phù hợp
      </div>
    );
  }

  // Render the grid when products are available
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}

export default ProductGrid;
