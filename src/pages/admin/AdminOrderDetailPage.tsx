/**
 * AdminOrderDetailPage.tsx
 *
 * This page displays the full details of a specific order.
 * It provides administrative controls to update order status,
 * view history, and review customer/shipping/financial information.
 */

// --- React & Core Hooks ---
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// --- Local Layouts & Components ---
import AdminLayout from '@/components/layout/AdminLayout';
import OrderStatusBadge from '@/features/order/components/OrderStatusBadge';
import OrderTimeline from '@/features/order/components/OrderTimeline';
import UpdateStatusForm from '@/features/order/components/UpdateStatusForm';

// --- State Management (Redux) ---
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchAdminOrderById,
  clearCurrentOrder,
} from '@/features/order/orderSlice';

// --- Utilities & Constants ---
import { formatCurrency } from '@/utils/formatCurrency';
import { buildProductUrl } from '@/constants/routes';

function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { current: order, currentStatus } = useAppSelector(
    (state) => state.order
  );

  /**
   * Data Lifecycle:
   * 1. Fetch order details on component mount.
   * 2. Clear state on unmount to ensure fresh data for the next view.
   */
  useEffect(() => {
    if (id) dispatch(fetchAdminOrderById(id));
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [id, dispatch]);

  // --- Loading State ---
  if (currentStatus === 'loading' || !order) {
    return (
      <AdminLayout>
        <div className="text-gray-400">Đang tải...</div>
      </AdminLayout>
    );
  }

  // Helper to ensure safe access to user object
  const userInfo = typeof order.user === 'object' ? order.user : null;

  return (
    <AdminLayout>
      {/* --- Page Header --- */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1A1A1A]">
          Đơn hàng {order.orderCode}
        </h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* --- Main Content: Management & Items --- */}
        <div className="space-y-6">
          {/* Status Update Control */}
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-[#1A1A1A]">
              Cập nhật trạng thái
            </h2>
            <UpdateStatusForm order={order} />
          </section>

          {/* Timeline History */}
          {order.timeline && (
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="mb-3 font-semibold text-[#1A1A1A]">Lịch sử</h2>
              <OrderTimeline timeline={order.timeline} />
            </section>
          )}

          {/* Ordered Items List */}
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-[#1A1A1A]">Sản phẩm</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.variant} className="flex items-center gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-gray-100">
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
                  <p className="text-sm font-medium">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* --- Sidebar: Customer & Financials --- */}
        <div className="space-y-6">
          {/* Customer Contact Info */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="font-semibold text-[#1A1A1A]">Khách hàng</h2>
            <p className="mt-2 text-sm text-[#1A1A1A]">{userInfo?.name}</p>
            <p className="text-sm text-gray-500">{userInfo?.email}</p>
            <p className="text-sm text-gray-500">{userInfo?.phone}</p>
          </div>

          {/* Shipping Address */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="font-semibold text-[#1A1A1A]">Địa chỉ giao hàng</h2>
            <p className="mt-2 text-sm text-[#1A1A1A]">
              {order.shipping.recipientName} · {order.shipping.recipientPhone}
            </p>
            <p className="text-sm text-gray-500">
              {order.shipping.streetAddress}, {order.shipping.ward},{' '}
              {order.shipping.district}, {order.shipping.province}
            </p>
          </div>

          {/* Financial Summary */}
          <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Tạm tính</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Phí ship</span>
              <span>{formatCurrency(order.shippingFee)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-gray-100 pt-2 font-semibold">
              <span>Tổng cộng</span>
              <span className="text-[#0047AB]">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminOrderDetailPage;
