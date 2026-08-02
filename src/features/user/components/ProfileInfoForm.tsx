import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

// Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Store & Actions
import { useAppDispatch } from '@/store/hooks';
import { updateProfileThunk } from '@/features/user/userSlice';

// Validation & Types
import {
  profileFormSchema,
  type ProfileFormValues,
} from '@/lib/validations/profile.validation';
import type { UserProfile } from '@/types/user.types';

interface ProfileInfoFormProps {
  profile: UserProfile;
}

// Constant for gender options defined outside the component to prevent re-creation on re-renders
const GENDER_OPTIONS = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
];

/**
 * ProfileInfoForm component handles the user profile update logic.
 * It integrates React Hook Form with Zod for validation and provides
 * controlled inputs for profile fields.
 */
function ProfileInfoForm({ profile }: ProfileInfoFormProps) {
  const dispatch = useAppDispatch();

  // Initialize form with Zod resolver and default values derived from props
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile.name,
      phone: profile.phone ?? '',
      gender: profile.gender,
      // Date input requires YYYY-MM-DD format
      dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : '',
    },
  });

  /**
   * Handles form submission.
   * Dispatches the updateProfileThunk and provides user feedback via toasts.
   */
  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await dispatch(
        updateProfileThunk({
          name: values.name,
          phone: values.phone || undefined,
          gender: values.gender,
          dateOfBirth: values.dateOfBirth || undefined,
        })
      ).unwrap();
      toast.success('Cập nhật hồ sơ thành công');
    } catch (err) {
      // Cast error to string for toast display
      if ((err as string).trim()) toast.error(err as string);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4">
      {/* Email - Readonly field */}
      <div>
        <Label>Email</Label>
        <Input value={profile.email} disabled className="mt-1 bg-gray-50" />
        <p className="mt-1 text-xs text-gray-400">Email không thể thay đổi</p>
      </div>

      {/* Name Input */}
      <div>
        <Label htmlFor="name">Họ và tên</Label>
        <Input id="name" {...register('name')} className="mt-1" />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Phone and Date of Birth - Row layout */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Số điện thoại</Label>
          <Input id="phone" {...register('phone')} className="mt-1" />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="dateOfBirth">Ngày sinh</Label>
          <Input
            id="dateOfBirth"
            type="date"
            {...register('dateOfBirth')}
            className="mt-1"
          />
        </div>
      </div>

      {/* Gender Selection - Using Controller for Radix UI integration */}
      <div>
        <Label>Giới tính</Label>
        <div className="mt-1">
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(val) => val && field.onChange(val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn giới tính">
                    {(val: string) =>
                      GENDER_OPTIONS.find((g) => g.value === val)?.label ?? ''
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((opt) => (
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

      {/* Submit Button */}
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

export default ProfileInfoForm;
