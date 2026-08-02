import { z } from 'zod';

export const categoryFormSchema = z.object({
  name: z
    .string({ message: 'Vui lòng nhập tên danh mục' })
    .min(2, 'Tên ít nhất 2 ký tự')
    .max(100, 'Tên không quá 100 ký tự')
    .trim(),
  description: z
    .string()
    .max(500, 'Mô tả không quá 500 ký tự')
    .optional()
    .or(z.literal('')),
  parent: z.string().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type CategoryFormValues = z.input<typeof categoryFormSchema>;
