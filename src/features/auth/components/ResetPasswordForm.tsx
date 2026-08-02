import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, KeyRound } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StatusCard from '@/components/common/StatusCard';

// Redux & State
import { useAppDispatch } from '@/store/hooks';
import { resetPasswordThunk } from '@/features/auth/authSlice';

// Utilities & Constants
import {
  resetPasswordFormSchema,
  type ResetPasswordFormValues,
} from '@/lib/validations/auth.validation';
import { ROUTES } from '@/constants/routes';

/**
 * ResetPasswordForm Component
 *
 * Manages the password reset lifecycle:
 * 1. Captures the token from the URL.
 * 2. Validates input using Zod.
 * 3. Dispatches an async thunk to the API.
 * 4. Displays feedback (success/error) to the user.
 */
function ResetPasswordForm() {
  // Navigation & URL Handling
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Local UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form Management with React Hook Form & Zod
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
  });

  /**
   * Handles form submission.
   * Dispatches the resetPasswordThunk and handles the promise result.
   */
  const onSubmit = async (data: ResetPasswordFormValues) => {
    // Validate token exists in URL
    if (!token) {
      setServerError('Liên kết không hợp lệ, thiếu token xác thực');
      return;
    }

    setServerError(null);

    try {
      // .unwrap() allows the catch block to catch the rejected action payload directly
      await dispatch(
        resetPasswordThunk({ token, newPassword: data.newPassword })
      ).unwrap();

      setIsSuccess(true);
    } catch (err) {
      // Catch errors returned from the Thunk (e.g., validation errors, expired token)
      setServerError(err as string);
    }
  };

  // --- Conditional Rendering: Success State ---
  if (isSuccess) {
    return (
      <StatusCard
        icon={<KeyRound size={24} />}
        variant="success"
        title="Đặt lại mật khẩu thành công"
        description="Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập lại bằng mật khẩu mới."
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

  // --- Main View: Reset Password Form ---
  return (
    <StatusCard
      icon={<KeyRound size={24} />}
      title="Đặt lại mật khẩu"
      description="Vui lòng nhập mật khẩu mới của bạn để tiếp tục trải nghiệm mua sắm."
      footerLink={
        <Link to={ROUTES.LOGIN} className="text-[#0047AB] hover:underline">
          ← Quay lại trang đăng nhập
        </Link>
      }
    >
      {/* Server Error Alert */}
      {serverError && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
        {/* New Password Input */}
        <div>
          <Label htmlFor="newPassword">Mật khẩu mới</Label>
          <div className="relative mt-1">
            <Input
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu mới"
              {...register('newPassword')}
            />
            {/* Password visibility toggle button */}
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              tabIndex={-1} // Prevent tab focus on the icon button
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-600">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        {/* Confirm Password Input */}
        <div>
          <Label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới</Label>
          <div className="relative mt-1">
            <Input
              id="confirmNewPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Xác nhận lại mật khẩu"
              {...register('confirmNewPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmNewPassword && (
            <p className="mt-1 text-sm text-red-600">
              {errors.confirmNewPassword.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#0047AB] hover:bg-[#003a8c]"
        >
          {isSubmitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu →'}
        </Button>
      </form>
    </StatusCard>
  );
}

export default ResetPasswordForm;
