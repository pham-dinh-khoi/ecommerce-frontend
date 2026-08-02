import { z } from 'zod';

/**
 * Profile Form Schema
 * Used for updating personal information.
 * Allows flexibility (optional fields) while ensuring basic data format integrity.
 */
export const profileFormSchema = z.object({
  name: z
    .string({ message: 'Vui lòng nhập tên' })
    .min(2, 'Tên ít nhất 2 ký tự')
    .max(100, 'Tên không quá 100 ký tự')
    .trim(),
  phone: z
    .string()
    .regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không hợp lệ')
    .optional() // Phone is optional in profile
    .or(z.literal('')), // Allows empty strings to act as 'unset'
  gender: z.enum(['male', 'female', 'other']).optional(),
  dateOfBirth: z.string().optional(), // Expected format typically handled via date picker inputs
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

/**
 * Change Password Form Schema
 * Implements strict security logic, including cross-field verification.
 */
export const changePasswordFormSchema = z
  .object({
    currentPassword: z
      .string({ message: 'Vui lòng nhập mật khẩu hiện tại' })
      .min(1),
    newPassword: z
      .string({ message: 'Vui lòng nhập mật khẩu mới' })
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .max(72, 'Mật khẩu không được vượt quá 72 ký tự')
      .regex(/[a-z]/, 'Mật khẩu cần ít nhất 1 chữ thường')
      .regex(/[A-Z]/, 'Mật khẩu cần ít nhất 1 chữ hoa')
      .regex(/[0-9]/, 'Mật khẩu cần ít nhất 1 chữ số'),
    confirmNewPassword: z.string({ message: 'Vui lòng xác nhận mật khẩu mới' }),
  })
  // Refinement 1: Ensure password confirmation matches
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmNewPassword'],
  })
  // Refinement 2: Prevent users from resetting to the same password (UX/Security best practice)
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
    path: ['newPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;
