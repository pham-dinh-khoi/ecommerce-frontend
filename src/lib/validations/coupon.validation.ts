import { z } from 'zod';

/**
 * Coupon Form Validation Schema
 * Defines strict rules for creating/editing coupons, ensuring data integrity
 * before submission to the database.
 */
export const couponFormSchema = z
  .object({
    // Standardizes coupon code format using regex
    code: z
      .string({ message: 'Vui lòng nhập mã coupon' })
      .min(3, 'Mã tối thiểu 3 ký tự')
      .max(20, 'Mã tối đa 20 ký tự')
      .regex(/^[A-Z0-9_-]+$/i, 'Chỉ dùng chữ, số, - và _')
      .trim(),

    description: z
      .string({ message: 'Vui lòng nhập mô tả' })
      .min(5, 'Mô tả ít nhất 5 ký tự')
      .max(200, 'Mô tả không quá 200 ký tự'),

    // Restricts discount type to specific allowed values
    discountType: z.enum(['percentage', 'fixed']),

    // Coercion ensures string inputs from HTML forms are converted to numbers automatically
    discountAmount: z.coerce
      .number({ message: 'Vui lòng nhập giá trị giảm' })
      .positive('Phải lớn hơn 0'),

    // Allows empty strings to pass as optional/undefined
    maxDiscount: z.coerce.number().positive().optional().or(z.literal('')),
    minOrderAmount: z.coerce.number().min(0).optional().or(z.literal('')),
    maxUsageTotal: z.coerce
      .number()
      .int()
      .positive()
      .optional()
      .or(z.literal('')),
    maxUsagePerUser: z.coerce.number().int().positive().default(1),

    // Dates are handled as strings (often ISO format) for validation
    startDate: z.string({ message: 'Vui lòng chọn ngày bắt đầu' }).min(1),
    endDate: z.string({ message: 'Vui lòng chọn ngày kết thúc' }).min(1),

    isActive: z.boolean().default(true),
  })
  // Refinement 1: Logic check for date ranges
  .refine((d) => new Date(d.endDate) > new Date(d.startDate), {
    message: 'Ngày kết thúc phải sau ngày bắt đầu',
    path: ['endDate'],
  })
  // Refinement 2: Business logic check for percentage boundaries
  .refine(
    (d) =>
      d.discountType !== 'percentage' ||
      (d.discountAmount > 0 && d.discountAmount <= 100),
    { message: 'Giảm giá % phải từ 1-100', path: ['discountAmount'] }
  );

export type CouponFormValues = z.input<typeof couponFormSchema>;
