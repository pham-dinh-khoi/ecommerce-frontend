import { z } from 'zod';

/**
 * Shared Password Schema
 * Centralizing this ensures consistency across registration and password reset forms.
 * Enforces strong password policies: length constraints and character variety.
 */
const passwordSchema = z
  .string({ message: 'Vui lòng nhập mật khẩu' })
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .max(72, 'Mật khẩu không được vượt quá 72 ký tự')
  .regex(/[a-z]/, 'Mật khẩu cần ít nhất 1 chữ thường')
  .regex(/[A-Z]/, 'Mật khẩu cần ít nhất 1 chữ hoa')
  .regex(/[0-9]/, 'Mật khẩu cần ít nhất 1 chữ số');

/**
 * Registration Schema
 * Handles user sign-up validation with field normalization and cross-field comparisons.
 */
export const registerFormSchema = z
  .object({
    name: z
      .string({ message: 'Vui lòng nhập họ và tên' })
      .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
      .max(100, 'Họ và tên không được vượt quá 100 ký tự')
      .trim(), // Automatically removes surrounding whitespace
    email: z
      .string({ message: 'Vui lòng nhập email' })
      .email('Email không hợp lệ')
      .toLowerCase() // Normalizes email to lowercase for database consistency
      .trim(),
    password: passwordSchema,
    confirmPassword: z.string({ message: 'Vui lòng xác nhận mật khẩu' }),
    phone: z
      .string()
      .regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không hợp lệ')
      .optional() // Phone is not mandatory
      .or(z.literal('')), // Allows empty strings to be treated as valid (useful for form clearing)
    agreeTerms: z
      .boolean({
        message: 'Vui lòng đồng ý với Điều khoản và Chính sách để tiếp tục',
      })
      .refine((val) => val === true, {
        message: 'Vui lòng đồng ý với Điều khoản và Chính sách để tiếp tục',
      }),
  })
  // .refine() enables cross-field validation to check if password and confirmPassword match
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'], // Error will appear specifically on the confirmPassword field
  });

/**
 * Login Schema
 * Minimal requirements for authentication to ensure fast feedback.
 */
export const loginFormSchema = z.object({
  email: z
    .string({ message: 'Vui lòng nhập email' })
    .email('Email không hợp lệ')
    .toLowerCase(),
  password: z
    .string({ message: 'Vui lòng nhập mật khẩu' })
    .min(1, 'Vui lòng nhập mật khẩu'),
});

/**
 * Forgot Password Schema
 * Only requires email for the lookup process.
 */
export const forgotPasswordFormSchema = z.object({
  email: z
    .string({ message: 'Vui lòng nhập email' })
    .email('Email không hợp lệ')
    .toLowerCase(),
});

/**
 * Reset Password Schema
 * Similar to registration, reuses passwordSchema for enforcement and verifies match.
 */
export const resetPasswordFormSchema = z
  .object({
    newPassword: passwordSchema,
    confirmNewPassword: z.string({ message: 'Vui lòng xác nhận mật khẩu mới' }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmNewPassword'],
  });

// Exporting types for use in React Hook Form's useForm hook
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;
