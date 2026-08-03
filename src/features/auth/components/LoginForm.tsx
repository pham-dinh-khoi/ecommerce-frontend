import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// State & Logic
import { useAppDispatch } from '@/store/hooks';
import { loginThunk } from '@/features/auth/authSlice';
import { fetchCart } from '@/features/cart/cartSlice';
import { clearGuestId } from '@/lib/guestId';
import { fetchProfile } from '@/features/user/userSlice';

// Constants & Validations
import {
  loginFormSchema,
  type LoginFormValues,
} from '@/lib/validations/auth.validation';
import { ROUTES } from '@/constants/routes';

/**
 * LoginForm Component
 *
 * Manages user authentication:
 * 1. Validates input credentials using Zod.
 * 2. Authenticates via Redux Thunk.
 * 3. Handles post-login cleanup (clearing guest ID).
 * 4. Syncs the user's persistent cart after login.
 */
function LoginForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Local UI State
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Form initialization with Zod resolver for automatic validation
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
  });

  /**
   * onSubmit Handler
   *
   * Orchestrates the login process.
   */
  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);

    try {
      // 1. Attempt Authentication
      await dispatch(loginThunk(data)).unwrap();

      // 2. Clear transient guest session data
      clearGuestId();

      // Fetch Profile
      dispatch(fetchProfile());

      /**
       * 3. Cart Synchronization
       * We introduce a delay (500ms) before fetching the cart.
       * Reason: The backend processes the "merge cart" (guest to user)
       * asynchronously upon login. This ensures the cart state is fresh
       * when requested.
       */
      setTimeout(() => {
        dispatch(fetchCart());
      }, 500);

      navigate(ROUTES.HOME);
    } catch (err) {
      /**
       * 4. Smart Error Handling
       * - Field-level: If the error contains specific field keys (e.g., 'email'),
       *   we attach it to the form input using React Hook Form's `setError`.
       * - Server-wide: If it's a general auth error (e.g., 'Wrong password'),
       *   display it as a global alert.
       */
      if (
        typeof err === 'object' &&
        err !== null &&
        'email' in (err as object)
      ) {
        setError('email', { message: (err as Record<string, string>).email });
      } else {
        setServerError(err as string);
      }
    }
  };

  return (
    <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-[#1A1A1A]">
        Chào mừng bạn quay lại
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        Vui lòng nhập thông tin để đăng nhập vào tài khoản của bạn.
      </p>

      {/* Global Error Display */}
      {serverError && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        {/* Email Input */}
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

        {/* Password Input with Toggle */}
        <div>
          <Label htmlFor="password">Mật khẩu</Label>
          <div className="relative mt-1">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Forgot Password Link */}
        <div className="flex justify-end text-sm">
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="text-[#0047AB] hover:underline"
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#0047AB] hover:bg-[#003a8c]"
        >
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập →'}
        </Button>
      </form>

      {/* Footer Navigation */}
      <p className="mt-6 text-center text-sm text-gray-600">
        <span>Bạn chưa có tài khoản? </span>
        <Link
          to={ROUTES.REGISTER}
          className="font-medium text-[#0047AB] hover:underline"
        >
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}

export default LoginForm;
