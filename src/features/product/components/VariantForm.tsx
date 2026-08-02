import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import VariantAttributesInput from './VariantAttributesInput';
import { variantFormSchema } from '@/lib/validations/product.validation';
import type {
  VariantAttribute,
  CreateVariantPayload,
} from '@/types/product.types';

// =============================================================================
// Constants
// =============================================================================

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB limit
const MAX_IMAGES = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// =============================================================================
// Interfaces
// =============================================================================

interface VariantFormProps {
  /** Function triggered when the form is successfully validated and submitted */
  onSubmit: (payload: CreateVariantPayload) => Promise<void>;
  /** Function to handle closing the form or canceling changes */
  onCancel: () => void;
  /** Boolean to disable the submit button during API requests */
  isSubmitting: boolean;
}

// =============================================================================
// Component
// =============================================================================

function VariantForm({ onSubmit, onCancel, isSubmitting }: VariantFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- State Management ---
  const [sku, setSku] = useState('');
  const [attributes, setAttributes] = useState<VariantAttribute[]>([
    { name: '', value: '' },
  ]);
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [stock, setStock] = useState('0');
  const [isActive, setIsActive] = useState(true);

  // Image handling states
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Error state for form validation messages
  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- Image Handlers ---

  /**
   * Processes file inputs: validates count, file type, and file size.
   * Updates state with new files and creates preview URLs.
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);

    if (imageFiles.length + files.length > MAX_IMAGES) {
      toast.error(`Chỉ được tối đa ${MAX_IMAGES} ảnh cho mỗi biến thể`);
      return;
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`File "${file.name}" không đúng định dạng`);
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`File "${file.name}" vượt quá 5MB`);
        return;
      }
    }

    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);

    // Reset file input value to allow selecting same file again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // --- Validation Logic ---

  /**
   * Validates form inputs using Zod for static fields and manual checks for dynamic attributes.
   * Returns true if valid, false otherwise.
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 1. Zod Schema Validation
    const result = variantFormSchema.safeParse({
      sku,
      price,
      comparePrice: comparePrice || undefined,
      stock,
      isActive,
    });

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!newErrors[field]) newErrors[field] = issue.message;
      });
    }

    // 2. Manual Attribute Validation (Ensuring at least one attribute pair exists)
    const validAttrs = attributes.filter(
      (a) => a.name.trim() && a.value.trim()
    );
    if (validAttrs.length === 0) {
      newErrors.attributes = 'Cần ít nhất 1 thuộc tính (VD: Màu sắc - Đỏ)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Submission ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const validAttrs = attributes.filter(
      (a) => a.name.trim() && a.value.trim()
    );

    await onSubmit({
      sku: sku.trim().toUpperCase(),
      attributes: validAttrs,
      price: Number(price),
      comparePrice: comparePrice ? Number(comparePrice) : undefined,
      stock: Number(stock),
      isActive,
      imageFiles,
    });
  };

  // --- Render ---

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4"
    >
      {/* SKU Input */}
      <div>
        <Label htmlFor="sku">SKU</Label>
        <Input
          id="sku"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          className="mt-1"
          placeholder="VD: AO-DO-M"
        />
        {errors.sku && (
          <p className="mt-1 text-sm text-red-600">{errors.sku}</p>
        )}
      </div>

      {/* Dynamic Attributes */}
      <div>
        <Label>Thuộc tính</Label>
        <div className="mt-1">
          <VariantAttributesInput
            attributes={attributes}
            onChange={setAttributes}
          />
        </div>
        {errors.attributes && (
          <p className="mt-1 text-sm text-red-600">{errors.attributes}</p>
        )}
      </div>

      {/* Pricing and Stock Fields */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="price">Giá bán</Label>
          <Input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1"
            placeholder="299000"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
          )}
        </div>
        <div>
          <Label htmlFor="comparePrice">Giá gốc (tùy chọn)</Label>
          <Input
            id="comparePrice"
            type="number"
            value={comparePrice}
            onChange={(e) => setComparePrice(e.target.value)}
            className="mt-1"
            placeholder="350000"
          />
          {errors.comparePrice && (
            <p className="mt-1 text-sm text-red-600">{errors.comparePrice}</p>
          )}
        </div>
        <div>
          <Label htmlFor="stock">Tồn kho</Label>
          <Input
            id="stock"
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="mt-1"
          />
          {errors.stock && (
            <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
          )}
        </div>
      </div>

      {/* Image Upload Area */}
      <div>
        <Label>Ảnh biến thể (tùy chọn)</Label>
        <div className="mt-1 flex flex-wrap gap-2">
          {imagePreviews.map((src, idx) => (
            <div key={idx} className="relative h-20 w-20">
              <img
                src={src}
                alt={`Preview ${idx}`}
                className="h-20 w-20 rounded-md border border-gray-200 object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
              >
                <X size={10} />
              </button>
            </div>
          ))}
          {/* Upload Button */}
          {imageFiles.length < MAX_IMAGES && (
            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-gray-300 text-gray-400 hover:border-[#0047AB] hover:text-[#0047AB]">
              <Upload size={16} />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Active Toggle */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="variantActive"
          checked={isActive}
          onCheckedChange={(checked) => setIsActive(checked === true)}
        />
        <Label htmlFor="variantActive" className="font-normal">
          Kích hoạt biến thể này
        </Label>
      </div>

      {/* Form Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#0047AB] hover:bg-[#003a8c]"
          size="sm"
        >
          {isSubmitting ? 'Đang lưu...' : 'Lưu biến thể'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Hủy
        </Button>
      </div>
    </form>
  );
}

export default VariantForm;
