import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// State & Logic
import { useAppDispatch } from '@/store/hooks';
import {
  createCouponThunk,
  updateCouponThunk,
} from '@/features/coupon/couponSlice';
import {
  couponFormSchema,
  type CouponFormValues,
} from '@/lib/validations/coupon.validation';
import { ROUTES } from '@/constants/routes';
import type { Coupon } from '@/types/coupon.types';

// --- Constants & Helpers ---

const discountTypeOptions = [
  { value: 'percentage', label: 'Giảm theo phần trăm (%)' },
  { value: 'fixed', label: 'Giảm số tiền cố định' },
];

/**
 * Converts ISO date strings to datetime-local format (YYYY-MM-DDTHH:mm).
 * Used to populate HTML date input fields.
 */
function toDatetimeLocal(isoString?: string): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface CouponFormProps {
  initialData?: Coupon;
}

/**
 * CouponForm Component
 * Handles both creation and editing of coupons using react-hook-form and Zod validation.
 */
function CouponForm({ initialData }: CouponFormProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isEditMode = !!initialData;

  // --- Form Initialization ---
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: initialData?.code ?? '',
      description: initialData?.description ?? '',
      discountType:
        (initialData?.discount.type as 'percentage' | 'fixed') ?? 'percentage',
      discountAmount: initialData?.discount.amount ?? 0,
      maxDiscount: initialData?.discount.maxDiscount ?? '',
      minOrderAmount: initialData?.conditions.minOrderAmount ?? '',
      maxUsageTotal: initialData?.limits.maxUsageTotal ?? '',
      maxUsagePerUser: initialData?.limits.maxUsagePerUser ?? 1,
      startDate: toDatetimeLocal(initialData?.startDate),
      endDate: toDatetimeLocal(initialData?.endDate),
      isActive: initialData?.isActive ?? true,
    },
  });

  // --- Handlers ---

  const onSubmit = async (values: CouponFormValues) => {
    // Transform form values into API-compatible payload
    const payload = {
      code: values.code,
      description: values.description,
      discountType: values.discountType,
      discountAmount: Number(values.discountAmount),

      // Handle optional numeric fields: map empty strings to undefined
      maxDiscount:
        values.maxDiscount === '' || values.maxDiscount === undefined
          ? undefined
          : Number(values.maxDiscount),
      minOrderAmount:
        values.minOrderAmount === '' || values.minOrderAmount === undefined
          ? undefined
          : Number(values.minOrderAmount),
      maxUsageTotal:
        values.maxUsageTotal === '' || values.maxUsageTotal === undefined
          ? undefined
          : Number(values.maxUsageTotal),

      maxUsagePerUser: Number(values.maxUsagePerUser),
      startDate: new Date(values.startDate).toISOString(),
      endDate: new Date(values.endDate).toISOString(),
      isActive: values.isActive,
    };

    try {
      if (isEditMode) {
        await dispatch(
          updateCouponThunk({ id: initialData._id, payload })
        ).unwrap();
        toast.success('Cập nhật coupon thành công');
      } else {
        await dispatch(createCouponThunk(payload)).unwrap();
        toast.success('Tạo coupon thành công');
      }
      navigate(ROUTES.ADMIN_COUPONS);
    } catch (err) {
      if ((err as string)?.trim()) toast.error(err as string);
    }
  };

  // --- Render ---

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5">
      {/* Basic Info */}
      <div>
        <Label htmlFor="code">Mã coupon</Label>
        <Input
          id="code"
          {...register('code')}
          disabled={isEditMode}
          className="mt-1 uppercase"
          placeholder="VD: SALE50"
        />
        {isEditMode && (
          <p className="mt-1 text-xs text-gray-400">
            Không thể đổi mã sau khi tạo
          </p>
        )}
        {errors.code && (
          <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          {...register('description')}
          className="mt-1"
          rows={2}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Pricing & Logic */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Loại giảm giá</Label>
          <div className="mt-1">
            <Controller
              name="discountType"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => val && field.onChange(val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn loại">
                      {(val: string) =>
                        discountTypeOptions.find((o) => o.value === val)
                          ?.label ?? ''
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {discountTypeOptions.map((opt) => (
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

        <div>
          <Label htmlFor="discountAmount">Giá trị giảm</Label>
          <Input
            id="discountAmount"
            type="number"
            {...register('discountAmount')}
            className="mt-1"
            placeholder="VD: 20 (%) hoặc 50000 (đ)"
          />
          {errors.discountAmount && (
            <p className="mt-1 text-sm text-red-600">
              {errors.discountAmount.message}
            </p>
          )}
        </div>
      </div>

      {/* Constraints & Limits */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="maxDiscount">Giảm tối đa (đ, tùy chọn)</Label>
          <Input
            id="maxDiscount"
            type="number"
            {...register('maxDiscount')}
            className="mt-1"
          />
          <p className="mt-1 text-xs text-gray-400">
            Chỉ áp dụng khi giảm theo %
          </p>
        </div>
        <div>
          <Label htmlFor="minOrderAmount">Đơn tối thiểu (đ, tùy chọn)</Label>
          <Input
            id="minOrderAmount"
            type="number"
            {...register('minOrderAmount')}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="maxUsageTotal">
            Tổng lượt dùng (để trống = không giới hạn)
          </Label>
          <Input
            id="maxUsageTotal"
            type="number"
            {...register('maxUsageTotal')}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="maxUsagePerUser">Lượt dùng / user</Label>
          <Input
            id="maxUsagePerUser"
            type="number"
            {...register('maxUsagePerUser')}
            className="mt-1"
          />
        </div>
      </div>

      {/* Schedule & Activation */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Ngày giờ bắt đầu</Label>
          <Input
            id="startDate"
            type="datetime-local"
            {...register('startDate')}
            className="mt-1"
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.startDate.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="endDate">Ngày giờ kết thúc</Label>
          <Input
            id="endDate"
            type="datetime-local"
            {...register('endDate')}
            className="mt-1"
          />
          {errors.endDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.endDate.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="isActive"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
            />
          )}
        />
        <Label htmlFor="isActive" className="font-normal">
          Kích hoạt ngay
        </Label>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="bg-[#0047AB] hover:bg-[#003a8c]"
      >
        {isSubmitting ? 'Đang lưu...' : isEditMode ? 'Cập nhật' : 'Tạo coupon'}
      </Button>
    </form>
  );
}

export default CouponForm;
