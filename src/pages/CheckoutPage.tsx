/**
 * @file CheckoutPage.tsx
 * @description Manages the checkout process, including address selection,
 * payment method selection, order calculation, and final order placement.
 */

// --- Imports ---
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Components
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import MainLayout from '@/components/layout/MainLayout';
import AddressSelector from '@/features/order/components/AddressSelector';
import CouponInput from '@/features/coupon/components/CouponInput';

// State & Logic
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCart, clearCartLocal } from '@/features/cart/cartSlice';
import { fetchProfile } from '@/features/user/userSlice';
import { placeOrderThunk } from '@/features/order/orderSlice';
import { clearAppliedCoupon } from '@/features/coupon/couponSlice';
import { paymentService } from '@/features/payment/paymentService';

// Utils & Constants
import { formatCurrency } from '@/utils/formatCurrency';
import { ROUTES, buildOrderDetailUrl } from '@/constants/routes';
import type { PaymentMethod, NewAddressInput } from '@/types/order.types';

import {
  savePendingOrder,
  getPendingOrder,
  clearPendingOrder,
} from '@/lib/pendingOrder';
import { orderService } from '@/features/order/orderService';

// --- Constants ---
const paymentOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'cod', label: 'Thanh toán khi nhận hàng (COD)' },
  { value: 'paypal', label: 'Paypal' },
];

const SHIPPING_FEE = 30000;

/**
 * CheckoutPage Component
 *
 * Handles user interaction for completing an order.
 * Orchestrates API calls for profile/cart data and payment initiation.
 */
function CheckoutPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Redux States
  const { cart, status: cartStatus } = useAppSelector((state) => state.cart);
  const { profile } = useAppSelector((state) => state.user);
  const { appliedCoupon } = useAppSelector((state) => state.coupon);

  // Component Local States
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [newAddress, setNewAddress] = useState<NewAddressInput | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // --- Initialization ---
  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // The page is retrieved from bfcache (e.g., by pressing Back) — this resets the loading state.
        setIsRedirecting(false);
        setIsSubmitting(false);

        const pendingOrderId = getPendingOrder();

        if (pendingOrderId) {
          clearPendingOrder(); // Delete immediately to avoid repeated calls if the pageshow is sent multiple times.
          orderService
            .cancel(pendingOrderId, {
              reason: 'User navigated back from payment gateway',
            })
            .then(() => {
              dispatch(fetchCart()); // Resynchronize the shopping cart (even though it's empty and nothing has been changed in the cart).
              toast.info('Đơn hàng chưa thanh toán đã được hủy tự động');
            })
            .catch(() => {
              // Be silent if an error occurs — the order may have been processed by another thread (e.g., Webhook).
              // (payment confirmed successfully previously), no need for confusing error messages.
            });
        }
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [dispatch]);

  // Derived state to sync address selection when profile loads
  const [prevProfile, setPrevProfile] = useState(profile);
  if (profile !== prevProfile) {
    setPrevProfile(profile);
    if (profile?.addresses && !selectedAddressId) {
      const defaultAddr = profile.addresses.find((a) => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr._id);
    }
  }

  // --- Calculations ---
  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const finalTotal = (cart?.totalAmount ?? 0) + SHIPPING_FEE - discountAmount;

  // --- Handlers ---
  const handlePlaceOrder = async () => {
    // 1. Validation Logic
    if (!selectedAddressId && !newAddress) {
      toast.error('Vui lòng chọn hoặc nhập địa chỉ giao hàng');
      return;
    }
    if (
      newAddress &&
      (!newAddress.recipientName ||
        !newAddress.recipientPhone ||
        !newAddress.province ||
        !newAddress.streetAddress)
    ) {
      toast.error('Vui lòng điền đầy đủ thông tin địa chỉ mới');
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. Submit Order to Backend
      const order = await dispatch(
        placeOrderThunk({
          ...(newAddress ? { newAddress } : { addressId: selectedAddressId! }),
          paymentMethod,
          ...(appliedCoupon && { couponCode: appliedCoupon.code }),
          ...(note.trim() && { note: note.trim() }),
        })
      ).unwrap();

      // 3. Payment Processing
      if (paymentMethod === 'paypal') {
        setIsRedirecting(true);

        savePendingOrder(order._id); // Save this IMMEDIATELY BEFORE leaving the page.

        const paymentResult = await paymentService.initiate(
          order._id,
          paymentMethod
        );

        // Clear local state only right before leaving the page
        dispatch(clearCartLocal());
        dispatch(clearAppliedCoupon());
        window.location.href = paymentResult.data.paymentUrl;
        return;
      }

      // 4. Default Success Handling (COD)
      clearPendingOrder();
      dispatch(clearCartLocal()); // Please ensure there is no remaining balance from your previous PayPal payment (if any).
      dispatch(clearAppliedCoupon());
      toast.success('Đặt hàng thành công!');
      navigate(buildOrderDetailUrl(order.orderCode));
    } catch (err) {
      if ((err as string)?.trim()) toast.error(err as string);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Conditional Rendering ---

  // 1. Redirecting View
  if (isRedirecting) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <Loader2 size={48} className="mx-auto animate-spin text-[#0047AB]" />
          <h1 className="mt-4 text-xl font-bold text-[#1A1A1A]">
            Đang chuyển sang cổng thanh toán...
          </h1>
          <p className="mt-2 text-gray-500">Vui lòng đợi trong giây lát</p>
        </div>
      </MainLayout>
    );
  }

  // 2. Loading State
  if (cartStatus === 'loading' || cartStatus === 'idle' || !profile) {
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

  // 3. Empty Cart State
  if (!cart || cart.items.length === 0) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-5xl px-4 py-20 text-center">
          <h1 className="text-xl font-bold text-[#1A1A1A]">Giỏ hàng trống</h1>
          <p className="mt-2 text-gray-500">Không có gì để thanh toán</p>
          <Button
            onClick={() => navigate(ROUTES.HOME)}
            className="mt-4 bg-[#0047AB] hover:bg-[#003a8c]"
          >
            Về trang chủ
          </Button>
        </div>
      </MainLayout>
    );
  }

  // 4. Main Checkout View
  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Thanh toán</h1>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          {/* Left Column: Input Forms */}
          <div className="space-y-6">
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="mb-3 font-semibold text-[#1A1A1A]">
                Địa chỉ giao hàng
              </h2>
              <AddressSelector
                addresses={profile.addresses}
                selectedAddressId={selectedAddressId}
                onSelectAddress={setSelectedAddressId}
                newAddress={newAddress}
                onNewAddressChange={setNewAddress}
              />
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="mb-3 font-semibold text-[#1A1A1A]">
                Phương thức thanh toán
              </h2>
              <div className="space-y-2">
                {paymentOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${
                      paymentMethod === opt.value
                        ? 'border-[#0047AB] bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === opt.value}
                      onChange={() => setPaymentMethod(opt.value)}
                    />
                    <span className="text-sm text-[#1A1A1A]">{opt.label}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="mb-3 font-semibold text-[#1A1A1A]">
                Ghi chú (tùy chọn)
              </h2>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú cho đơn hàng..."
                rows={2}
              />
            </section>
          </div>

          {/* Right Column: Summary & CTA */}
          <div className="h-fit rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="font-semibold text-[#1A1A1A]">
              Đơn hàng ({cart.totalItems} sản phẩm)
            </h2>

            <div className="mt-4 max-h-64 space-y-3 overflow-y-auto">
              {cart.items.map((item) => (
                <div key={item.variantId} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-gray-100">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="line-clamp-1 text-sm text-[#1A1A1A]">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-gray-100 pt-4">
              <CouponInput />
            </div>

            <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span>{formatCurrency(cart.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span>{formatCurrency(SHIPPING_FEE)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-100 pt-2 font-semibold text-[#1A1A1A]">
                <span>Tổng cộng</span>
                <span className="text-[#0047AB]">
                  {formatCurrency(finalTotal)}
                </span>
              </div>
            </div>

            <Button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="mt-4 w-full bg-[#0047AB] hover:bg-[#003a8c]"
            >
              {isRedirecting
                ? 'Đang chuyển sang cổng thanh toán...'
                : isSubmitting
                  ? 'Đang đặt hàng...'
                  : 'Đặt hàng'}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default CheckoutPage;
