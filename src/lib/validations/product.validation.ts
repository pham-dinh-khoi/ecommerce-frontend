import { z } from "zod";

/**
 * Product Basic Information Schema (Step 1)
 * Used for the initial phase of product creation or editing.
 */
export const productStep1FormSchema = z.object({
  name: z
    .string({ message: "Vui lòng nhập tên sản phẩm" })
    .min(3, "Tên ít nhất 3 ký tự")
    .max(200, "Tên không quá 200 ký tự")
    .trim(),
  description: z
    .string({ message: "Vui lòng nhập mô tả" })
    .min(20, "Mô tả ít nhất 20 ký tự"),
  shortDescription: z
    .string()
    .max(300, "Mô tả ngắn không quá 300 ký tự")
    .optional(),
  category: z
    .string({ message: "Vui lòng chọn danh mục" })
    .min(1, "Vui lòng chọn danh mục"),
  brand: z.string().max(100).optional(),
  // Strict status control ensures only valid workflow states are saved
  status: z.enum(["draft", "active", "inactive", "archived"]).default("draft"),
});

export type ProductStep1FormValues = z.input<typeof productStep1FormSchema>;

/**
 * Product Variant Schema
 * Handles individual SKU details, pricing logic, and inventory management.
 */
export const variantFormSchema = z
  .object({
    sku: z
      .string({ message: "Vui lòng nhập SKU" })
      .min(2, "SKU ít nhất 2 ký tự")
      .max(50, "SKU không quá 50 ký tự")
      .trim()
      .toUpperCase(), // Standardizes SKU to uppercase for consistent inventory lookups
    price: z
      .coerce.number({ message: "Vui lòng nhập giá" })
      .positive("Giá phải lớn hơn 0"),
    // Optional comparePrice allows for discount UI (List Price vs. Sale Price)
    comparePrice: z.coerce.number().positive().optional().or(z.literal("")),
    stock: z
      .coerce.number()
      .int()
      .min(0, "Tồn kho không thể âm")
      .default(0),
    weight: z.coerce.number().positive().optional().or(z.literal("")),
    barcode: z.string().optional(),
    isActive: z.coerce.boolean().default(true),
  })
  // Cross-field validation: Ensure discount logic makes business sense
  .refine(
    (data) => !data.comparePrice || Number(data.comparePrice) > data.price,
    { 
      message: "Giá gốc phải lớn hơn giá bán", 
      path: ["comparePrice"] 
    }
  );

export type VariantFormValues = z.infer<typeof variantFormSchema>;