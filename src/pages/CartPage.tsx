/**
 * @file CartPage.tsx
 * @description The main Shopping Cart page. Handles displaying cart items,
 * calculating total price, applying coupons, and gating the checkout process
 * with authentication checks.
 */

// --- Imports ---
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import MainLayout from '@/components/layout/MainLayout';

// Feature Components
import CartItemRow from '@/features/cart/components/CartItemRow';

// State & Logic
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCart } from '@/features/cart/cartSlice';
import { clearAppliedCoupon } from '@/features/coupon/couponSlice';

// Utils & Constants
import { formatCurrency } from '@/utils/formatCurrency';
import { ROUTES } from '@/constants/routes';

/**
 * CartPage Component
 *
 * Orchestrates the shopping cart flow. It provides feedback when the cart is empty
 * or loading, calculates real-time discounts, and protects the checkout route
 * using an authentication dialog.
 */
function CartPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Redux Selectors
  const { cart, status } = useAppSelector((state) => state.cart);
  const { appliedCoupon } = useAppSelector((state) => state.coupon);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Local UI State
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // --- Effects ---

  // Initial data fetch
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Cleanup: Clear coupon state when leaving the cart page
  // to ensure a fresh state for subsequent checkout flows.
  useEffect(() => {
    return () => {
      dispatch(clearAppliedCoupon());
    };
  }, [dispatch]);

  // --- Calculations ---
  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const finalTotal = (cart?.totalAmount ?? 0) - discountAmount;
  const hasUnavailableItems = cart?.items.some((i) => !i.isAvailable);

  // --- Handlers ---

  /**
   * Checks for user authentication before proceeding to checkout.
   * If not logged in, it triggers the auth dialog instead of navigating.
   */
  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    navigate(ROUTES.CHECKOUT);
  };

  // --- Conditional Rendering ---

  // 1. Loading State
  if (status === 'loading' || status === 'idle') {
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

  // 2. Empty Cart State
  if (!cart || cart.items.length === 0) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-5xl px-4 py-20 text-center">
          <ShoppingBag size={48} className="mx-auto text-gray-300" />
          <h1 className="mt-4 text-xl font-bold text-[#1A1A1A]">
            Giỏ hàng trống
          </h1>
          <p className="mt-2 text-gray-500">
            Hãy khám phá và thêm sản phẩm bạn yêu thích
          </p>
          <Link
            to={ROUTES.HOME}
            className="mt-6 inline-block rounded-md bg-[#0047AB] px-6 py-2 text-white hover:bg-[#003a8c]"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </MainLayout>
    );
  }

  // 3. Populated Cart State
  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Giỏ hàng của bạn</h1>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          {/* Items List */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            {cart.items.map((item) => (
              <CartItemRow key={item.variantId} item={item} />
            ))}
          </div>

          {/* Checkout Summary */}
          <div className="h-fit rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="font-semibold text-[#1A1A1A]">Tóm tắt đơn hàng</h2>

            <div className="mt-4 flex justify-between text-sm text-gray-600">
              <span>Tạm tính ({cart.totalItems} sản phẩm)</span>
              <span>{formatCurrency(cart.totalAmount)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="mt-2 flex justify-between text-sm text-green-600">
                <span>Giảm giá</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}

            <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 font-semibold text-[#1A1A1A]">
              <span>Tổng cộng</span>
              <span className="text-[#0047AB]">
                {formatCurrency(finalTotal)}
              </span>
            </div>

            {hasUnavailableItems && (
              <p className="mt-3 text-xs text-red-500">
                Một số sản phẩm đã hết hàng, vui lòng xóa trước khi thanh toán
              </p>
            )}

            <Button
              onClick={handleCheckoutClick}
              disabled={hasUnavailableItems}
              className="mt-4 w-full bg-[#0047AB] hover:bg-[#003a8c]"
            >
              Tiến hành thanh toán →
            </Button>
          </div>
        </div>
      </div>

      {/* Auth Gate Dialog */}
      <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Đăng nhập để tiếp tục</AlertDialogTitle>
            <AlertDialogDescription>
              Vui lòng đăng nhập hoặc tạo tài khoản để hoàn tất đơn hàng của
              bạn. Giỏ hàng của bạn sẽ được giữ nguyên.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Để sau</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => navigate(ROUTES.LOGIN)}
              className="bg-[#0047AB] hover:bg-[#003a8c]"
            >
              Đăng nhập
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}

export default CartPage;
