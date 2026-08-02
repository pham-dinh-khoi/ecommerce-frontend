import { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import StarRatingInput from './StarRatingInput';
import { useAppDispatch } from '@/store/hooks';
import { createReviewThunk } from '@/features/review/reviewSlice';
import {
  reviewFormSchema,
  type ReviewFormValues,
} from '@/lib/validations/review.validation';

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

interface ReviewFormProps {
  productId: string;
  productName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

function ReviewForm({
  productId,
  productName,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State management for images:
  // imageFiles: Holds the actual File objects for API payload submission
  // imagePreviews: Holds the ObjectURLs for displaying thumbnails in the UI
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  // Initialize react-hook-form with Zod validation
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: { rating: 0 },
  });

  /**
   * Handles user file selection.
   * Validates file count, size, and MIME types before updating state.
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);

    // Validation: Check total quantity
    if (imageFiles.length + files.length > MAX_IMAGES) {
      toast.error(`Chỉ được tối đa ${MAX_IMAGES} ảnh`);
      return;
    }

    // Validation: Check file type and size
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

    // Update state: Add files and generate previews
    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);

    // Clear input to allow re-selecting the same file if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /**
   * Removes an image from the submission queue and revokes object URL to free memory.
   */
  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Form submission handler.
   * Dispatches the review creation thunk and manages post-submission UI state.
   */
  const onSubmit = async (values: ReviewFormValues) => {
    setServerError(null);
    try {
      const review = await dispatch(
        createReviewThunk({
          productId,
          rating: Number(values.rating),
          title: values.title,
          content: values.content,
          imageFiles,
        })
      ).unwrap();

      // Provide feedback based on whether moderation is required
      if (review.moderation.status === 'approved') {
        toast.success('Đánh giá của bạn đã được đăng');
      } else {
        toast.success('Đã gửi đánh giá, đang chờ duyệt');
      }
      onSuccess();
    } catch (err) {
      // Capture and display server-side errors
      if ((err as string)?.trim()) setServerError(err as string);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-lg border border-gray-200 bg-white p-5"
    >
      {/* Product Header */}
      <div>
        <p className="text-sm text-gray-500">Đánh giá sản phẩm</p>
        <p className="font-medium text-[#1A1A1A]">{productName}</p>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      {/* Star Rating Input (Controlled) */}
      <div>
        <Label>Số sao</Label>
        <div className="mt-1">
          <Controller
            name="rating"
            control={control}
            render={({ field }) => (
              <StarRatingInput
                value={Number(field.value)}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        {errors.rating && (
          <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
        )}
      </div>

      {/* Text Fields */}
      <div>
        <Label htmlFor="title">Tiêu đề</Label>
        <Input
          id="title"
          {...register('title')}
          className="mt-1"
          placeholder="Tóm tắt cảm nhận của bạn"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="content">Nội dung</Label>
        <Textarea
          id="content"
          {...register('content')}
          className="mt-1"
          rows={4}
          placeholder="Chia sẻ chi tiết trải nghiệm của bạn về sản phẩm..."
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>

      {/* Image Upload Section */}
      <div>
        <Label>Hình ảnh (tùy chọn)</Label>
        <div className="mt-1 flex flex-wrap gap-2">
          {imagePreviews.map((src, idx) => (
            <div key={idx} className="relative h-20 w-20">
              <img
                src={src}
                alt=""
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

          {/* Upload Trigger */}
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

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#0047AB] hover:bg-[#003a8c]"
        >
          {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
      </div>
    </form>
  );
}

export default ReviewForm;
