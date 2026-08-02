import { useState } from 'react';
import { toast } from 'sonner';

// Components & UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// State & Logic
import { useAppDispatch } from '@/store/hooks';
import { adminUpdateOrderStatusThunk } from '@/features/order/orderSlice';
import { VALID_TRANSITIONS } from '@/features/order/validTransitions';

// Types
import type { Order, OrderStatus } from '@/types/order.types';

/**
 * Mapping object to translate internal order status keys to human-readable strings.
 */
const statusLabels: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang đóng gói',
  shipped: 'Đang giao hàng',
  delivered: 'Đã giao hàng',
  cancelled: 'Đã hủy',
};

interface UpdateStatusFormProps {
  order: Order;
}

/**
 * UpdateStatusForm Component
 * Renders a form to transition an order's status.
 * Includes conditional inputs for tracking information and cancellation reasons.
 */
function UpdateStatusForm({ order }: UpdateStatusFormProps) {
  // --- Hooks ---
  const dispatch = useAppDispatch();

  // Form State
  const [note, setNote] = useState('');
  const [carrier, setCarrier] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Derived State ---
  // Calculates allowed next steps based on the current order status using pre-defined transition rules.
  const availableTransitions = VALID_TRANSITIONS[order.status] ?? [];

  // --- Handlers ---
  /**
   * Dispatches the update action to the Redux store.
   * Includes validation logic based on the target status (e.g., tracking for shipping, reasoning for cancellation).
   */
  const handleUpdate = async (newStatus: OrderStatus) => {
    // 1. Validation Logic: Check if required fields exist based on target status
    if (newStatus === 'shipped' && !trackingCode.trim()) {
      toast.error(
        'Vui lòng nhập mã vận đơn trước khi chuyển sang trạng thái Đang giao hàng'
      );
      return;
    }

    if (newStatus === 'cancelled' && note.trim().length < 10) {
      toast.error('Vui lòng nhập lý do hủy (ít nhất 10 ký tự) vào ô ghi chú');
      return;
    }

    // 2. Submission Process
    setIsSubmitting(true);
    try {
      await dispatch(
        adminUpdateOrderStatusThunk({
          orderId: order._id,
          payload: {
            status: newStatus as Exclude<OrderStatus, 'pending'>,
            note: note.trim() || undefined,
            // Conditionally spread carrier/tracking info only when shipping
            ...(newStatus === 'shipped' && {
              carrier: carrier.trim() || undefined,
              trackingCode: trackingCode.trim(),
            }),
          },
        })
      ).unwrap();

      toast.success(`Đã cập nhật trạng thái: ${statusLabels[newStatus]}`);
      setNote(''); // Reset note field on success
    } catch (err) {
      if ((err as string)?.trim()) toast.error(err as string);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render ---

  // Guard clause: Display message if no further status updates are possible
  if (availableTransitions.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        Đơn hàng đã ở trạng thái cuối, không thể cập nhật thêm
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Conditionally render shipping inputs only if 'shipped' is a possible transition */}
      {availableTransitions.includes('shipped') && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="carrier">Đơn vị vận chuyển</Label>
            <Input
              id="carrier"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="mt-1"
              placeholder="VD: GHN, GHTK"
            />
          </div>
          <div>
            <Label htmlFor="trackingCode">Mã vận đơn</Label>
            <Input
              id="trackingCode"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      )}

      {/* Global note field for status changes */}
      <div>
        <Label htmlFor="note">Ghi chú</Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-1"
          rows={2}
        />
      </div>

      {/* List buttons for each available valid transition */}
      <div className="flex flex-wrap gap-2">
        {availableTransitions.map((status) => (
          <Button
            key={status}
            type="button"
            disabled={isSubmitting}
            onClick={() => handleUpdate(status)}
            className={
              status === 'cancelled'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#0047AB] hover:bg-[#003a8c]'
            }
          >
            Chuyển sang: {statusLabels[status]}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default UpdateStatusForm;
