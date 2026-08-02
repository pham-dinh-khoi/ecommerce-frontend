import { useState } from 'react';
import { Plus } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LocationSelect from '@/features/user/components/LocationSelect';

// Types
import type { Address } from '@/types/user.types';
import type { NewAddressInput } from '@/types/order.types';

interface AddressSelectorProps {
  addresses: Address[];
  selectedAddressId: string | null;
  onSelectAddress: (addressId: string) => void;
  newAddress: NewAddressInput | null;
  onNewAddressChange: (address: NewAddressInput | null) => void;
}

/**
 * AddressSelector Component
 * Provides a UI to select from existing addresses or input a new one.
 * It manages the toggle state between existing list view and "add new" form view.
 */
function AddressSelector({
  addresses,
  selectedAddressId,
  onSelectAddress,
  newAddress,
  onNewAddressChange,
}: AddressSelectorProps) {
  // --- State Management ---

  // Determine initial view: show form by default if no addresses are saved
  const [showNewForm, setShowNewForm] = useState(addresses.length === 0);

  // Local state for the new address form
  const [form, setForm] = useState<NewAddressInput>(
    newAddress ?? {
      recipientName: '',
      recipientPhone: '',
      province: '',
      district: '',
      ward: '',
      streetAddress: '',
    }
  );

  // --- Handlers ---

  /**
   * Updates local form state and synchronizes with the parent component
   * using the provided onNewAddressChange callback.
   */
  const updateForm = (patch: Partial<NewAddressInput>) => {
    const updated = { ...form, ...patch };
    setForm(updated);
    onNewAddressChange(updated);
  };

  // --- Render ---

  return (
    <div className="space-y-3">
      {/* 1. Existing Addresses List */}
      {addresses.map((addr) => (
        <label
          key={addr._id}
          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${
            !showNewForm && selectedAddressId === addr._id
              ? 'border-[#0047AB] bg-blue-50'
              : 'border-gray-200'
          }`}
        >
          <input
            type="radio"
            name="address"
            checked={!showNewForm && selectedAddressId === addr._id}
            onChange={() => {
              setShowNewForm(false);
              onSelectAddress(addr._id);
              onNewAddressChange(null); // Clear new address when selecting existing
            }}
            className="mt-1"
          />
          <div>
            <p className="font-medium text-[#1A1A1A]">
              {addr.label}{' '}
              {addr.isDefault && (
                <span className="text-xs text-[#0047AB]">(Mặc định)</span>
              )}
            </p>
            <p className="text-sm text-gray-600">
              {addr.recipientName} · {addr.recipientPhone}
            </p>
            <p className="text-sm text-gray-500">
              {addr.streetAddress}, {addr.ward}, {addr.district},{' '}
              {addr.province}
            </p>
          </div>
        </label>
      ))}

      {/* 2. Toggle to "Add New Address" */}
      {!showNewForm && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowNewForm(true)}
        >
          <Plus size={14} className="mr-1" />
          Dùng địa chỉ khác
        </Button>
      )}

      {/* 3. New Address Form */}
      {showNewForm && (
        <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tên người nhận</Label>
              <Input
                value={form.recipientName}
                onChange={(e) => updateForm({ recipientName: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Số điện thoại</Label>
              <Input
                value={form.recipientPhone}
                onChange={(e) => updateForm({ recipientPhone: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Khu vực</Label>
            <div className="mt-1">
              <LocationSelect
                province={form.province}
                district={form.district}
                ward={form.ward}
                onChange={(vals) => updateForm(vals)}
              />
            </div>
          </div>

          <div>
            <Label>Địa chỉ cụ thể</Label>
            <Input
              value={form.streetAddress}
              onChange={(e) => updateForm({ streetAddress: e.target.value })}
              className="mt-1"
              placeholder="Số nhà, tên đường..."
            />
          </div>

          {/* Cancel button to revert to existing addresses */}
          {addresses.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowNewForm(false);
                onNewAddressChange(null);
              }}
            >
              Hủy, dùng địa chỉ đã lưu
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default AddressSelector;
