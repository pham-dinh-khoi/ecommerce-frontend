import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Tag, X } from 'lucide-react';

// Components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Store & Logic
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  previewCouponThunk,
  clearAppliedCoupon,
} from '@/features/coupon/couponSlice';
import { formatCurrency } from '@/utils/formatCurrency';
import { ROUTES } from '@/constants/routes';

/**
 * CouponInput Component
 * Allows users to enter a coupon code, validate it via API, and display the result.
 * Includes authentication gating and automatic loading state handling.
 */
function CouponInput() {
  // --- Hooks ---
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Select auth and coupon state from Redux
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { appliedCoupon, previewStatus } = useAppSelector(
    (state) => state.coupon
  );

  // Local state for the input field
  const [code, setCode] = useState('');

  // --- Handlers ---

  /**
   * Triggers the coupon preview process.
   * Ensures the user is authenticated and the input is valid before dispatching.
   */
  const handleApply = async () => {
    // 1. Guard Clause: Authentication
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để sử dụng mã giảm giá');
      navigate(ROUTES.LOGIN);
      return;
    }

    // 2. Guard Clause: Empty Input
    if (!code.trim()) return;

    // 3. Dispatch Thunk
    try {
      await dispatch(previewCouponThunk(code.trim())).unwrap();
      toast.success('Áp dụng mã giảm giá thành công');
    } catch (err) {
      // Display error from the API/Thunk rejection
      if ((err as string)?.trim()) toast.error(err as string);
    }
  };

  /**
   * Resets the applied coupon state and clears the input field.
   */
  const handleRemove = () => {
    dispatch(clearAppliedCoupon());
    setCode('');
  };

  // --- Render ---

  // State: Coupon is currently applied (Success view)
  if (appliedCoupon) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-700">
                {appliedCoupon.code}
              </p>
              <p className="text-xs text-green-600">
                Giảm {formatCurrency(appliedCoupon.discountAmount)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-green-600 hover:text-green-800"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  // State: Default view (Input field)
  return (
    <div className="flex gap-2">
      <Input
        placeholder="Nhập mã giảm giá"
        value={code}
        // Force uppercase for consistent coupon code matching
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        // Accessibility/UX: Submit on Enter key
        onKeyDown={(e) => e.key === 'Enter' && handleApply()}
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleApply}
        disabled={previewStatus === 'loading' || !code.trim()}
      >
        {previewStatus === 'loading' ? 'Đang kiểm tra...' : 'Áp dụng'}
      </Button>
    </div>
  );
}

export default CouponInput;
