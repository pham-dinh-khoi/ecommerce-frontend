import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleWishlistThunk } from '@/features/wishlist/wishlistSlice';
import { ROUTES } from '@/constants/routes';

interface WishlistButtonProps {
  productId: string;
  size?: number;
  className?: string;
}

/**
 * WishlistButton
 *
 * A UI component that allows users to toggle the "wishlist" status of a product.
 * It handles authentication checks, API state updates via Redux, and user feedback.
 */
function WishlistButton({
  productId,
  size = 20,
  className = '',
}: WishlistButtonProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Select state from Redux store
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { productIds } = useAppSelector((state) => state.wishlist);

  // Derive state to check if current product is in the wishlist
  const isWishlisted = productIds.includes(productId);

  /**
   * Handles button interaction.
   * Prevents event bubbling to avoid triggering parent Link components
   * (e.g., in a ProductCard).
   */
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Authentication Gate
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để lưu sản phẩm yêu thích');
      navigate(ROUTES.LOGIN);
      return;
    }

    // 2. Async API Call
    try {
      const result = await dispatch(toggleWishlistThunk(productId)).unwrap();

      // 3. User Feedback
      toast.success(
        result.added ? 'Đã thêm vào yêu thích' : 'Đã bỏ khỏi yêu thích'
      );
    } catch (err) {
      // Basic error handling for UI feedback
      if ((err as string)?.trim()) toast.error(err as string);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`rounded-full p-2 transition-colors ${
        isWishlisted
          ? 'bg-red-50 text-red-500 hover:bg-red-100'
          : 'bg-white/80 text-gray-400 hover:text-red-500'
      } ${className}`}
      title={isWishlisted ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
    >
      {/* 
        The 'fill' property is controlled by isWishlisted to provide 
        visual confirmation of the active state.
      */}
      <Heart size={size} fill={isWishlisted ? 'currentColor' : 'none'} />
    </button>
  );
}

export default WishlistButton;
