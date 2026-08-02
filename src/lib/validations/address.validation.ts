import { z } from "zod";

/**
 * Address Form Validation Schema
 * Defines the shape and constraints for user address inputs.
 */
export const addressFormSchema = z.object({
  // Enforces a label (e.g., "Home", "Work") between 1 and 50 characters
  label: z
    .string({ message: "Vui lòng nhập nhãn địa chỉ" })
    .min(1, "Nhãn không được để trống")
    .max(50, "Nhãn không quá 50 ký tự")
    .trim(),

  // Requires the recipient's name, minimum 2 characters
  recipientName: z
    .string({ message: "Vui lòng nhập tên người nhận" })
    .min(2, "Tên ít nhất 2 ký tự")
    .trim(),

  // Validates phone number format for Vietnamese numbers (starts with 0 or +84, followed by 9-10 digits)
  recipientPhone: z
    .string({ message: "Vui lòng nhập số điện thoại" })
    .regex(/^(0|\+84)\d{9,10}$/, "Số điện thoại không hợp lệ"),

  // Selectable dropdown fields; required to have at least 1 character
  province: z.string().min(1, "Vui lòng chọn Tỉnh/Thành phố"),
  district: z.string().min(1, "Vui lòng chọn Quận/Huyện"),
  ward: z.string().min(1, "Vui lòng chọn Phường/Xã"),

  // Detailed street address, constrained between 5 and 200 characters
  streetAddress: z
    .string({ message: "Vui lòng nhập địa chỉ cụ thể" })
    .min(5, "Địa chỉ ít nhất 5 ký tự")
    .max(200, "Địa chỉ không quá 200 ký tự")
    .trim(),

  // Boolean flag, defaults to false if not provided
  isDefault: z.boolean().default(false),
});

// TypeScript type inference: automatically extracts the type from the schema definition
export type AddressFormValues = z.input<typeof addressFormSchema>;