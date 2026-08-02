import { useState } from 'react';
import { toast } from 'sonner';

// Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import LocationSelect from './LocationSelect';

// Store & Actions
import { useAppDispatch } from '@/store/hooks';
import { addAddressThunk, updateAddressThunk } from '@/features/user/userSlice';

// Validation & Types
import { addressFormSchema } from '@/lib/validations/address.validation';
import type { Address, AddressPayload } from '@/types/user.types';

interface AddressFormProps {
  initialData?: Address; // If present, component acts as Edit mode; otherwise, Create mode.
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * AddressForm Component
 *
 * Handles both creation and editing of user addresses.
 * Uses local state for controlled inputs and manual Zod validation.
 */
function AddressForm({ initialData, onSuccess, onCancel }: AddressFormProps) {
  const dispatch = useAppDispatch();
  const isEditMode = !!initialData;

  // --- Form State Management ---
  const [label, setLabel] = useState(initialData?.label ?? '');
  const [recipientName, setRecipientName] = useState(
    initialData?.recipientName ?? ''
  );
  const [recipientPhone, setRecipientPhone] = useState(
    initialData?.recipientPhone ?? ''
  );
  const [province, setProvince] = useState(initialData?.province ?? '');
  const [district, setDistrict] = useState(initialData?.district ?? '');
  const [ward, setWard] = useState(initialData?.ward ?? '');
  const [streetAddress, setStreetAddress] = useState(
    initialData?.streetAddress ?? ''
  );
  const [isDefault, setIsDefault] = useState(initialData?.isDefault ?? false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validation Logic
   * Runs the Zod schema against the current state.
   * If validation fails, maps issues to the local `errors` object for UI display.
   */
  const validate = (): boolean => {
    const result = addressFormSchema.safeParse({
      label,
      recipientName,
      recipientPhone,
      province,
      district,
      ward,
      streetAddress,
      isDefault,
    });

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!newErrors[field]) newErrors[field] = issue.message;
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  /**
   * Form Submission Handler
   * Dispatches either an update or add thunk based on mode.
   * Cleans input data (trimming) before sending to the API.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const payload: AddressPayload = {
      label: label.trim(),
      recipientName: recipientName.trim(),
      recipientPhone: recipientPhone.trim(),
      province,
      district,
      ward,
      streetAddress: streetAddress.trim(),
      isDefault,
    };

    try {
      if (isEditMode) {
        await dispatch(
          updateAddressThunk({ addressId: initialData._id, payload })
        ).unwrap();
        toast.success('Cập nhật địa chỉ thành công');
      } else {
        await dispatch(addAddressThunk(payload)).unwrap();
        toast.success('Thêm địa chỉ thành công');
      }
      onSuccess();
    } catch (err) {
      if ((err as string).trim()) toast.error(err as string);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4"
    >
      {/* Address Label */}
      <div>
        <Label htmlFor="label">Nhãn địa chỉ</Label>
        <Input
          id="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="mt-1"
          placeholder="VD: Nhà riêng, Công ty"
        />
        {errors.label && (
          <p className="mt-1 text-sm text-red-600">{errors.label}</p>
        )}
      </div>

      {/* Recipient Details */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="recipientName">Tên người nhận</Label>
          <Input
            id="recipientName"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            className="mt-1"
          />
          {errors.recipientName && (
            <p className="mt-1 text-sm text-red-600">{errors.recipientName}</p>
          )}
        </div>
        <div>
          <Label htmlFor="recipientPhone">Số điện thoại</Label>
          <Input
            id="recipientPhone"
            value={recipientPhone}
            onChange={(e) => setRecipientPhone(e.target.value)}
            className="mt-1"
          />
          {errors.recipientPhone && (
            <p className="mt-1 text-sm text-red-600">{errors.recipientPhone}</p>
          )}
        </div>
      </div>

      {/* Location Selector */}
      {/* Technical Note: LocationSelect receives initial values. Even if child 
          districts/wards are empty initially, it displays the stored names 
          correctly to the user. */}
      <div>
        <Label>Khu vực</Label>
        <div className="mt-1">
          <LocationSelect
            province={province}
            district={district}
            ward={ward}
            onChange={(vals) => {
              setProvince(vals.province);
              setDistrict(vals.district);
              setWard(vals.ward);
            }}
          />
        </div>
        {(errors.province || errors.district || errors.ward) && (
          <p className="mt-1 text-sm text-red-600">
            {errors.province || errors.district || errors.ward}
          </p>
        )}
      </div>

      {/* Detailed Address */}
      <div>
        <Label htmlFor="streetAddress">Địa chỉ cụ thể</Label>
        <Input
          id="streetAddress"
          value={streetAddress}
          onChange={(e) => setStreetAddress(e.target.value)}
          className="mt-1"
          placeholder="Số nhà, tên đường..."
        />
        {errors.streetAddress && (
          <p className="mt-1 text-sm text-red-600">{errors.streetAddress}</p>
        )}
      </div>

      {/* Default Address Checkbox */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="isDefault"
          checked={isDefault}
          onCheckedChange={(checked) => setIsDefault(checked === true)}
        />
        <Label htmlFor="isDefault" className="font-normal">
          Đặt làm địa chỉ mặc định
        </Label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#0047AB] hover:bg-[#003a8c]"
          size="sm"
        >
          {isSubmitting ? 'Đang lưu...' : 'Lưu địa chỉ'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Hủy
        </Button>
      </div>
    </form>
  );
}

export default AddressForm;
