import { CheckCircle2 } from 'lucide-react';
import type { OrderTimelineEntry } from '@/types/order.types';

/**
 * Mapping object to translate status keys into user-friendly display labels.
 * Extracted outside the component to prevent re-allocation on every render.
 */
const statusLabels: Record<string, string> = {
  pending: 'Đơn hàng đã được đặt',
  confirmed: 'Đã xác nhận đơn hàng',
  processing: 'Đang chuẩn bị hàng',
  shipped: 'Đã giao cho vận chuyển',
  delivered: 'Giao hàng thành công',
  cancelled: 'Đơn hàng đã hủy',
};

interface OrderTimelineProps {
  timeline: OrderTimelineEntry[];
}

/**
 * OrderTimeline Component
 * Renders a vertical list representing the history of order status updates.
 */
function OrderTimeline({ timeline }: OrderTimelineProps) {
  // If the timeline is empty, we return null to avoid rendering an empty list container
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="space-y-4">
      {timeline.map((entry, idx) => {
        // Check if this is the last item to decide whether to render the vertical connecting line
        const isLast = idx === timeline.length - 1;

        return (
          <div key={idx} className="flex gap-3">
            {/* Timeline Icon & Vertical Connector */}
            <div className="flex flex-col items-center">
              <CheckCircle2 size={18} className="text-[#0047AB]" />

              {/* Only render the connector line if it is not the final step */}
              {!isLast && <div className="h-full w-px bg-gray-200 mt-1" />}
            </div>

            {/* Timeline Content */}
            <div className="pb-4">
              <p className="text-sm font-medium text-[#1A1A1A]">
                {/* Fallback to the raw status if a label is not found in the map */}
                {statusLabels[entry.status] ?? entry.status}
              </p>

              <p className="text-xs text-gray-400">
                {new Date(entry.timestamp).toLocaleString('vi-VN')}
              </p>

              {/* Conditional rendering for notes, only show if they exist */}
              {entry.note && (
                <p className="mt-1 text-xs text-gray-500">{entry.note}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default OrderTimeline;
