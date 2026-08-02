import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

// Components
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import MainLayout from '@/components/layout/MainLayout';
import Breadcrumb from '@/components/common/Breadcrumb';

// Features
import ProductImageGallery from '@/features/product/components/ProductImageGallery';
import VariantSelector from '@/features/product/components/VariantSelector';
import WishlistButton from '@/features/wishlist/components/WishlistButton';
import ProductReviewSection from '@/features/review/components/ProductReviewSection';

// Store & Utils
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCartThunk } from '@/features/cart/cartSlice';
import {
  fetchProductById,
  clearCurrentProduct,
} from '@/features/product/productSlice';
import {
  findMatchingVariant,
  extractAttributeGroups,
} from '@/features/product/utils/variantMatcher';
import { formatCurrency } from '@/utils/formatCurrency';

/**
 * ProductDetailPage Component
 *
 * Orchestrates the full product view experience:
 * 1. Fetches product data via slug.
 * 2. Manages variant selection (attribute groups).
 * 3. Handles quantity input and adding items to the Redux cart state.
 * 4. Displays product information, images, reviews, and related meta-data.
 */
function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const { current: product, currentStatus } = useAppSelector(
    (state) => state.product
  );

  // --- Local State ---
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(
    {}
  );
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // --- Lifecycle: Data Fetching ---
  useEffect(() => {
    if (slug) dispatch(fetchProductById(slug));

    // Cleanup to prevent stale product data appearing on next navigation
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [slug, dispatch]);

  // --- Derived State: Variants ---
  const activeVariants = useMemo(
    () => product?.variants.filter((v) => v.isActive) ?? [],
    [product]
  );

  // --- Auto-Selection Pattern ---
  // Tracks the previous active variants to trigger a state update when the product loads.
  // This automatically selects the first available variant options.
  const [prevActiveVariants, setPrevActiveVariants] = useState(activeVariants);

  if (activeVariants !== prevActiveVariants) {
    setPrevActiveVariants(activeVariants);
    if (activeVariants.length > 0) {
      const groups = extractAttributeGroups(activeVariants);
      const firstSelection: Record<string, string> = {};
      Object.entries(groups).forEach(([name, values]) => {
        if (values[0]) firstSelection[name] = values[0];
      });
      setSelectedAttrs(firstSelection);
    }
  }

  // Memoize the selected variant for performance
  const selectedVariant = useMemo(
    () => findMatchingVariant(activeVariants, selectedAttrs),
    [activeVariants, selectedAttrs]
  );

  // --- Event Handlers ---
  const handleAttrChange = (attrName: string, value: string) => {
    setSelectedAttrs((prev) => ({ ...prev, [attrName]: value }));
    setQuantity(1); // Reset quantity when variant changes
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || !product) return;

    setIsAddingToCart(true);
    try {
      await dispatch(
        addToCartThunk({
          productId: product._id,
          variantId: selectedVariant._id,
          quantity,
        })
      ).unwrap();
      toast.success('Đã thêm vào giỏ hàng');
    } catch (err) {
      if ((err as string)?.trim()) toast.error(err as string);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // --- Conditional Rendering: Loading ---
  if (currentStatus === 'loading' || currentStatus === 'idle') {
    return (
      <MainLayout>
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Skeleton className="aspect-square" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // --- Conditional Rendering: Not Found ---
  if (!product) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">
            Không tìm thấy sản phẩm
          </h1>
        </div>
      </MainLayout>
    );
  }

  // --- Data Preparation for UI ---
  const displayImages = selectedVariant?.images.length
    ? selectedVariant.images
    : product.images;
  const displayPrice = selectedVariant?.price ?? product.minPrice;
  const displayComparePrice = selectedVariant?.comparePrice;
  const displayStock = selectedVariant?.stock ?? 0;
  const categoryData =
    typeof product.category === 'object' ? product.category : null;

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {categoryData && (
          <Breadcrumb ancestors={[]} currentName={product.name} />
        )}

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left: Product Images */}
          <ProductImageGallery images={displayImages} />

          {/* Right: Product Info & Actions */}
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">
              {product.name}
            </h1>
            <WishlistButton productId={product._id} size={22} />

            {/* Rating & Sales Stats */}
            <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
              {product.rating.count > 0 && (
                <span className="flex items-center gap-1">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  {product.rating.average.toFixed(1)} ({product.rating.count}{' '}
                  đánh giá)
                </span>
              )}
              {product.soldCount > 0 && <span>Đã bán {product.soldCount}</span>}
            </div>

            {/* Pricing */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl font-bold text-[#0047AB]">
                {formatCurrency(displayPrice)}
              </span>
              {displayComparePrice && displayComparePrice > displayPrice && (
                <span className="text-gray-400 line-through">
                  {formatCurrency(displayComparePrice)}
                </span>
              )}
            </div>

            {/* Variant Selection */}
            {activeVariants.length > 0 && (
              <div className="mt-6">
                <VariantSelector
                  variants={activeVariants}
                  selected={selectedAttrs}
                  onChange={handleAttrChange}
                />
              </div>
            )}

            {/* Stock Availability */}
            <div className="mt-6">
              {selectedVariant ? (
                <p className="text-sm text-gray-600">
                  Còn <span className="font-medium">{displayStock}</span> sản
                  phẩm
                </p>
              ) : (
                <p className="text-sm text-red-500">
                  Tổ hợp này hiện không có sẵn
                </p>
              )}
            </div>

            {/* Quantity Controls & Add to Cart */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center rounded-md border border-gray-200">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 text-gray-500 hover:bg-gray-50"
                >
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(displayStock, q + 1))
                  }
                  disabled={quantity >= displayStock}
                  className="p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                >
                  <Plus size={16} />
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={
                  !selectedVariant || displayStock === 0 || isAddingToCart
                }
                className="flex-1 bg-[#0047AB] hover:bg-[#003a8c]"
              >
                {isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ'}
              </Button>
            </div>
          </div>
        </div>

        {/* Product Description */}
        {product.description && (
          <div className="mt-12 border-t border-gray-100 pt-8">
            <h2 className="mb-4 text-lg font-bold text-[#1A1A1A]">
              Mô tả sản phẩm
            </h2>
            <p className="whitespace-pre-line text-gray-600">
              {product.description}
            </p>
          </div>
        )}

        {/* Reviews */}
        {product && <ProductReviewSection productId={product._id} />}
      </div>
    </MainLayout>
  );
}

export default ProductDetailPage;
