import { z } from "zod";

/**
 * Order Address Validation Schema
 * Designed for the checkout flow where user input needs to be 
 * fast, accurate, and mandatory.
 */
export const newAddressFormSchema = z.object({
  // Requires a non-empty name; trimmed to prevent whitespace-only submissions
  recipientName: z
    .string({ message: "Vui lòng nhập tên người nhận" })
    .min(2, "Tên ít nhất 2 ký tự")
    .trim(),

  // Vietnamese phone format enforcement (0xxxxxxxxx or +84xxxxxxxxx)
  recipientPhone: z
    .string({ message: "Vui lòng nhập số điện thoại" })
    .regex(/^(0|\+84)\d{9,10}$/, "Số điện thoại không hợp lệ"),

  // Using .min(1) is the standard way to ensure a value has been selected
  // from a dropdown/select input (where empty selection = empty string)
  province: z.string().min(1, "Vui lòng chọn Tỉnh/Thành phố"),
  district: z.string().min(1, "Vui lòng chọn Quận/Huyện"),
  ward: z.string().min(1, "Vui lòng chọn Phường/Xã"),

  // Detailed street address with length bounds to prevent overly long or 
  // dangerously short inputs
  streetAddress: z
    .string({ message: "Vui lòng nhập địa chỉ cụ thể" })
    .min(5, "Địa chỉ ít nhất 5 ký tự")
    .max(200, "Địa chỉ không quá 200 ký tự")
    .trim(),
});

// TypeScript type inference for the order address form
export type NewAddressFormValues = z.infer<typeof newAddressFormSchema>;