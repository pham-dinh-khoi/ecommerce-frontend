import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Upload, X, Star } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import {
  addProductImagesThunk,
  deleteProductImageThunk,
  setPrimaryImageThunk,
} from '@/features/product/productSlice';
import type { ProductImage } from '@/types/product.types';

// ==========================================
// Types & Interfaces
// ==========================================

interface ProductImageManagerProps {
  productId: string;
  images: ProductImage[];
}

// ==========================================
// Constants & Configuration
// ==========================================

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// ==========================================
// Component
// ==========================================

function ProductImageManager({ productId, images }: ProductImageManagerProps) {
  // --- Hooks & State ---
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading states to manage UI feedback
  const [isUploading, setIsUploading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // --- Handlers ---

  /**
   * Handles the file selection and upload process.
   * Performs client-side validation before dispatching to the store.
   */
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);

    // 1. Validation: Capacity check
    if (images.length + files.length > MAX_IMAGES) {
      toast.error(`Sản phẩm chỉ có tối đa ${MAX_IMAGES} ảnh`);
      return;
    }

    // 2. Validation: File type and size checks
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

    setIsUploading(true);
    try {
      await dispatch(
        addProductImagesThunk({ productId, imageFiles: files })
      ).unwrap();
      toast.success('Đã thêm ảnh');
    } catch (err) {
      if (err) toast.error(err as string);
    } finally {
      setIsUploading(false);
      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  /**
   * Handles deleting an image via the Redux thunk.
   */
  const handleDelete = async (publicId: string) => {
    setProcessingId(publicId);
    try {
      await dispatch(deleteProductImageThunk({ productId, publicId })).unwrap();
      toast.success('Đã xóa ảnh');
    } catch (err) {
      if (err) toast.error(err as string);
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * Updates the primary image status in the store.
   */
  const handleSetPrimary = async (publicId: string) => {
    setProcessingId(publicId);
    try {
      await dispatch(setPrimaryImageThunk({ productId, publicId })).unwrap();
      toast.success('Đã đặt làm ảnh chính');
    } catch (err) {
      if (err) toast.error(err as string);
    } finally {
      setProcessingId(null);
    }
  };

  // --- Render ---
  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {/* Existing Images Grid */}
        {images.map((img) => (
          <div key={img.publicId} className="group relative h-24 w-24">
            <img
              src={img.url}
              alt={img.alt ?? ''}
              className={`h-24 w-24 rounded-md border object-cover ${
                img.isPrimary ? 'border-2 border-[#0047AB]' : 'border-gray-200'
              }`}
            />

            {/* Primary Indicator Badge */}
            {img.isPrimary && (
              <span className="absolute bottom-0 left-0 right-0 rounded-b-md bg-[#0047AB] py-0.5 text-center text-[10px] text-white">
                Ảnh chính
              </span>
            )}

            {/* Hover Actions: Delete and Set Primary */}
            <div className="absolute inset-0 flex items-center justify-center gap-1 rounded-md bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              {!img.isPrimary && (
                <button
                  type="button"
                  onClick={() => handleSetPrimary(img.publicId)}
                  disabled={processingId === img.publicId}
                  className="rounded-full bg-white p-1.5 text-[#0047AB] disabled:opacity-50"
                  title="Đặt làm ảnh chính"
                >
                  <Star size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDelete(img.publicId)}
                disabled={processingId === img.publicId}
                className="rounded-full bg-white p-1.5 text-red-500 disabled:opacity-50"
                title="Xóa ảnh"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}

        {/* Upload Trigger (Visible if under max limit) */}
        {images.length < MAX_IMAGES && (
          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-gray-300 text-gray-400 hover:border-[#0047AB] hover:text-[#0047AB]">
            <Upload size={18} />
            <span className="text-[10px]">
              {isUploading ? 'Đang tải...' : 'Thêm ảnh'}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={isUploading}
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Footer Helper Text */}
      <p className="mt-2 text-xs text-gray-400">
        Di chuột vào ảnh để đặt ảnh chính hoặc xóa. Tối đa {MAX_IMAGES} ảnh,
        5MB/ảnh.
      </p>
    </div>
  );
}

export default ProductImageManager;
