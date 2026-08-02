import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Components
import MainLayout from '@/components/layout/MainLayout';
import Pagination from '@/components/common/Pagination';
import OrderStatusBadge from '@/features/order/components/OrderStatusBadge';

// Store, Utils & Types
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyOrders } from '@/features/order/orderSlice';
import { formatCurrency } from '@/utils/formatCurrency';
import { buildOrderDetailUrl } from '@/constants/routes';
import type { OrderStatus } from '@/types/order.types';

const statusFilters: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'processing', label: 'Đang đóng gói' },
  { value: 'shipped', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Đã hủy' },
];

/**
 * MyOrdersPage
 *
 * Renders a list of orders for the authenticated user with filtering
 * by order status and pagination.
 */
function MyOrdersPage() {
  const dispatch = useAppDispatch();
  const { myOrders, myPagination, myOrdersStatus } = useAppSelector(
    (state) => state.order
  );

  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  // Derived state to simplify JSX conditionals
  const isLoading = myOrdersStatus === 'loading';
  const isEmpty = myOrdersStatus === 'succeeded' && myOrders.length === 0;

  useEffect(() => {
    dispatch(
      fetchMyOrders({
        page,
        limit: 10,
        status: statusFilter === 'all' ? undefined : statusFilter,
      })
    );
  }, [dispatch, page, statusFilter]);

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Đơn hàng của tôi</h1>

        {/* Filter Navigation */}
        <div className="mt-4 flex flex-wrap gap-2">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setStatusFilter(f.value);
                setPage(1);
              }}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                statusFilter === f.value
                  ? 'border-[#0047AB] bg-[#0047AB] text-white'
                  : 'border-gray-200 text-gray-600 hover:border-[#0047AB]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Orders List Area */}
        <div className="mt-6 space-y-3">
          {isLoading && (
            <div className="rounded-lg border border-gray-200 bg-white p-16 text-center text-gray-400">
              Đang tải...
            </div>
          )}

          {isEmpty && (
            <div className="rounded-lg border border-gray-200 bg-white py-16 text-center text-gray-400">
              Chưa có đơn hàng nào
            </div>
          )}

          {myOrdersStatus === 'succeeded' &&
            myOrders.map((order) => (
              <Link
                key={order._id}
                to={buildOrderDetailUrl(order.orderCode)}
                className="block rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-[#0047AB]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#1A1A1A]">
                      {order.orderCode}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')} ·{' '}
                      {order.items.length} sản phẩm
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="mt-2 text-right font-semibold text-[#0047AB]">
                  {formatCurrency(order.totalAmount)}
                </p>
              </Link>
            ))}
        </div>

        {/* Pagination Section */}
        {myPagination && (
          <div className="mt-6">
            <Pagination pagination={myPagination} onPageChange={setPage} />
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default MyOrdersPage;
