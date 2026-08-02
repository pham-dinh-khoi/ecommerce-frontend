import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Store & Logic
import { useAppDispatch } from '@/store/hooks';
import { changePasswordThunk, logout } from '@/features/auth/authSlice';
import {
  changePasswordFormSchema,
  type ChangePasswordFormValues,
} from '@/lib/validations/profile.validation';
import { ROUTES } from '@/constants/routes';

/**
 * ChangePasswordForm Component
 *
 * Manages the user password update flow. It validates the input against
 * the Zod schema, dispatches the update action to the Redux store,
 * and handles post-update session invalidation (logout/redirect).
 */
function ChangePasswordForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Local state for toggling password visibility
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Form management using React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
  });

  /**
   * Submission handler.
   * 1. Dispatches the async thunk.
   * 2. Unwraps the promise to handle success/failure properly.
   * 3. Upon success, clears form, logs the user out (forcing re-auth), and redirects.
   */
  const onSubmit = async (values: ChangePasswordFormValues) => {
    try {
      await dispatch(
        changePasswordThunk({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        })
      ).unwrap();

      toast.success('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');

      reset();
      dispatch(logout());
      navigate(ROUTES.LOGIN);
    } catch (err) {
      // Catch and display error from the Thunk rejection
      if (err) toast.error(err as string);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4">
      {/* Current Password Field */}
      <div>
        <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
        <div className="relative mt-1">
          <Input
            id="currentPassword"
            type={showCurrent ? 'text' : 'password'}
            {...register('currentPassword')}
          />
          {/* Visibility Toggle Button */}
          <button
            type="button"
            onClick={() => setShowCurrent((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            tabIndex={-1} // Prevents this button from being tabbed into; focus remains on input
          >
            {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.currentPassword && (
          <p className="mt-1 text-sm text-red-600">
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      {/* New Password Field */}
      <div>
        <Label htmlFor="newPassword">Mật khẩu mới</Label>
        <div className="relative mt-1">
          <Input
            id="newPassword"
            type={showNew ? 'text' : 'password'}
            {...register('newPassword')}
          />
          {/* Visibility Toggle Button */}
          <button
            type="button"
            onClick={() => setShowNew((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            tabIndex={-1}
          >
            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.newPassword && (
          <p className="mt-1 text-sm text-red-600">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <Label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới</Label>
        <Input
          id="confirmNewPassword"
          type="password"
          {...register('confirmNewPassword')}
          className="mt-1"
        />
        {errors.confirmNewPassword && (
          <p className="mt-1 text-sm text-red-600">
            {errors.confirmNewPassword.message}
          </p>
        )}
      </div>

      {/* Submit Action */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="bg-[#0047AB] hover:bg-[#003a8c]"
      >
        {isSubmitting ? 'Đang xử lý...' : 'Đổi mật khẩu'}
      </Button>
    </form>
  );
}

export default ChangePasswordForm;
