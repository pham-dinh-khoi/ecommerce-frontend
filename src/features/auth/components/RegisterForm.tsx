import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

// --- UI Components ---
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

// --- Store & Logic ---
import { useAppDispatch } from '@/store/hooks';
import { registerThunk } from '@/features/auth/authSlice';
import {
  registerFormSchema,
  type RegisterFormValues,
} from '@/lib/validations/auth.validation';
import { ROUTES } from '@/constants/routes';

/**
 * RegisterForm Component
 *
 * Handles the user registration workflow.
 * - Manages multi-field state via React Hook Form.
 * - Enforces validation using Zod.
 * - Sanitizes payloads before API transmission.
 * - Navigates to the email verification notice upon success.
 */
function RegisterForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // --- Local UI State ---
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // --- Form Configuration ---
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
  });

  // Watch the checkbox state to trigger re-renders only when needed
  const agreeTerms = useWatch({ control, name: 'agreeTerms' });

  /**
   * Handle Form Submission
   *
   * Transforms form data by stripping out UI-only fields (like agreeTerms)
   * before sending to the backend API.
   */
  const onSubmit = async (data: RegisterFormValues) => {
    setServerError(null);
    try {
      // Data Sanitization: Ensure only relevant fields are sent to the backend
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
      };

      // Dispatch thunk and unwrap promise to handle result/error in try-catch
      await dispatch(registerThunk(payload)).unwrap();

      // Redirect to the notice page, passing email in state for the "masked email" display
      navigate(ROUTES.VERIFY_EMAIL_NOTICE, { state: { email: data.email } });
    } catch (err) {
      setServerError(err as string);
    }
  };

  return (
    <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-[#1A1A1A]">Tạo tài khoản mới</h1>
      <p className="mt-1 text-sm text-gray-600">
        Bắt đầu hành trình mua sắm tuyệt vời cùng chúng tôi.
      </p>

      {/* API Error Handling Display */}
      {serverError && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        {/* --- Name Input --- */}
        <div>
          <Label htmlFor="name">Họ và tên</Label>
          <Input
            id="name"
            placeholder="Nguyễn Văn A"
            {...register('name')}
            className="mt-1"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* --- Email Input --- */}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            {...register('email')}
            className="mt-1"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* --- Password & Confirmation Inputs --- */}
        <div className="grid grid-cols-2 gap-3">
          {/* Password */}
          <div>
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
            <div className="relative mt-1">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
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
          </div>
        </div>

        {/* --- Validation Errors for Passwords (displayed below the row) --- */}
        {errors.password && (
          <p className="-mt-2 text-sm text-red-600">
            {errors.password.message}
          </p>
        )}
        {errors.confirmPassword && (
          <p className="-mt-2 text-sm text-red-600">
            {errors.confirmPassword.message}
          </p>
        )}

        {/* --- Terms & Conditions --- */}
        <div className="flex items-start gap-2">
          <Checkbox
            id="agreeTerms"
            checked={agreeTerms === true}
            onCheckedChange={(checked) =>
              // Manually update form state and trigger validation on checkbox change
              setValue('agreeTerms', checked === true, { shouldValidate: true })
            }
          />
          <Label
            htmlFor="agreeTerms"
            className="text-sm font-normal leading-snug text-gray-600"
          >
            <span className="whitespace-nowrap">Tôi đồng ý với</span>{' '}
            <a
              href="#"
              className="whitespace-nowrap text-[#0047AB] hover:underline"
            >
              Điều khoản Dịch vụ
            </a>{' '}
            và{' '}
            <a
              href="#"
              className="whitespace-nowrap text-[#0047AB] hover:underline"
            >
              Chính sách Bảo mật
            </a>
          </Label>
        </div>
        {errors.agreeTerms && (
          <p className="text-sm text-red-600">{errors.agreeTerms.message}</p>
        )}

        {/* --- Submit Button --- */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#0047AB] hover:bg-[#003a8c]"
        >
          {isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản →'}
        </Button>
      </form>

      {/* --- Auth Redirection --- */}
      <p className="mt-6 text-center text-sm text-gray-600">
        Đã có tài khoản?{' '}
        <Link
          to={ROUTES.LOGIN}
          className="font-medium text-[#0047AB] hover:underline"
        >
          Đăng nhập ngay
        </Link>
      </p>
    </div>
  );
}

export default RegisterForm;
