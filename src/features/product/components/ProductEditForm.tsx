import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

// Components & UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CategorySelect from './CategorySelect';

// Store & Hooks
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateProductThunk } from '@/features/product/productSlice';

// Utilities & Types
import {
  productStep1FormSchema,
  type ProductStep1FormValues,
} from '@/lib/validations/product.validation';
import type { Product } from '@/types/product.types';

// ==========================================
// Types & Interfaces
// ==========================================

interface ProductEditFormProps {
  product: Product;
}

// ==========================================
// Constants
// ==========================================

const statusOptions = [
  { value: 'draft', label: 'Nháp' },
  { value: 'active', label: 'Đang bán' },
  { value: 'inactive', label: 'Ngừng bán' },
  { value: 'archived', label: 'Lưu trữ' },
];

// ==========================================
// Component
// ==========================================

/**
 * ProductEditForm
 * Handles the editing of core product details including metadata and status.
 */
function ProductEditForm({ product }: ProductEditFormProps) {
  const dispatch = useAppDispatch();
  const { flatList: categories } = useAppSelector((state) => state.category);

  // --- Form Initialization ---
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductStep1FormValues>({
    resolver: zodResolver(productStep1FormSchema),
    // Pre-populate form with existing product data
    defaultValues: {
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription ?? '',
      // Normalize category: handle case where category is an object or an ID string
      category:
        product.category && typeof product.category === 'object'
          ? product.category._id
          : product.category,
      brand: product.brand ?? '',
      status: product.status,
    },
  });

  // --- Handlers ---

  /**
   * Submits the form data to the Redux store via updateProductThunk.
   */
  const onSubmit = async (values: ProductStep1FormValues) => {
    try {
      await dispatch(
        updateProductThunk({
          id: product._id,
          payload: { ...values, status: values.status ?? 'draft' },
        })
      ).unwrap();
      toast.success('Cập nhật thông tin thành công');
    } catch (err) {
      if (err) toast.error(err as string);
    }
  };

  // --- Render ---
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Basic Information Section */}
      <div>
        <Label htmlFor="name">Tên sản phẩm</Label>
        <Input id="name" {...register('name')} className="mt-1" />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Mô tả chi tiết</Label>
        <Textarea
          id="description"
          {...register('description')}
          className="mt-1"
          rows={5}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="shortDescription">Mô tả ngắn</Label>
        <Textarea
          id="shortDescription"
          {...register('shortDescription')}
          className="mt-1"
          rows={2}
        />
      </div>

      {/* Categorization & Brand Section */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Danh mục</Label>
          <div className="mt-1">
            {/* Controller used to integrate non-native inputs (Custom CategorySelect) */}
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <CategorySelect
                  categories={categories}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">
              {errors.category.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="brand">Thương hiệu</Label>
          <Input id="brand" {...register('brand')} className="mt-1" />
        </div>
      </div>

      {/* Status Section */}
      <div>
        <Label>Trạng thái</Label>
        <div className="mt-1">
          {/* Controller used to handle Shadcn Select component */}
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(val) => {
                  if (val) field.onChange(val);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn trạng thái">
                    {(val: string) =>
                      statusOptions.find((s) => s.value === val)?.label ?? ''
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="bg-[#0047AB] hover:bg-[#003a8c]"
      >
        {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
      </Button>
    </form>
  );
}

export default ProductEditForm;
