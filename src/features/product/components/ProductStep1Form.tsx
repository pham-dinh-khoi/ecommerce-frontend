import { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';
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
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createProductThunk } from '@/features/product/productSlice';
import CategorySelect from './CategorySelect';
import {
  productStep1FormSchema,
  type ProductStep1FormValues,
} from '@/lib/validations/product.validation';
import { buildWizardStep2Url } from '@/constants/routes';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB — khớp giới hạn backend
const MAX_IMAGES = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

interface StatusOption {
  value: ProductStep1FormValues['status'];
  label: string;
}

const statusOptions: StatusOption[] = [
  { value: 'draft', label: 'Nháp' },
  { value: 'active', label: 'Đang bán' },
  { value: 'inactive', label: 'Ngừng bán' },
];

function ProductStep1Form() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { flatList: categories } = useAppSelector((state) => state.category);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductStep1FormValues>({
    resolver: zodResolver(productStep1FormSchema),
    defaultValues: { status: 'draft' },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (imageFiles.length + files.length > MAX_IMAGES) {
      toast.error(`Chỉ được tối đa ${MAX_IMAGES} ảnh`);
      return;
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`File "${file.name}" không đúng định dạng cho phép`);
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: ProductStep1FormValues) => {
    setServerError(null);
    try {
      const product = await dispatch(
        createProductThunk({
          ...values,
          status: values.status ?? 'draft', // ⭐ đảm bảo luôn có giá trị, khớp CreateProductPayload
          imageFiles,
        })
      ).unwrap();
      toast.success('Tạo sản phẩm thành công, tiếp tục thêm biến thể');
      navigate(buildWizardStep2Url(product._id));
    } catch (err) {
      if ((err as string).trim()) setServerError(err as string);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-5">
      {serverError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <div>
        <Label htmlFor="name">Tên sản phẩm</Label>
        <Input
          id="name"
          {...register('name')}
          className="mt-1"
          placeholder="VD: Áo sơ mi nam dài tay"
        />
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
          placeholder="Mô tả chi tiết về sản phẩm..."
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
          placeholder="Tóm tắt ngắn gọn (tùy chọn)"
        />
        {errors.shortDescription && (
          <p className="mt-1 text-sm text-red-600">
            {errors.shortDescription.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Danh mục</Label>
          <div className="mt-1">
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
          <Input
            id="brand"
            {...register('brand')}
            className="mt-1"
            placeholder="VD: Uniqlo (tùy chọn)"
          />
        </div>
      </div>

      <div>
        <Label>Trạng thái</Label>
        <div className="mt-1">
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
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
        <p className="mt-1 text-xs text-gray-400">
          Sản phẩm chưa có biến thể nên để "Nháp", kích hoạt sau khi hoàn tất
        </p>
      </div>

      <div>
        <Label>Ảnh sản phẩm</Label>
        <div className="mt-1 flex flex-wrap gap-3">
          {imagePreviews.map((src, idx) => (
            <div key={idx} className="relative h-24 w-24">
              <img
                src={src}
                alt={`Preview ${idx}`}
                className="h-24 w-24 rounded-md border border-gray-200 object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
              >
                <X size={12} />
              </button>
              {idx === 0 && (
                <span className="absolute bottom-0 left-0 right-0 rounded-b-md bg-black/50 py-0.5 text-center text-[10px] text-white">
                  Ảnh chính
                </span>
              )}
            </div>
          ))}

          {imageFiles.length < MAX_IMAGES && (
            <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-gray-300 text-gray-400 hover:border-[#0047AB] hover:text-[#0047AB]">
              <Upload size={18} />
              <span className="text-[10px]">Thêm ảnh</span>
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
        <p className="mt-1 text-xs text-gray-400">
          JPEG, PNG, WebP — tối đa 5MB/ảnh, tối đa {MAX_IMAGES} ảnh. Ảnh đầu
          tiên là ảnh chính.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#0047AB] hover:bg-[#003a8c]"
        >
          {isSubmitting ? 'Đang tạo...' : 'Tiếp tục →'}
        </Button>
      </div>
    </form>
  );
}

export default ProductStep1Form;
