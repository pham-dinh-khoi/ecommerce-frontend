import { Link } from 'react-router-dom';
import OrderStatusBadge from './OrderStatusBadge';
import { formatCurrency } from '@/utils/formatCurrency';
import { buildAdminOrderDetailUrl } from '@/constants/routes';
import type { Order } from '@/types/order.types';

/**
 * Mapping configuration for payment methods to display labels.
 * Extracted as a constant to avoid re-creation on render.
 */
const paymentMethodLabels: Record<string, string> = {
  cod: 'COD',
  bank_transfer: 'Chuyển khoản',
  vnpay: 'VNPay',
  momo: 'MoMo',
  stripe: 'Stripe',
};

interface OrderTableProps {
  orders: Order[];
}

/**
 * OrderTable Component
 * Displays a list of orders in a table format with status, payment, and customer details.
 */
function OrderTable({ orders }: OrderTableProps) {
  // Guard Clause: Handle empty state to avoid rendering an empty table layout
  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white py-16 text-center text-gray-400">
        Không tìm thấy đơn hàng nào
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-gray-500">
            <th className="px-4 py-3 font-medium">Mã đơn</th>
            <th className="px-4 py-3 font-medium">Khách hàng</th>
            <th className="px-4 py-3 font-medium">Thanh toán</th>
            <th className="px-4 py-3 font-medium">Tổng tiền</th>
            <th className="px-4 py-3 font-medium">Trạng thái</th>
            <th className="px-4 py-3 font-medium">Ngày đặt</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            // Check if user data is populated (populating object vs just ID)
            const userInfo = typeof order.user === 'object' ? order.user : null;

            return (
              <tr
                key={order._id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                {/* Order ID/Link */}
                <td className="px-4 py-3">
                  <Link
                    to={buildAdminOrderDetailUrl(order._id)}
                    className="font-medium text-[#0047AB] hover:underline"
                  >
                    {order.orderCode}
                  </Link>
                </td>

                {/* Customer Info */}
                <td className="px-4 py-3">
                  <p className="text-[#1A1A1A]">{userInfo?.name ?? '—'}</p>
                  <p className="text-xs text-gray-400">
                    {userInfo?.email ?? ''}
                  </p>
                </td>

                {/* Payment Method & Status */}
                <td className="px-4 py-3 text-gray-600">
                  {paymentMethodLabels[order.payment.method] ??
                    order.payment.method}
                  {order.payment.status === 'paid' && (
                    <span className="ml-1 text-xs text-green-600">
                      ✓ Đã trả
                    </span>
                  )}
                </td>

                {/* Total Amount */}
                <td className="px-4 py-3 font-medium text-[#1A1A1A]">
                  {formatCurrency(order.totalAmount)}
                </td>

                {/* Status Badge */}
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>

                {/* Creation Date */}
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleString('vi-VN')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default OrderTable;
