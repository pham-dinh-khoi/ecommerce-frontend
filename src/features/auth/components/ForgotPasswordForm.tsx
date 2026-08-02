import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StatusCard from '@/components/common/StatusCard';

// Application Logic & Constants
import { useAppDispatch } from '@/store/hooks';
import { forgotPasswordThunk } from '@/features/auth/authSlice';
import {
  forgotPasswordFormSchema,
  type ForgotPasswordFormValues,
} from '@/lib/validations/auth.validation';
import { ROUTES } from '@/constants/routes';

/**
 * ForgotPasswordForm Component
 *
 * Manages the password recovery workflow.
 * 1. Collects user email for verification.
 * 2. Triggers the backend password reset initiation.
 * 3. Switches the UI to a confirmation state regardless of whether the email
 *    was found, preventing email enumeration attacks.
 */
function ForgotPasswordForm() {
  const dispatch = useAppDispatch();
  const [isSent, setIsSent] = useState(false);

  // Form Management via React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
  });

  /**
   * onSubmit Handler
   *
   * Security Note: We always trigger the success UI state (`setIsSent(true)`)
   * regardless of the API response success or failure. This prevents attackers
   * from determining if a specific email address exists in our database.
   */
  const onSubmit = async (data: ForgotPasswordFormValues) => {
    await dispatch(forgotPasswordThunk(data));
    setIsSent(true);
  };

  // --- Conditional Rendering: Confirmation State ---
  if (isSent) {
    return (
      <StatusCard
        icon={<Mail size={24} />}
        title="Kiểm tra email của bạn"
        description="Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư (kể cả mục spam)."
        footerLink={
          <Link to={ROUTES.LOGIN} className="text-[#0047AB] hover:underline">
            ← Quay lại trang đăng nhập
          </Link>
        }
      />
    );
  }

  // --- Main View: Email Entry Form ---
  return (
    <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-[#1A1A1A]">Quên mật khẩu?</h1>
      <p className="mt-1 text-sm text-gray-600">
        Đừng lo lắng. Hãy nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt
        lại mật khẩu.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        {/* Email Input Field */}
        <div>
          <Label htmlFor="email">Địa chỉ Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="example@email.com"
            {...register('email')}
            className="mt-1"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#0047AB] hover:bg-[#003a8c]"
        >
          {isSubmitting ? 'Đang gửi...' : 'Gửi liên kết đặt lại →'}
        </Button>
      </form>

      {/* Navigation Link */}
      <p className="mt-4 text-center text-sm">
        <Link to={ROUTES.LOGIN} className="text-[#0047AB] hover:underline">
          ← Quay lại trang Đăng nhập
        </Link>
      </p>
    </div>
  );
}

export default ForgotPasswordForm;
