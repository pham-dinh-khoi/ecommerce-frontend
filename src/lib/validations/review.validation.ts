import { z } from 'zod';

/**
 * Review Form Validation Schema
 * Enforces quality standards for user-submitted reviews.
 */
export const reviewFormSchema = z.object({
  // Coerces string-based star inputs (common in UI components) to numbers
  // Enforces a strictly bounded 1-5 integer range.
  rating: z.coerce
    .number({ message: 'Vui lòng chọn số sao' })
    .int()
    .min(1, 'Vui lòng chọn số sao')
    .max(5),

  // Title validation ensures the review has a clear, summarizing topic
  title: z
    .string({ message: 'Vui lòng nhập tiêu đề' })
    .min(5, 'Tiêu đề ít nhất 5 ký tự')
    .max(150, 'Tiêu đề không quá 150 ký tự')
    .trim(),

  // Content validation prevents low-effort "spam" reviews (minimum 20 chars)
  // and caps content to prevent massive text blocks (5000 chars).
  content: z
    .string({ message: 'Vui lòng nhập nội dung đánh giá' })
    .min(20, 'Nội dung ít nhất 20 ký tự')
    .max(5000, 'Nội dung không quá 5000 ký tự')
    .trim(),
});

/**
 * Using z.input is the correct choice here.
 * It maps to the raw form values (e.g., string types from inputs)
 * before Zod's coercion logic is applied, which is exactly what
 * React Hook Form expects for its initial state.
 */
export type ReviewFormValues = z.input<typeof reviewFormSchema>;
