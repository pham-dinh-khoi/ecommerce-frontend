import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';

// Application Imports
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/store/hooks';
import { verifyEmailThunk } from '@/features/auth/authSlice';
import { ROUTES } from '@/constants/routes';
import StatusCard from '@/components/common/StatusCard';

type VerifyState = 'loading' | 'success' | 'error';

/**
 * VerifyEmailStatus Component
 *
 * Handles the email verification workflow via a token passed in URL search parameters.
 * It coordinates with the Redux store to execute verification and presents
 * an appropriate UI state (loading, success, or error) to the user.
 */
function VerifyEmailStatus() {
  // Hooks
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Local State
  const [state, setState] = useState<VerifyState>('loading');

  /**
   * Ref to track if the effect has already executed.
   * This prevents duplicate API calls caused by React Strict Mode
   * double-invocation in development environments.
   */
  const hasCalledRef = useRef(false);

  useEffect(() => {
    if (hasCalledRef.current) return;
    hasCalledRef.current = true;

    const verify = async () => {
      // Validate token presence before making API request
      if (!token) {
        setState('error');
        return;
      }

      try {
        /**
         * .unwrap() is used here to throw the rejected action payload
         * as an error, allowing the catch block to handle it correctly.
         */
        await dispatch(verifyEmailThunk(token)).unwrap();
        setState('success');
      } catch {
        setState('error');
      }
    };

    verify();
  }, [token, dispatch]);

  // --- Render Logic ---

  // 1. Loading State
  if (state === 'loading') {
    return (
      <StatusCard
        icon={
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0047AB] border-t-transparent" />
        }
        title="Đang xác thực email..."
        description="Vui lòng chờ trong giây lát."
      />
    );
  }

  // 2. Success State
  if (state === 'success') {
    return (
      <StatusCard
        icon={<CheckCircle2 size={24} />}
        variant="success"
        title="Xác thực email thành công!"
        description="Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ."
      >
        <Button
          onClick={() => navigate(ROUTES.LOGIN)}
          className="w-full bg-[#0047AB] hover:bg-[#003a8c]"
        >
          Đăng nhập ngay →
        </Button>
      </StatusCard>
    );
  }

  // 3. Error State
  return (
    <StatusCard
      icon={<XCircle size={24} />}
      variant="error"
      title="Liên kết không hợp lệ/hết hạn"
      description="Link xác thực đã hết hạn hoặc không còn hiệu lực. Vui lòng yêu cầu một liên kết mới hoặc quay lại để kiểm tra thông tin."
    >
      <Button
        onClick={() => navigate(ROUTES.LOGIN)}
        className="w-full bg-[#0047AB] hover:bg-[#003a8c]"
      >
        Quay lại trang đăng nhập →
      </Button>
      <p className="mt-3 text-center text-sm">
        <Link to="#" className="text-[#0047AB] hover:underline">
          Cần hỗ trợ?
        </Link>
      </p>
    </StatusCard>
  );
}

export default VerifyEmailStatus;
