import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';

// Components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import MainLayout from '@/components/layout/MainLayout';

// Features
import OrderStatusBadge from '@/features/order/components/OrderStatusBadge';
import OrderTimeline from '@/features/order/components/OrderTimeline';
import ReviewForm from '@/features/review/components/ReviewForm';
import {
  fetchOrderById,
  cancelOrderThunk,
  clearCurrentOrder,
} from '@/features/order/orderSlice';

// Store & Utils
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { formatCurrency } from '@/utils/formatCurrency';
import { ROUTES, buildProductUrl } from '@/constants/routes';

const paymentMethodLabels: Record<string, string> = {
  cod: 'Thanh toán khi nhận hàng (COD)',
  bank_transfer: 'Chuyển khoản ngân hàng',
  vnpay: 'VNPay',
  momo: 'MoMo',
  stripe: 'Thẻ quốc tế (Stripe)',
  paypal: 'Paypal',
};

/**
 * OrderDetailPage
 *
 * Displays comprehensive details for a specific order, including:
 * - Order status and timeline.
 * - Purchased items with review functionality.
 * - Shipping and payment information.
 * - Order cancellation capability (if eligible).
 */
function OrderDetailPage() {
  const { orderCode } = useParams<{ orderCode: string }>();
  const dispatch = useAppDispatch();
  const { current: order, currentStatus } = useAppSelector(
    (state) => state.order
  );

  const [cancelReason, setCancelReason] = useState('');
  const [reviewingProductId, setReviewingProductId] = useState<string | null>(
    null
  );

  // --- Lifecycle ---
  useEffect(() => {
    if (orderCode) dispatch(fetchOrderById(orderCode));
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [orderCode, dispatch]);

  // --- Handlers ---
  const handleCancel = async () => {
    if (!order || cancelReason.trim().length < 10) {
      toast.error('Lý do hủy cần ít nhất 10 ký tự');
      return;
    }
    try {
      await dispatch(
        cancelOrderThunk({
          orderId: order._id,
          payload: { reason: cancelReason },
        })
      ).unwrap();
      toast.success('Đã hủy đơn hàng');
      setCancelReason('');
    } catch (err) {
      if ((err as string)?.trim()) toast.error(err as string);
    }
  };

  // --- UI Logic Helpers ---
  const isOrderDelivered = order?.status === 'delivered';
  const canCancel = ['pending', 'confirmed'].includes(order?.status ?? '');

  // --- Loading State ---
  if (currentStatus === 'loading' || currentStatus === 'idle') {
    return (
      <MainLayout>
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Skeleton className="aspect-square" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // --- Empty State ---
  if (!order) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h1 className="text-xl font-bold text-[#1A1A1A]">
            Không tìm thấy đơn hàng
          </h1>
          <Link
            to={ROUTES.MY_ORDERS}
            className="mt-4 inline-block text-[#0047AB] hover:underline"
          >
            ← Về lịch sử đơn hàng
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#1A1A1A]">
              Đơn hàng {order.orderCode}
            </h1>
            <p className="text-sm text-gray-500">
              Đặt lúc {new Date(order.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {/* Timeline Section */}
            {order.timeline && (
              <section className="rounded-lg border border-gray-200 bg-white p-5">
                <h2 className="mb-3 font-semibold text-[#1A1A1A]">
                  Trạng thái đơn hàng
                </h2>
                <OrderTimeline timeline={order.timeline} />
              </section>
            )}

            {/* Product List Section */}
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="mb-3 font-semibold text-[#1A1A1A]">Sản phẩm</h2>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.variant} className="flex items-center gap-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <Link
                        to={buildProductUrl(item.product)}
                        className="text-sm font-medium text-[#1A1A1A] hover:text-[#0047AB]"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-gray-400">
                        SKU: {item.sku} · SL: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-[#1A1A1A]">
                      {formatCurrency(item.subtotal)}
                    </p>

                    {/* Review Action */}
                    <div>
                      {isOrderDelivered && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setReviewingProductId(
                              reviewingProductId === item.product
                                ? null
                                : item.product
                            )
                          }
                        >
                          Đánh giá
                        </Button>
                      )}
                    </div>
                    {reviewingProductId === item.product && (
                      <div className="mt-3 w-full">
                        <ReviewForm
                          productId={item.product}
                          productName={item.name}
                          onSuccess={() => setReviewingProductId(null)}
                          onCancel={() => setReviewingProductId(null)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Shipping Info Section */}
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="mb-3 font-semibold text-[#1A1A1A]">
                Địa chỉ giao hàng
              </h2>
              <p className="text-sm text-[#1A1A1A]">
                {order.shipping.recipientName} · {order.shipping.recipientPhone}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {order.shipping.streetAddress}, {order.shipping.ward},{' '}
                {order.shipping.district}, {order.shipping.province}
              </p>
              {order.shipping.trackingCode && (
                <p className="mt-2 text-sm text-gray-600">
                  Vận đơn:{' '}
                  <span className="font-medium">
                    {order.shipping.trackingCode}
                  </span>
                  {order.shipping.carrier && ` (${order.shipping.carrier})`}
                </p>
              )}
            </section>

            {/* Cancellation Notice */}
            {order.cancellation && (
              <section className="rounded-lg border border-red-200 bg-red-50 p-5">
                <h2 className="mb-1 font-semibold text-red-700">
                  Đơn hàng đã hủy
                </h2>
                <p className="text-sm text-red-600">
                  Lý do: {order.cancellation.reason}
                </p>
              </section>
            )}
          </div>

          {/* Sidebar Summary */}
          <div className="h-fit rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="font-semibold text-[#1A1A1A]">Thanh toán</h2>
            <p className="mt-2 text-sm text-gray-600">
              {paymentMethodLabels[order.payment.method] ??
                order.payment.method}
            </p>
            <p className="text-sm text-gray-500">
              Trạng thái:{' '}
              {order.payment.status === 'paid'
                ? 'Đã thanh toán'
                : 'Chưa thanh toán'}
            </p>

            <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span>{formatCurrency(order.shippingFee)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>
                    Giảm giá {order.couponCode && `(${order.couponCode})`}
                  </span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-100 pt-2 font-semibold text-[#1A1A1A]">
                <span>Tổng cộng</span>
                <span className="text-[#0047AB]">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>

            {/* Cancellation Trigger */}
            {canCancel && (
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      variant="outline"
                      className="mt-4 w-full border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Hủy đơn hàng
                    </Button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Hủy đơn hàng {order.orderCode}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Vui lòng cho biết lý do hủy đơn (ít nhất 10 ký tự).
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="mt-4">
                    <Label htmlFor="cancelReason">Lý do hủy</Label>
                    <Textarea
                      id="cancelReason"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setCancelReason('')}>
                      Đóng
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancel}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Xác nhận hủy
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default OrderDetailPage;
