import { useState } from 'react';
import { toast } from 'sonner';
import { Star, Pencil, Trash2 } from 'lucide-react';

// Components
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import AddressForm from './AddressForm';

// Store & Actions
import { useAppDispatch } from '@/store/hooks';
import {
  deleteAddressThunk,
  setDefaultAddressThunk,
} from '@/features/user/userSlice';

// Types
import type { Address } from '@/types/user.types';

interface AddressListProps {
  addresses: Address[];
}

/**
 * AddressList Component
 *
 * Manages the display of user addresses and provides full CRUD capabilities:
 * - View list with 'Default' tagging.
 * - Set a specific address as default.
 * - Edit an existing address.
 * - Delete an address (with confirmation dialog).
 * - Add a new address.
 */
function AddressList({ addresses }: AddressListProps) {
  const dispatch = useAppDispatch();

  // --- UI State Management ---
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  /**
   * Sets the specified address as the user's default.
   * Dispatches an async action and manages the loading state for UI feedback.
   */
  const handleSetDefault = async (address: Address) => {
    setSettingDefaultId(address._id);
    try {
      await dispatch(setDefaultAddressThunk(address._id)).unwrap();
      toast.success('Đã đặt làm địa chỉ mặc định');
    } catch (err) {
      if ((err as string).trim()) toast.error(err as string);
    } finally {
      setSettingDefaultId(null);
    }
  };

  /**
   * Handles permanent deletion of an address.
   * Triggered by the confirmation dialog action.
   */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteAddressThunk(deleteTarget._id)).unwrap();
      toast.success('Đã xóa địa chỉ');
    } catch (err) {
      if (err) toast.error(err as string);
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Empty State */}
      {addresses.length === 0 && !showAddForm && (
        <p className="text-sm text-gray-400">Bạn chưa có địa chỉ nào</p>
      )}

      {/* Address List Mapping */}
      {addresses.map((addr) =>
        // Render Edit Form if current item is being edited
        editingAddress?._id === addr._id ? (
          <AddressForm
            key={addr._id}
            initialData={addr}
            onSuccess={() => setEditingAddress(null)}
            onCancel={() => setEditingAddress(null)}
          />
        ) : (
          // Render Standard Address Card
          <div
            key={addr._id}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#1A1A1A]">
                    {addr.label}
                  </span>
                  {addr.isDefault && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-[#0047AB]">
                      Mặc định
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {addr.recipientName} · {addr.recipientPhone}
                </p>
                <p className="mt-0.5 text-sm text-gray-500">
                  {addr.streetAddress}, {addr.ward}, {addr.district},{' '}
                  {addr.province}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex shrink-0 gap-1">
                {!addr.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr)}
                    disabled={settingDefaultId === addr._id}
                    className="rounded-md p-2 text-gray-400 hover:bg-gray-50 hover:text-[#0047AB] disabled:opacity-50"
                    title="Đặt làm mặc định"
                  >
                    <Star size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditingAddress(addr)}
                  className="rounded-md p-2 text-gray-400 hover:bg-gray-50 hover:text-[#0047AB]"
                  title="Sửa"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(addr)}
                  className="rounded-md p-2 text-red-400 hover:bg-red-50"
                  title="Xóa"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        )
      )}

      {/* Add New Address Trigger */}
      {showAddForm ? (
        <AddressForm
          onSuccess={() => setShowAddForm(false)}
          onCancel={() => setShowAddForm(false)}
        />
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowAddForm(true)}
          className="w-full border-dashed"
        >
          + Thêm địa chỉ mới
        </Button>
      )}

      {/* Deletion Confirmation Modal */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Xóa địa chỉ "{deleteTarget?.label}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AddressList;
