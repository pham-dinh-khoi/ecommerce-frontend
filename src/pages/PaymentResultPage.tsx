import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

// Components & Layout
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';

// Features & Services
import { paymentService } from '@/features/payment/paymentService';
import { fetchCart } from '@/features/cart/cartSlice';

// Constants & Types
import { buildOrderDetailUrl } from '@/constants/routes';
import { useAppDispatch } from '@/store/hooks';
import type { PaymentStatusResult } from '@/types/payment.types';

import { clearPendingOrder } from '@/lib/pendingOrder';

/**
 * PaymentResultPage
 *
 * Handles the landing page after a payment redirect.
 * It serves two purposes:
 * 1. Immediate feedback based on URL query parameters (e.g., success, failed, cancelled).
 * 2. Fallback verification: If the status isn't explicit in the URL, it polls the
 *    backend API to confirm the actual payment status.
 */
function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const urlStatus = searchParams.get('status');
  const dispatch = useAppDispatch();

  // 'checking' is the initial state while waiting for the API confirmation
  const [apiStatus, setApiStatus] = useState<'checking' | 'success' | 'failed'>(
    'checking'
  );
  const [result, setResult] = useState<PaymentStatusResult | null>(null);

  // Ref to prevent duplicate API calls on re-renders
  const hasCheckedRef = useRef(false);

  // Refresh cart state upon mounting to reflect any order changes
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    clearPendingOrder(); // Clean up as soon as you reach the results page — whether successful or not, consider it "done".
    // If the URL already provides a definitive status, skip the API call.
    if (
      urlStatus === 'cancelled' ||
      urlStatus === 'failed' ||
      urlStatus === 'success' ||
      hasCheckedRef.current ||
      !orderId
    )
      return;

    hasCheckedRef.current = true;

    // Simulate a short delay for UX purposes and fetch payment status
    const timer = setTimeout(() => {
      paymentService
        .checkStatus(orderId)
        .then((res) => {
          setResult(res.data);
          setApiStatus(
            res.data.paymentStatus === 'paid' ? 'success' : 'failed'
          );
        })
        .catch(() => setApiStatus('failed'));
    }, 1500);

    return () => clearTimeout(timer);
  }, [orderId, urlStatus]);

  // Derived state to determine which UI component to render
  const status =
    urlStatus === 'cancelled'
      ? 'cancelled'
      : urlStatus === 'failed'
        ? 'failed'
        : urlStatus === 'success'
          ? 'success'
          : apiStatus;

  return (
    <MainLayout>
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        {/* Loading / Checking State */}
        {status === 'checking' && (
          <>
            <Loader2
              size={48}
              className="mx-auto animate-spin text-[#0047AB]"
            />
            <h1 className="mt-4 text-xl font-bold text-[#1A1A1A]">
              Đang xác nhận thanh toán...
            </h1>
            <p className="mt-2 text-gray-500">Vui lòng đợi trong giây lát</p>
          </>
        )}

        {/* Success State */}
        {status === 'success' && (
          <>
            <CheckCircle2 size={48} className="mx-auto text-green-500" />
            <h1 className="mt-4 text-xl font-bold text-[#1A1A1A]">
              Thanh toán thành công!
            </h1>
            <p className="mt-2 text-gray-500">
              Đơn hàng {result?.orderCode ?? orderId} đã được xác nhận
            </p>
            {orderId && (
              <Button
                render={
                  <Link
                    to={buildOrderDetailUrl(result?.orderCode ?? orderId)}
                  />
                }
                className="mt-6 bg-[#0047AB] hover:bg-[#003a8c]"
              >
                Xem đơn hàng
              </Button>
            )}
          </>
        )}

        {/* Payment Failed State */}
        {status === 'failed' && (
          <>
            <XCircle size={48} className="mx-auto text-red-500" />
            <h1 className="mt-4 text-xl font-bold text-[#1A1A1A]">
              Thanh toán không thành công
            </h1>
            <p className="mt-2 text-gray-500">
              Đơn hàng có thể chưa được thanh toán, vui lòng thử lại
            </p>
            {orderId && (
              <Link
                to={buildOrderDetailUrl(orderId)}
                className="mt-6 inline-block text-[#0047AB] hover:underline"
              >
                Xem chi tiết đơn hàng
              </Link>
            )}
          </>
        )}

        {/* Cancellation State */}
        {status === 'cancelled' && (
          <>
            <XCircle size={48} className="mx-auto text-gray-400" />
            <h1 className="mt-4 text-xl font-bold text-[#1A1A1A]">
              Đã hủy thanh toán
            </h1>
            <p className="mt-2 text-gray-500">
              Đơn hàng vẫn được lưu, bạn có thể thanh toán lại sau
            </p>
            {orderId && (
              <Link
                to={buildOrderDetailUrl(orderId)}
                className="mt-6 inline-block text-[#0047AB] hover:underline"
              >
                Xem chi tiết đơn hàng
              </Link>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}

export default PaymentResultPage;
