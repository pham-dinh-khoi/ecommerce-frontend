import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@/types/order.types';

/**
 * Configuration mapping for status badges.
 * This lookup table decouples the rendering logic from the data.
 */
const statusConfig: Record<OrderStatus, { label: string; className: string }> =
  {
    pending: {
      label: 'Chờ xác nhận',
      className: 'bg-yellow-100 text-yellow-700',
    },
    confirmed: { label: 'Đã xác nhận', className: 'bg-blue-100 text-blue-700' },
    processing: {
      label: 'Đang đóng gói',
      className: 'bg-purple-100 text-purple-700',
    },
    shipped: {
      label: 'Đang giao hàng',
      className: 'bg-indigo-100 text-indigo-700',
    },
    delivered: {
      label: 'Đã giao hàng',
      className: 'bg-green-100 text-green-700',
    },
    cancelled: { label: 'Đã hủy', className: 'bg-red-100 text-red-600' },
  };

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

/**
 * OrderStatusBadge Component
 * Renders a colored badge based on the provided order status.
 */
function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  // Retrieve the configuration object based on the status prop
  const config = statusConfig[status];

  // Render the Badge with dynamic styling applied via the config
  // Note: hover classes are constructed dynamically based on the config.className
  return (
    <Badge className={`${config.className} hover:${config.className}`}>
      {config.label}
    </Badge>
  );
}

export default OrderStatusBadge;
