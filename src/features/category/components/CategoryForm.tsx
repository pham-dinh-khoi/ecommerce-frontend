// =============================================================================
// Imports
// =============================================================================

// 1. React & Hooks
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. External Libraries
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';

// 3. UI Components (Shadcn)
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

// 4. Feature & Store Logic
import { useAppDispatch } from '@/store/hooks';
import {
  createCategoryThunk,
  updateCategoryThunk,
  invalidateTree,
} from '@/features/category/categorySlice';
import ParentCategorySelect from './ParentCategorySelect';

// 5. Types & Constants
import {
  categoryFormSchema,
  type CategoryFormValues,
} from '@/lib/validations/category.validation';
import type { Category } from '@/types/category.types';
import { ROUTES } from '@/constants/routes';

// =============================================================================
// Constants
// =============================================================================

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// =============================================================================
// Component Definition
// =============================================================================

interface CategoryFormProps {
  categories: Category[];
  initialData?: Category;
}

/**
 * CategoryForm manages both creation and update of categories.
 * It handles local image state, validation via Zod, and API interactions via Redux.
 */
function CategoryForm({ categories, initialData }: CategoryFormProps) {
  const isEditMode = !!initialData;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Local State ---
  // Image is kept outside the RHF form to separate form validation logic
  // from raw file object management.
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    initialData?.image?.url
  );
  const [serverError, setServerError] = useState<string | null>(null);

  // --- Form Hook ---
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      parent: initialData?.parent ?? undefined,
      sortOrder: initialData?.sortOrder ?? 0,
      isActive: initialData?.isActive ?? true,
    },
  });

  // --- Handlers ---

  /**
   * Processes file input, validates type and size, and sets preview/file states.
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Chỉ chấp nhận ảnh định dạng JPEG, PNG, WebP');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Ảnh không được vượt quá 2MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  /**
   * Resets image state and clears the file input element.
   */
  const handleRemoveImage = () => {
    setImageFile(undefined);
    setImagePreview(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /**
   * Submits the form data. Maps form values and image state into a payload
   * for the API.
   */
  const onSubmit = async (values: CategoryFormValues) => {
    setServerError(null);

    // Construct payload for FormData (as handled in CategoryService)
    const payload = {
      name: values.name,
      description: values.description?.trim() || undefined,
      parent: values.parent,
      sortOrder: Number(values.sortOrder),
      isActive: values.isActive,
      imageFile,
    };

    try {
      if (isEditMode) {
        await dispatch(
          updateCategoryThunk({ id: initialData._id, payload })
        ).unwrap();
        toast.success('Cập nhật danh mục thành công');
      } else {
        await dispatch(createCategoryThunk(payload)).unwrap();
        toast.success('Tạo danh mục thành công');
      }

      // Refresh cache after successful modification
      dispatch(invalidateTree());
      navigate(ROUTES.ADMIN_CATEGORIES);
    } catch (err) {
      if ((err as string)?.trim()) setServerError(err as string);
    }
  };

  // ===========================================================================
  // Render
  // ===========================================================================

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5">
      {/* Global Server Errors */}
      {serverError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      {/* Name Input */}
      <div>
        <Label htmlFor="name">Tên danh mục</Label>
        <Input
          id="name"
          {...register('name')}
          className="mt-1"
          placeholder="VD: Thời trang nam"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Description Input */}
      <div>
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          {...register('description')}
          className="mt-1"
          rows={3}
          placeholder="Mô tả ngắn về danh mục (tùy chọn)"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Parent Category Selection */}
      <div>
        <Label>Danh mục cha</Label>
        <div className="mt-1">
          <Controller
            name="parent"
            control={control}
            render={({ field }) => (
              <ParentCategorySelect
                categories={categories}
                value={field.value}
                onChange={field.onChange}
                excludeId={initialData?._id}
              />
            )}
          />
        </div>
        <p className="mt-1 text-xs text-gray-400">
          Tối đa 3 cấp danh mục (gốc → con → cháu)
        </p>
      </div>

      {/* Image Upload Area */}
      <div>
        <Label>Hình ảnh</Label>
        <div className="mt-1">
          {imagePreview ? (
            <div className="relative w-40">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-28 w-40 rounded-md border border-gray-200 object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex h-28 w-40 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-gray-300 text-gray-400 hover:border-[#0047AB] hover:text-[#0047AB]">
              <Upload size={20} />
              <span className="text-xs">Chọn ảnh</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
          <p className="mt-1 text-xs text-gray-400">
            JPEG, PNG, WebP — tối đa 2MB
          </p>
        </div>
      </div>

      {/* Settings Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sortOrder">Thứ tự hiển thị</Label>
          <Input
            id="sortOrder"
            type="number"
            min={0}
            {...register('sortOrder')}
            className="mt-1"
          />
          {errors.sortOrder && (
            <p className="mt-1 text-sm text-red-600">
              {errors.sortOrder.message}
            </p>
          )}
        </div>

        <div className="flex items-end pb-2">
          <div className="flex items-center gap-2">
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="isActive"
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                />
              )}
            />
            <Label htmlFor="isActive" className="font-normal">
              Kích hoạt (hiển thị công khai)
            </Label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#0047AB] hover:bg-[#003a8c]"
        >
          {isSubmitting
            ? 'Đang lưu...'
            : isEditMode
              ? 'Cập nhật'
              : 'Tạo danh mục'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(ROUTES.ADMIN_CATEGORIES)}
        >
          Hủy
        </Button>
      </div>
    </form>
  );
}

export default CategoryForm;
