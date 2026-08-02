/**
 * src/features/cart/components/CartItemRow.tsx
 *
 * Renders an individual row in the cart table.
 * It manages individual item state (quantity updates/deletion)
 * by dispatching actions to the Redux store.
 */

// --- Imports ---
// React & Core Hooks
import { useState } from 'react';

// Routing
import { Link } from 'react-router-dom';

// UI Components & Icons
import { Minus, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// State & Redux Actions
import { useAppDispatch } from '@/store/hooks';
import {
  updateCartItemThunk,
  removeCartItemThunk,
} from '@/features/cart/cartSlice';

// Utilities & Constants
import { formatCurrency } from '@/utils/formatCurrency';
import { buildProductUrl } from '@/constants/routes';

// Types
import type { CartItemResult } from '@/types/cart.types';

interface CartItemRowProps {
  item: CartItemResult;
  productSlug?: string; // Optional slug for navigation to product details
}

function CartItemRow({ item, productSlug }: CartItemRowProps) {
  const dispatch = useAppDispatch();

  // Local state to manage loading UI while the API request is in-flight
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Handles quantity adjustments (+ / -).
   * Prevents updates if the new quantity is invalid (out of stock or < 1).
   */
  const handleQuantityChange = async (newQty: number) => {
    // Basic guard: Prevent quantity from going below 1 or exceeding stock
    if (newQty < 1 || newQty > item.stock) return;

    setIsUpdating(true);
    try {
      // unwrap() allows us to catch the rejected thunk payload directly as an error
      await dispatch(
        updateCartItemThunk({
          variantId: item.variantId,
          payload: { quantity: newQty },
        })
      ).unwrap();
    } catch (err) {
      if ((err as string)?.trim()) toast.error(err as string);
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Triggers the deletion thunk and provides feedback to the user.
   */
  const handleRemove = async () => {
    try {
      await dispatch(removeCartItemThunk(item.variantId)).unwrap();
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (err) {
      if ((err as string)?.trim()) toast.error(err as string);
    }
  };

  return (
    <div className="flex items-center gap-4 border-b border-gray-100 py-4">
      {/* Product Image Section */}
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      {/* Product Info Section */}
      <div className="flex-1">
        {productSlug ? (
          <Link
            to={buildProductUrl(productSlug)}
            className="font-medium text-[#1A1A1A] hover:text-[#0047AB]"
          >
            {item.name}
          </Link>
        ) : (
          <p className="font-medium text-[#1A1A1A]">{item.name}</p>
        )}
        <p className="mt-0.5 text-xs text-gray-400">SKU: {item.sku}</p>

        {/* Out-of-stock Warning */}
        {!item.isAvailable && (
          <p className="mt-1 text-sm text-red-500">Sản phẩm hiện đã hết hàng</p>
        )}

        <p className="mt-1 font-medium text-[#0047AB]">
          {formatCurrency(item.price)}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center rounded-md border border-gray-200">
        <button
          type="button"
          onClick={() => handleQuantityChange(item.quantity - 1)}
          // Disable button during network request or if at minimum quantity
          disabled={isUpdating || item.quantity <= 1}
          className="p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
        >
          <Minus size={14} />
        </button>
        <span className="w-8 text-center text-sm">{item.quantity}</span>
        <button
          type="button"
          onClick={() => handleQuantityChange(item.quantity + 1)}
          // Disable if at stock limit
          disabled={isUpdating || item.quantity >= item.stock}
          className="p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Subtotal Display */}
      <p className="w-28 text-right font-medium text-[#1A1A1A]">
        {formatCurrency(item.subtotal)}
      </p>

      {/* Delete Action */}
      <button
        type="button"
        onClick={handleRemove}
        className="rounded-md p-2 text-red-400 hover:bg-red-50"
        title="Xóa"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}

export default CartItemRow;
