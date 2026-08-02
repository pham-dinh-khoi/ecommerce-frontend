import { useState } from 'react';
import { toast } from 'sonner';
import { Lock, Unlock, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import UserRoleBadge from './UserRoleBadge';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  adminUpdateUserThunk,
  adminDeleteUserThunk,
} from '@/features/user/userSlice';
import type { UserProfile, UserRole } from '@/types/user.types';

interface UserTableProps {
  users: UserProfile[];
}

/**
 * Configuration for user roles.
 * Used to map backend role strings to user-friendly labels.
 */
const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'seller', label: 'Seller' },
  { value: 'user', label: 'User' },
];

/**
 * Utility to format ISO dates to a localized Vietnamese string.
 */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

/**
 * UserTable Component
 *
 * Renders a data table to manage system users. Provides functionality for:
 * - Updating user roles
 * - Toggling user account status (active/inactive)
 * - Deleting user accounts
 * - Admin-specific actions (cannot modify/delete own account)
 */
function UserTable({ users }: UserTableProps) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  // Local state for UI interactivity
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  /**
   * Updates a user's role.
   * Dispatches an async thunk to the API and provides toast feedback.
   */
  const handleRoleChange = async (user: UserProfile, newRole: UserRole) => {
    setProcessingId(user._id);
    try {
      await dispatch(
        adminUpdateUserThunk({ id: user._id, payload: { role: newRole } })
      ).unwrap();
      toast.success(`Đã đổi vai trò của ${user.name} thành ${newRole}`);
    } catch (err) {
      if ((err as string)?.trim()) toast.error(err as string);
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * Toggles the 'isActive' status of a user.
   * Used to lock/unlock user accounts.
   */
  const handleToggleActive = async (user: UserProfile) => {
    setProcessingId(user._id);
    try {
      await dispatch(
        adminUpdateUserThunk({
          id: user._id,
          payload: { isActive: !user.isActive },
        })
      ).unwrap();
      toast.success(
        user.isActive
          ? `Đã khóa tài khoản ${user.name}`
          : `Đã mở khóa tài khoản ${user.name}`
      );
    } catch (err) {
      if ((err as string)?.trim()) toast.error(err as string);
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * Confirms and executes the deletion of a user account.
   */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(adminDeleteUserThunk(deleteTarget._id)).unwrap();
      toast.success(`Đã xóa tài khoản ${deleteTarget.name}`);
    } catch (err) {
      if ((err as string)?.trim()) toast.error(err as string);
    } finally {
      setDeleteTarget(null);
    }
  };

  // Render empty state if no users found
  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white py-16 text-center text-gray-400">
        Không tìm thấy người dùng nào
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-gray-500">
            <th className="px-4 py-3 font-medium">Người dùng</th>
            <th className="px-4 py-3 font-medium">Vai trò</th>
            <th className="px-4 py-3 font-medium">Trạng thái</th>
            <th className="px-4 py-3 font-medium">Ngày tạo</th>
            <th className="px-4 py-3 text-right font-medium">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isSelf = u._id === currentUser?.id;
            const isProcessing = processingId === u._id;

            return (
              <tr
                key={u._id}
                className="border-b border-gray-50 hover:bg-gray-50"
              >
                {/* User Info Column */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#0047AB] text-center text-sm font-medium leading-9 text-white">
                      {u.avatar?.url ? (
                        <img
                          src={u.avatar.url}
                          alt={u.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        u.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-[#1A1A1A]">
                        {u.name}{' '}
                        {isSelf && (
                          <span className="text-xs text-gray-400">(Bạn)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                </td>

                {/* Role Select Column */}
                <td className="px-4 py-3">
                  {isSelf ? (
                    <UserRoleBadge role={u.role} />
                  ) : (
                    <Select
                      value={u.role}
                      onValueChange={(val) =>
                        val && handleRoleChange(u, val as UserRole)
                      }
                      disabled={isProcessing}
                    >
                      <SelectTrigger className="h-8 w-28">
                        <SelectValue placeholder="Vai trò">
                          {(val: string) =>
                            roleOptions.find((r) => r.value === val)?.label ??
                            ''
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </td>

                {/* Status Badge Column */}
                <td className="px-4 py-3">
                  {u.isActive ? (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      Hoạt động
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600">
                      Đã khóa
                    </span>
                  )}
                </td>

                {/* Creation Date Column */}
                <td className="px-4 py-3 text-gray-500">
                  {formatDate(u.createdAt)}
                </td>

                {/* Action Buttons Column */}
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(u)}
                      disabled={isSelf || isProcessing}
                      className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-[#0047AB] disabled:cursor-not-allowed disabled:opacity-30"
                      title={
                        u.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'
                      }
                    >
                      {u.isActive ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(u)}
                      disabled={isSelf}
                      className="rounded-md p-2 text-red-400 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                      title="Xóa tài khoản"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Confirmation Dialog for User Deletion */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Xóa tài khoản "{deleteTarget?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Toàn bộ dữ liệu của người dùng
              sẽ bị xóa vĩnh viễn.
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

export default UserTable;
